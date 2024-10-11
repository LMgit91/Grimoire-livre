const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const imageResizing = (req, res, next) => {
    if(req.file){
        const newFileName = req.file.filename.replace(/\.[^.]+$/, '.webp');
        const newPath = path.join('images', newFileName);

         sharp(req.file.path)
        .resize( 206, 260, {fit: 'cover'})
        .webp({quality: 60})
        .toFile(newPath, (err, info) => {
            if(err){
                console.log(err);
                return res.status(500).json({error: 'Une erreur est survenu lors du traitement de image'});
            }
            fs.unlink(req.file.path, (err) => {
                if(err){
                    console.error('erreur survenu lors de l\'opération ' + err);
                    console.log(req.file.path);
                }else{
                    console.log('L\image originale a bien été effacée');
                    }
                });
                req.file.filename = newFileName;
                next();
            });
    }else{
        next();
    }
};

module.exports = imageResizing;