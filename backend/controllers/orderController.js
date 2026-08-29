const Order = require('../models/Order');
const Counter = require('../models/Counter');
const { sendAdminOrderAlert } = require('../services/whatsappAdminAlert');

// Lista de precios vigente -- fuente de verdad del lado del servidor. El
// precio NUNCA se toma de lo que manda el cliente (se podría manipular
// desde las devtools); se recalcula acá a partir del nombre de cada
// producto. Hoy son los 4 packs de la landing (ver
// frontend/src/utils/landingConfig.js), pero el mapa está pensado para
// crecer con herramientas/juegos independientes más adelante.
const ITEM_PRICES = {
  'Nymoo INVITA': 50000,
  'Nymoo CONECTA': 70000,
  'Nymoo VIVE': 100000,
  'Nymoo VISIÓN': 60000,
  // Primera "herramienta" vendible sola o combinada con un pack (ver
  // LANDING_TOOLS en frontend/src/utils/landingConfig.js) -- entrega
  // inmediata porque no requiere diseño de invitación, solo activar
  // activeModules.tableOrganizer en el evento del cliente. El nombre
  // comercial es "Nymoo ORGANIZA" (organizador de mesas) -- ORGANIZA en
  // mayúsculas a propósito, mismo patrón que INVITA/CONECTA/VIVE/VISIÓN.
  'Nymoo ORGANIZA': 30000,
  // Segunda herramienta independiente: planificador de playlist y
  // cronograma musical -- activa activeModules.playlistOrganizer.
  'Nymoo RITMO': 30000,
  // Tercera herramienta independiente: agenda inteligente con recordatorios
  // automáticos por WhatsApp -- activa activeModules.smartAgenda.
  'Nymoo AGENDA': 30000,
};

// Invitación Dúo: clon de la invitación con datos propios (ver isDuo/duoOf
// en backend/models/Event.js), promocionada en la landing (ver DUO_INFO en
// frontend/src/components/landing/faqData.js) como "50% off sobre el pack
// principal contratado". No tiene precio propio en ITEM_PRICES porque
// depende de qué pack se compró junto -- se resuelve aparte en
// buildOrderPayload. VISIÓN queda afuera a propósito: no es un pack de
// invitación de pareja/festejo, es el módulo de pantalla en vivo suelto.
const DUO_ADDON_NAME = 'Invitación Dúo (50%)';
const DUO_ELIGIBLE_PACKS = ['Nymoo INVITA', 'Nymoo CONECTA', 'Nymoo VIVE'];
const DUO_DISCOUNT = 0.5;

// Motor de descuentos por combo de herramientas (ver ComboPromoBanner.jsx en
// el front para el copy comercial). Mismo trío de packs que DUO_ELIGIBLE_PACKS
// -- Nymoo VISIÓN queda afuera a propósito, no es "Pack de Invitación".
const COMBO_ELIGIBLE_PACKS = DUO_ELIGIBLE_PACKS;
const TOOL_NAMES = ['Nymoo ORGANIZA', 'Nymoo RITMO', 'Nymoo AGENDA'];
const TOOL_BASE_PRICE = 30000;

// Tasa de descuento sobre el precio base de CADA herramienta, según cuántas
// se compren juntas y si el pedido incluye algún pack de invitación:
//   Con pack:  1 herramienta = 10% | 2 = 20% | 3 = 30%
//   Sin pack:  1 herramienta = 0%  | 2 = 10% | 3 = 20%
// Para más de 3 (no existe hoy, pero por si se suma una 4ta más adelante)
// se mantiene la tasa del tramo más alto en vez de romper.
function toolsDiscountRate(toolCount, hasPack) {
  if (toolCount <= 0) return 0;
  const tiers = hasPack ? [0, 0.1, 0.2, 0.3] : [0, 0, 0.1, 0.2];
  return tiers[Math.min(toolCount, tiers.length - 1)];
}

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
        items: order.items.map((item) => ({
          title: `${item.name} - Nymoo Eventos Digitales`,
          quantity: 1,
          unit_price: item.price,
          currency_id: 'ARS',
        })),
        external_reference: order.orderNumber,
        back_urls: {
          success: `${clientUrl}/checkout/success?pedido=${encodeURIComponent(order.orderNumber)}`,
          pending: `${clientUrl}/checkout/success?pedido=${encodeURIComponent(order.orderNumber)}`,
          failure: `${clientUrl}/checkout`,
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
  const { clientData, eventData, designPresets, guestCardDetails, additionalInfo, items, paymentMethod } = body;

  // El cliente solo manda nombres -- el precio de cada uno se recalcula acá
  // contra ITEM_PRICES, nunca se toma de lo que venga en el body.
  const requestedNames = Array.isArray(items) ? items.map((item) => item?.name).filter(Boolean) : [];
  const uniqueNames = [...new Set(requestedNames)];
  if (uniqueNames.length === 0) {
    return { error: 'Elegí al menos un producto' };
  }

  const resolvedItems = [];
  for (const name of uniqueNames) {
    if (name === DUO_ADDON_NAME) continue; // se resuelve aparte, depende del pack base
    if (TOOL_NAMES.includes(name)) continue; // se resuelven aparte con su descuento de combo
    const price = ITEM_PRICES[name];
    if (!price) {
      return { error: `El producto "${name}" no es válido` };
    }
    resolvedItems.push({ name, price });
  }

  // Herramientas: el precio unitario final ya sale con el descuento de combo
  // aplicado (ver toolsDiscountRate) -- así el resto del flujo (totalPrice,
  // el line item que recibe Mercado Pago, lo que ve el admin en el panel de
  // pedidos) no necesita saber nada de la lógica de combos, solo suma
  // precios como siempre. El pack, si hay, ya quedó resuelto arriba a precio
  // de lista completo, intacto.
  const selectedTools = uniqueNames.filter((name) => TOOL_NAMES.includes(name));
  if (selectedTools.length > 0) {
    const hasPack = resolvedItems.some((item) => COMBO_ELIGIBLE_PACKS.includes(item.name));
    const rate = toolsDiscountRate(selectedTools.length, hasPack);
    const discountedUnitPrice = Math.round(TOOL_BASE_PRICE * (1 - rate));
    for (const name of selectedTools) {
      resolvedItems.push({ name, price: discountedUnitPrice });
    }
  }

  if (uniqueNames.includes(DUO_ADDON_NAME)) {
    const basePrices = resolvedItems.filter((item) => DUO_ELIGIBLE_PACKS.includes(item.name)).map((item) => item.price);
    if (basePrices.length === 0) {
      return { error: 'La Invitación Dúo necesita que también elijas Nymoo INVITA, CONECTA o VIVE' };
    }
    resolvedItems.push({ name: DUO_ADDON_NAME, price: Math.round(Math.max(...basePrices) * DUO_DISCOUNT) });
  }

  const totalPrice = resolvedItems.reduce((sum, item) => sum + item.price, 0);

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
      items: resolvedItems,
      totalPrice,
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

  // Fire-and-forget a propósito -- sin await: la alerta al admin no debe
  // frenar ni arriesgar la respuesta del checkout al cliente. Si Meta tarda
  // o falla, sendAdminOrderAlert ya atrapa sus propios errores y solo
  // loguea, nunca tira (ver whatsappAdminAlert.js).
  sendAdminOrderAlert(order).catch((err) => console.error('[WhatsApp] Alerta de pedido nuevo:', err.message));

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
  ITEM_PRICES,
};
