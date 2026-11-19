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
const { photoUploadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/sign/:eventSlug', photoUploadLimiter, signUpload);
router.post('/register', photoUploadLimiter, registerPhoto);
router.get('/slug/:eventSlug', getApprovedPhotosBySlug);
router.get('/client/:eventSlug', requireClientToken, getPhotosForClient);
router.patch('/client/:eventSlug/:photoId/status', requireClientToken, updatePhotoStatus);
router.delete('/client/:eventSlug/:photoId', requireClientToken, deletePhoto);
router.get('/client/:eventSlug/album-zip', requireClientToken, getAlbumZipUrl);

module.exports = router;
