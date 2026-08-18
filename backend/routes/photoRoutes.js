const express = require('express');
const { signUpload, registerPhoto } = require('../controllers/photoController');
const { publicWriteLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/sign/:eventSlug', publicWriteLimiter, signUpload);
router.post('/register', publicWriteLimiter, registerPhoto);

module.exports = router;
