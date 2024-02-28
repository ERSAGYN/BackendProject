const express = require("express");
const multer = require("multer");
const userController = require("./controllers/userController");
const bookController = require("./controllers/bookController");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const logger = require("./utils/logger");

const app = express();
const port = 3001;
app.use((req, res, next) => {
  try {
    const route = req.originalUrl;
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
    // Log the request information at the info level
    logger.info(route, ipAddress, "Request received");

    // Continue to the next middleware
    next();
  } catch (error) {
    // Handle any potential error during logging
    // Log the error at a higher level (e.g., warn or error)
    logger.error(
      req.originalUrl,
      req.ip,
      `Error logging request: ${error.message}`,
    );

    // Continue to the next middleware despite the logging error
    next();
  }
});

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/register", userController.register);
app.post("/api/login", userController.login);

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

app.listen(port, "127.0.0.1", () => {
  console.log(`App listening on ports ssssssss ${port}`);
});
