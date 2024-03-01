const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;

const userController = require("./controllers/userController");
const bookController = require("./controllers/bookController");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { connectToDatabase } = require("./database/database");
const { checkUserRole } = require("./middlewares/checkUserRole");
const path = require("path");
const User = require("./models/user");
const app = express();
// eslint-disable-next-line no-undef
const port = 3001;
const secretKey = [crypto.randomBytes(32).toString("hex")];
const adminMiddleware = checkUserRole(["admin"]);
const adminOrManagerMiddleware = checkUserRole(["admin", "manager"]);

connectToDatabase();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  session({
    name: "session",
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

passport.use(
  new GitHubStrategy(
    {
      clientID: "cff268e9c674d201418d",
      clientSecret: "6376f0d2a83870f23e8bfa2c90b7274b91724a85",
      callbackURL: "http://localhost:3001/auth/github/callback",
      scope: ["user:email"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    },
  ),
);

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/api/loginByGithub");
  },
);

passport.serializeUser((user, done) => {
  const userEmails = user.emails ? user.emails.map((email) => email.value) : [];
  done(null, { id: user.id, emails: userEmails });
});

passport.deserializeUser((serializedUser, done) => {
  // Use the serialized user's ID to look up the user in your database
  User.findOne({ email: serializedUser.emails })
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.post("/api/register", userController.register);
app.post("/api/login", userController.login);
app.post("/api/updatePassword", userController.updatePassword);
app.post("/api/passwordRecovery", userController.passwordRecovery);

app.get("/api/loginByGithub", userController.loginByGithubPage);
app.get("/api/register", userController.registerPage);
app.get("/api/recovery", userController.recoveryPage);
app.get("/api/login", userController.loginPage);

app.get("/api/confirmRecoveryCode", userController.confirmRecoveryCodePage);

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
