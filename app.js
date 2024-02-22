const express = require("express");
const multer = require("multer");
const bookController = require("./controllers/bookController");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const logger = require("./utils/logger");

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001;
app.use((req, res, next) => {
  try {
    const route = req.originalUrl;
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    logger.log("info", route, ipAddress, "Request received");

    next();
  } catch (error) {
    logger.error(
      req.originalUrl,
      req.ip,
      `Error logging request: ${error.message}`,
    );
    next();
  }
});

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.listen(PORT, () => {
  console.log(`App listening on ports ssssssss ${PORT}`);
});
