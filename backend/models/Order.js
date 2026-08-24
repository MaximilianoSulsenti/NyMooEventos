const mongoose = require('mongoose');

const PAYMENT_METHODS = ['mercado_pago', 'whatsapp_coordinar'];
const PAYMENT_STATUSES = ['Pendiente', 'Señado (50%)', 'Pagado Completo'];
const SOURCES = ['landing_page', 'carga_manual'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    clientData: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    eventData: {
      protagonists: { type: String, default: '' },
      eventType: { type: String, default: '' },
      date: { type: Date, default: null },
      time: { type: String, default: '' },
      locations: { type: String, default: '' },
    },
    designPresets: {
      theme: { type: String, default: '' },
      typography: { type: String, default: '' },
      primaryColor: { type: String, default: '' },
      secondaryColor: { type: String, default: '' },
      tertiaryColor: { type: String, default: '' },
      customBgInstructions: { type: String, default: '' },
    },
    guestCardDetails: {
      hasCost: { type: Boolean, default: false },
      // Texto libre a propósito (ej: "$15.000", "USD 20", "a confirmar") --
      // no todos los organizadores tienen un número cerrado todavía.
      pricePerCard: { type: String, default: '' },
      includesMenuDetails: { type: String, default: '' },
      paymentInstructions: { type: String, default: '' },
    },
    additionalInfo: {
      dressCode: { type: String, default: '' },
      bankDetails: { type: String, default: '' },
      importantTips: { type: String, default: '' },
    },
    packDetails: {
      packName: { type: String, required: true },
      // Nunca se toma del cliente -- lo calcula el backend a partir de
      // packName contra la lista de precios vigente (ver orderController).
      price: { type: Number, required: true },
    },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Pendiente' },
    source: { type: String, enum: SOURCES, default: 'landing_page' },
  },
  { timestamps: true }
);

orderSchema.statics.PAYMENT_METHODS = PAYMENT_METHODS;
orderSchema.statics.PAYMENT_STATUSES = PAYMENT_STATUSES;
orderSchema.statics.SOURCES = SOURCES;

module.exports = mongoose.model('Order', orderSchema);
