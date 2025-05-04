const express = require('express');
const auth = require('../midleware/auth')
const objControl = require('../controller/Book');
const router = express.Router();
const multer = require('../midleware/multerFile');
const imageResizing = require('../midleware/sharp-use');
//These are the road of our API

router.get('/bestrating', objControl.getBestBooks);
router.get('/', objControl.getAllBooks);
router.get('/:id', objControl.getOneBooks);
router.post('/', auth, multer, imageResizing, objControl.addBooks);
router.post('/:id/rating', auth, objControl.addRating);
router.delete('/:id', auth, objControl.deleteBooks);
router.put('/:id', auth, multer, imageResizing, objControl.modifyBooks);


module.exports = router;
