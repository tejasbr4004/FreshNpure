const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user.js');

//POST Sends the details of the new user and generates token
//POST http://localhost:5000/api/signup
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Enter a valid email address').isEmail(),
    check('password', 'Password must be minimum of 6 characters').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'user already exists' }] });
      }
      user = new User({
        name,
        email,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      const subPath = path.join(__dirname, '../registrationSubmit.html');
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      const secretKey = process.env.SECRET_KEY;
      const payload = {
        user: {
          name: user.name,
          email: user.email,
        },
      };
      jwt.sign(payload, secretKey, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.sendFile(subPath);
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
