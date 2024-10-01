const express = require('express');
const router = express.Router();
const auth = require('../midleware/auth');
const userCtrl = require('../controller/userInformation');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;