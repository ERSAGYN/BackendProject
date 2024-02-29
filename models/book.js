const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  id: { type: Number, default: 0 }, // Adjust default value as needed
  Name: { type: String, maxlength: 255 },
  Author: { type: String, maxlength: 1024 },
  Genres: { type: String, maxlength: 255 },
  PagesCount: { type: Number },
  Price: { type: Number },
  PublishYear: { type: Number },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
