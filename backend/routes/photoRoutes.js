const express = require('express');
const {
  signUpload,
  registerPhoto,
  getApprovedPhotosBySlug,
  getPhotosForClient,
  updatePhotoStatus,
} = require('../controllers/photoController');
const { requireClientToken } = require('../middleware/clientAccess');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/sign/:eventSlug', publicWriteLimiter, signUpload);
router.post('/register', publicWriteLimiter, registerPhoto);
router.get('/slug/:eventSlug', getApprovedPhotosBySlug);
router.get('/client/:eventSlug', requireClientToken, getPhotosForClient);
router.patch('/client/:eventSlug/:photoId/status', requireClientToken, updatePhotoStatus);

module.exports = router;
