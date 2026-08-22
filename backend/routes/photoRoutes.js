const express = require('express');
const {
  signUpload,
  registerPhoto,
  getApprovedPhotosBySlug,
  getPhotosForClient,
  updatePhotoStatus,
  deletePhoto,
  getAlbumZipUrl,
} = require('../controllers/photoController');
const { requireClientToken } = require('../middleware/clientAccess');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/sign/:eventSlug', publicWriteLimiter, signUpload);
router.post('/register', publicWriteLimiter, registerPhoto);
router.get('/slug/:eventSlug', getApprovedPhotosBySlug);
router.get('/client/:eventSlug', requireClientToken, getPhotosForClient);
router.patch('/client/:eventSlug/:photoId/status', requireClientToken, updatePhotoStatus);
router.delete('/client/:eventSlug/:photoId', requireClientToken, deletePhoto);
router.get('/client/:eventSlug/album-zip', requireClientToken, getAlbumZipUrl);

module.exports = router;
