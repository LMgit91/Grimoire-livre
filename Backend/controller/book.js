//const { error } = require('console');
const Book = require('../models/Book');
const fs = require('fs');

//Call all books from the API
exports.getAllBooks = (req, res) => {
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
exports.getOneBooks = (req, res) => {
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
exports.getBestBooks = (req, res) => {
  Book.find().sort({averageRating : -1}).limit(3)
    .then(book => res.status(200).json(book)
    ).catch((error) => res.status(400).json({error}))
    
  }

//Allow to add new book on the repertory
exports.addBooks = (req, res) => {
    //On récupère tous les les éléments que l'on parse.
    const bookObj = JSON.parse(req.body.book);
    delete bookObj._id;
    delete bookObj._userId;
    //Création d'un nouveau book auquel on ajoute userId(celui qui donne l'autorisation d'ajouter des éléments) et l'image.
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
exports.deleteBooks =  (req, res) => {
  //on cherche le book a effacé
    Book.findOne({_id : req.params.id})
    .then(book => {
      //On vérifie que l'userId est bon
      if(book.userId != req.auth.userId){
        res.status(401).json({message: 'Not authorized'})
      }else{
        //on se sert de la librairie fs pour effacés les fichiers dans le dossier image.
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({_id : req.params.id})
          .then(() => { res.status(200).json({message: 'Le livre a bien été supprimé!'})})
          .catch((error) => { res.status(401).json({ error })})
         });
      }
    })
    .catch(error => res.status(500).json({ error }));
  }

//Allow to modify book
exports.modifyBooks = (req, res) => {
  //il y a deux cas si téléchargement de fichier ou non, si il y a téléchargement on ajoute la nouvelle image url.
  const bookObj = req.file ? {...JSON.parse(req.body.book), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`} : {...req.body};
  //On efface le userId qui n'est pas fiable.
  delete bookObj._userId;
  Book.findOne({_id : req.params.id}).then((book) => {
    //on s'assure que l'utilisateur a le droit de faire ces modifications si oui on ajoute les modifications
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

//Allow to post a rate on a book

exports.addRating = async(req, res) => {
  
	const rating = req.body.rating;
 //On s'assure que le rating est bien compris entre 0 et 5.
	if (rating < 1 || rating > 5) {
		return res.status(400).json({ error: "The grade should be betwwen 0 and 5" });
	}

	try {
		//On vérifie si l'utilisateur n'a pas déjà noté le livre.
		const book = await Book.findById(req.params.id);
		const newArray = book.ratings.map((item) => item.userId);
      if(newArray.includes(req.auth.userId)){
        res.status(401).json({error: 'Unauthorized, user have already grade this book'});
      }

		//Updating du book en ajoutant le grade et userId.
		const updateRating = await Book.findByIdAndUpdate(
			req.params.id,
			{
				$push: { ratings: { userId: req.auth.userId, grade: rating } },
			},
			{ returnOriginal: false }
		);

		//Calcul à l'aide du reduce de la nouvelle valeur de averageRating et mise à jour
		const numberOfRate = updateRating.ratings.length;
		const sumOfRate = updateRating.ratings.reduce((acc, item) => acc + item.grade, 0);
		updateRating.averageRating = (sumOfRate / numberOfRate).toFixed(0);

		await updateRating.save();
		return res.json(updateRating);
	} catch (error) {
		return res.status(500).json({ error });
	}

        
  } 