const { error } = require('console');
const Book = require('../models/book');
const fs = require('fs');
//Call all books from the API
exports.getAllBooks = (req, res, next) => {
    Book.find().then(
        (books) => {
          res.status(200).json(books);
        }
      ).catch(
        (error) => {
          res.status(400).json({
            error: error
          });
        }
      );
}

//Call one book from the API
exports.getOneBooks = (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  }

//Call the three best book of the repertory
exports.getBestBooks = (req, res, next) => {
    Book.find().sort({averageRating : -1}).limit(3)
      .then((books) => {
        res.status(200).json(books);
    }).catch((error) => {
        res.status(400).json({
            error
          });
      })
}

//Allow to add new book on the repertory
exports.addBooks = (req, res, next) => {
    const bookObj = JSON.parse(req.body.book);
    delete bookObj._id;
    delete bookObj._userId;
    const book = new Book({
        ...bookObj,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'Le nouveau livre a bien été crée!'})})
    .catch(error => { res.status(400).json( { error })})
 };

//Allow to delete book
exports.deleteBooks =  (req, res, next) => {
    Book.findOne({_id : req.params.id})
    .then(book => {
      if(book.userId != req.auth.userId){
        res.status(401).json({message: 'Not authorized'})
      }else{
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({_id : userId.params.id})
          .then(() => { res.status(200).json({message: 'Le livre a bien été supprimé!'})})
          .catch((error) => { res.status(401).json({ error })})
         });
      }
    })
    .catch(error => res.status(500).json({ error }));
  }

//Allow to modify book
exports.modifyBooks = (req, res, next) => {
   const bookObj = req.file ? {...JSON.parse(req.body.book), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`} : {...req.body};
   delete bookObj._userId;
   Book.findOne({_id : req.params.id}).then((book) => {
    if (book.userId != req.auth.userId) {
        res.status(401).json({ message : 'Not authorized'});
    }else {
        Book.updateOne({ _id: req.params.id}, { ...bookObj, _id: req.params.id})
        .then(() => res.status(200).json({message : 'Objet modifié!'}))
        .catch(error => res.status(401).json({ error }));
    }
  })
  .catch((error) => {
    res.status(400).json({ error });
  });
}