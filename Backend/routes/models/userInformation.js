const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userInfoSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})

userInfoSchema.plugin(uniqueValidator);

module.exports = mongoose.model('userInformation', userInfoSchema);