const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../config/authMiddleware.js');
const path = require('path');
//GET the details of the user basesd on the token
//GET :: http://localhost:5000/api/signin
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//POST Sign in route if the credentials are correct token is generated
//POST http://localhost:5000/api/signin
router.post(
  '/',
  [
    check('email', 'Enter a valid email address').isEmail(),
    check('password', 'Password field cannot be empty').not().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const dir_path = path.join(__dirname, '../loginSubmit.html');
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) res.status(400).json({ msg: 'email not registerd' });
      const isVaild = await bcrypt.compare(password, user.password);
      if (!isVaild) res.status(400).json({ msg: 'Enter a correct password' });
      else if (isVaild) {
        const payload = {
          user: {
            id: user.id,
          },
        };
        const secretKey = process.env.SECRET_KEY;
        jwt.sign(
          payload,
          secretKey,
          { expiresIn: 36000 },
          async (err, token) => {
            if (err) throw err;
            res.sendFile(dir_path);
          }
        );
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

module.exports = router;
