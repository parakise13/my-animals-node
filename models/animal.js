const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const animalSchema = new Schema({
    animalName: { type: String, required: true },
    species: { type: String, required: true },
    age: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model("Animal", animalSchema);
