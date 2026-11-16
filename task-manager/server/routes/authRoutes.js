const express = require('express');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/register',
  validate({
    email: 'email',
    password: { required: true, min: 6 }
  }),
  register
);

router.post(
  '/login',
  validate({
    email: 'email',
    password: { required: true }
  }),
  login
);

router.get('/me', auth, me);

module.exports = router;
