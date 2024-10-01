const express = require('express');
const auth = require('../midleware/auth')
const objControl = require('../controller/book');
const router = express.Router();
const multer = require('../midleware/multerFile');
//These are the road of our API

router.get('/', objControl.getAllBooks);
router.get('/:id', objControl.getOneBooks);
router.get('/bestrating', objControl.getBestBooks);
router.post('/', auth, multer, objControl.addBooks);
router.delete('/:id', auth, objControl.deleteBooks);
router.put('/:id', auth, multer, objControl.modifyBooks);


module.exports = router;