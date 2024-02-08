const express = require("express");
const multer = require("multer");
const bookController = require("./controllers/bookController");
require("dotenv").config();

const app = express();
const port = 3001;
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app
  .route("/api/books")
  .get(bookController.getAllBooks)
  .post(bookController.setNewBook);
app.route("/api/books/byName/:name").get(bookController.getBookByName);
app.route("/api/books/byPrice/:price").get(bookController.getBookByPrice);
app
  .route("/upload-excel")
  .post(upload.single("file"), bookController.uploadBook);
app
  .route("/api/books/:id")
  .put(bookController.updateBook)
  .delete(bookController.deleteBook);
app.route("/api/authors").get(bookController.getAuthors);
app.route("/api/genres").get(bookController.getGenres);
app.route("/api/author/:name/books").get(bookController.getBooksByAuthor);
app.route("/api/genre/:genre/books").get(bookController.getBooksByGenre);

app.listen(port, () => {
  console.log(`App listening on ports ssssssss ${port}`);
});
