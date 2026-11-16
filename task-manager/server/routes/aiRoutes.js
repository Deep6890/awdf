const express = require('express');
const router = express.Router();

const { handleGenerateDescription } = require('../controllers/aiController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const aiRateLimit = require('../middleware/aiRateLimit');

// Protected AI endpoint
router.post(
  '/generate-description',
  auth,
  validate({
    title: { required: true, max: 100 }
  }),
  aiRateLimit,
  handleGenerateDescription
);

module.exports = router;
