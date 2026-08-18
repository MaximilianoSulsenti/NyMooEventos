const Event = require('../models/Event');

async function getEventBySlug(req, res) {
  const { eventSlug } = req.params;

  const event = await Event.findOne({ eventSlug }).select(
    'eventName eventSlug date activeModules'
  );

  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  res.json(event);
}

async function listMyEvents(req, res) {
  const events = await Event.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
  res.json(events);
}

async function createEvent(req, res) {
  const { eventName, eventSlug, date } = req.body;

  if (!eventName || !eventSlug || !date) {
    return res.status(400).json({ message: 'eventName, eventSlug y date son requeridos' });
  }

  const existing = await Event.findOne({ eventSlug });
  if (existing) {
    return res.status(409).json({ message: 'Ya existe un evento con ese slug' });
  }

  const event = await Event.create({
    organizerId: req.user._id,
    eventName,
    eventSlug,
    date,
    gallerySettings: { cloudinaryFolder: `eventos/${eventSlug}` },
  });

  res.status(201).json(event);
}

async function getEventById(req, res) {
  const event = req.event;
  res.json(event);
}

async function updateEventModules(req, res) {
  const { eventId } = req.params;
  const { interactiveCard, liveGallery, guestControl } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  if (interactiveCard !== undefined) event.activeModules.interactiveCard = interactiveCard;
  if (liveGallery !== undefined) event.activeModules.liveGallery = liveGallery;
  if (guestControl !== undefined) event.activeModules.guestControl = guestControl;

  await event.save();

  res.json(event);
}

module.exports = {
  getEventBySlug,
  listMyEvents,
  createEvent,
  getEventById,
  updateEventModules,
};
