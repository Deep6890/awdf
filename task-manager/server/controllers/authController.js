const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /register
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /me (protected)
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  me
};
