const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/db.js');
const path = require('path');
const signup = require('./routes/signup.js');
const signin = require('./routes/sign.js');

dotenv.config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 5000;

const static_path = path.join(__dirname);
app.use(express.static(static_path));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/signup', signup);
app.use('/api/signin', signin);
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.ENV} listening to ${PORT}`);
});
