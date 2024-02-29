const express = require("express");
const session = require("express-session");
const multer = require("multer");
const crypto = require("crypto");

const userController = require("./controllers/userController");
const bookController = require("./controllers/bookController");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { connectToDatabase } = require("./database/database");
const { checkUserRole } = require("./middlewares/checkUserRole");
const app = express();
// eslint-disable-next-line no-undef
const port = 3001;
const secretKey = crypto.randomBytes(32).toString("hex");
const managerMiddleware = checkUserRole(["manager"]);
const adminMiddleware = checkUserRole(["admin"]);
const adminOrManagerMiddleware = checkUserRole(["admin", "manager"]);

connectToDatabase();
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  }),
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/register", userController.register);
app.post("/api/login", userController.login);

app
  .route("/api/books")
  .get(bookController.getAllBooks)
  .post(adminOrManagerMiddleware, bookController.setNewBook);
app.route("/api/books/byName/:name").get(bookController.getBookByName);
app.route("/api/books/byPrice/:price").get(bookController.getBookByPrice);
app
  .route("/upload-excel")
  .post(upload.single("file"), bookController.uploadBook);
app
  .route("/api/books/:id")
  .put(adminOrManagerMiddleware, bookController.updateBook)
  .delete(adminMiddleware, bookController.deleteBook);
app.route("/api/authors").get(bookController.getAuthors);
app.route("/api/genres").get(bookController.getGenres);
app.route("/api/author/:name/books").get(bookController.getBooksByAuthor);
app.route("/api/genre/:genre/books").get(bookController.getBooksByGenre);

app.listen(port, "127.0.0.1", () => {
  console.log(`App listening on ports ssssssss ${port}`);
});
