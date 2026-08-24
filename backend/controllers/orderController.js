const Order = require('../models/Order');
const Counter = require('../models/Counter');

// Lista de precios vigente -- fuente de verdad del lado del servidor. El
// precio NUNCA se toma de lo que manda el cliente (se podría manipular
// desde las devtools); se recalcula acá a partir del nombre del pack, igual
// que los 4 packs reales de la landing (ver frontend/src/utils/landingConfig.js).
const PACK_PRICES = {
  'Nymoo INVITA': 50000,
  'Nymoo CONECTA': 70000,
  'Nymoo VIVE': 100000,
  'Nymoo VISIÓN': 60000,
};

async function nextOrderNumber() {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { key: `order-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `#NYM-${year}-${String(counter.seq).padStart(3, '0')}`;
}

// El SDK de Mercado Pago se inicializa solo si hay credenciales reales
// configuradas -- todavía no las hay, así que esto queda listo para
// activarse el día que existan sin tocar nada más del flujo (el checkout ya
// contempla el fallback a WhatsApp cuando `mercadoPagoReady` es false).
let mpPreferenceClient = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  try {
    // eslint-disable-next-line global-require
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    mpPreferenceClient = new Preference(client);
  } catch (err) {
    console.error('[MercadoPago] No se pudo inicializar el SDK:', err.message);
  }
}

function getClientUrl() {
  const first = (process.env.CLIENT_URL || '').split(',')[0]?.trim();
  return first || 'http://localhost:5173';
}

async function createMercadoPagoRedirect(order) {
  if (!mpPreferenceClient) return null;

  try {
    const clientUrl = getClientUrl();
    const result = await mpPreferenceClient.create({
      body: {
        items: [
          {
            title: `${order.packDetails.packName} - Nymoo Eventos Digitales`,
            quantity: 1,
            unit_price: order.packDetails.price,
            currency_id: 'ARS',
          },
        ],
        external_reference: order.orderNumber,
        back_urls: {
          success: `${clientUrl}/checkout/success?pedido=${encodeURIComponent(order.orderNumber)}`,
          pending: `${clientUrl}/checkout/success?pedido=${encodeURIComponent(order.orderNumber)}`,
          failure: `${clientUrl}/checkout?pack=${encodeURIComponent(order.packDetails.packName)}`,
        },
        auto_return: 'approved',
      },
    });
    return result.init_point || null;
  } catch (err) {
    console.error('[MercadoPago] No se pudo crear la preferencia de pago:', err.message);
    return null;
  }
}

function buildOrderPayload(body) {
  const { clientData, eventData, designPresets, guestCardDetails, additionalInfo, packDetails, paymentMethod } = body;

  const packName = packDetails?.packName;
  const price = PACK_PRICES[packName];
  if (!price) {
    return { error: 'El pack elegido no es válido' };
  }
  if (!clientData?.name?.trim()) {
    return { error: 'El nombre es requerido' };
  }
  if (!Order.PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: 'Método de pago inválido' };
  }

  return {
    payload: {
      clientData: {
        name: clientData.name.trim(),
        phone: (clientData.phone || '').trim(),
        email: (clientData.email || '').trim(),
      },
      eventData: {
        protagonists: eventData?.protagonists || '',
        eventType: eventData?.eventType || '',
        date: eventData?.date || null,
        time: eventData?.time || '',
        locations: eventData?.locations || '',
      },
      designPresets: {
        theme: designPresets?.theme || '',
        typography: designPresets?.typography || '',
        primaryColor: designPresets?.primaryColor || '',
        secondaryColor: designPresets?.secondaryColor || '',
        tertiaryColor: designPresets?.tertiaryColor || '',
        customBgInstructions: designPresets?.customBgInstructions || '',
      },
      guestCardDetails: {
        hasCost: Boolean(guestCardDetails?.hasCost),
        pricePerCard: guestCardDetails?.hasCost ? String(guestCardDetails?.pricePerCard || '').slice(0, 120) : '',
        includesMenuDetails: guestCardDetails?.includesMenuDetails || '',
        paymentInstructions: guestCardDetails?.paymentInstructions || '',
      },
      additionalInfo: {
        dressCode: additionalInfo?.dressCode || '',
        bankDetails: additionalInfo?.bankDetails || '',
        importantTips: additionalInfo?.importantTips || '',
      },
      packDetails: { packName, price },
      paymentMethod,
    },
  };
}

// Checkout público desde la landing.
async function createOrder(req, res) {
  const { payload, error } = buildOrderPayload(req.body);
  if (error) return res.status(400).json({ message: error });

  const orderNumber = await nextOrderNumber();
  const order = await Order.create({ ...payload, orderNumber, source: 'landing_page' });

  const redirectUrl = order.paymentMethod === 'mercado_pago' ? await createMercadoPagoRedirect(order) : null;

  res.status(201).json({ order, redirectUrl });
}

// Formulario público para compartir por WhatsApp/Instagram/etc. cuando la
// venta ya se cerró por fuera de la web -- en vez de que el equipo tipee los
// datos del cliente a mano (como en createManualOrder), el cliente completa
// sus propios datos de evento y estética. No pide método de pago (ya se
// coordinó aparte) y el estado siempre entra en Pendiente: el equipo lo
// confirma desde el panel una vez que revisa el pedido.
async function createSharedOrderForm(req, res) {
  const { payload, error } = buildOrderPayload({ ...req.body, paymentMethod: 'whatsapp_coordinar' });
  if (error) return res.status(400).json({ message: error });

  const orderNumber = await nextOrderNumber();
  const order = await Order.create({
    ...payload,
    orderNumber,
    source: 'formulario_compartido',
    paymentStatus: 'Pendiente',
  });

  res.status(201).json({ order });
}

// Carga manual de un pedido cerrado por fuera de la web (efectivo,
// transferencia directa, etc.) -- solo el equipo de Nymoo, y acá sí se
// puede fijar el estado de pago de una porque ya se sabe cómo cerró.
async function createManualOrder(req, res) {
  const { payload, error } = buildOrderPayload(req.body);
  if (error) return res.status(400).json({ message: error });

  const { paymentStatus } = req.body;
  const orderNumber = await nextOrderNumber();
  const order = await Order.create({
    ...payload,
    orderNumber,
    source: 'carga_manual',
    paymentStatus: Order.PAYMENT_STATUSES.includes(paymentStatus) ? paymentStatus : 'Pendiente',
  });

  res.status(201).json({ order });
}

async function listOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
}

async function updateOrderStatus(req, res) {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  if (!Order.PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json({ message: 'Estado de pago inválido' });
  }

  const order = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
  if (!order) {
    return res.status(404).json({ message: 'Pedido no encontrado' });
  }

  res.json(order);
}

// Archivar/desarchivar -- para pedidos que quedaron en Pendiente y nunca se
// concretaron. No borra nada, solo lo saca de la vista activa del panel.
async function updateOrderArchive(req, res) {
  const { orderId } = req.params;
  const archived = Boolean(req.body.archived);

  const order = await Order.findByIdAndUpdate(orderId, { archived }, { new: true });
  if (!order) {
    return res.status(404).json({ message: 'Pedido no encontrado' });
  }

  res.json(order);
}

module.exports = {
  createOrder,
  createSharedOrderForm,
  createManualOrder,
  listOrders,
  updateOrderStatus,
  updateOrderArchive,
  PACK_PRICES,
};
