var express = require("express");
var http = require("http");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var usersRouter = require("./routes/users");
var authenticate = require("./authenticate");
var cors = require("cors");
const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/meme_generator";

const connect = mongoose.connect(url);

connect.then(
  (db) => {
    console.log("connected correctly to mongo");
  },
  (err) => console.log("connection error mongo", err)
);

var app = express();

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", usersRouter);

function auth(req, res, next) {
  console.log("auth");
  if (!req.user) {
    var err = new Error("You are not authenticated");
    err.status = 403;
    return next(err);
  } else {
    next();
  }
}
app.use(auth);

/*app.use((req, res) => {
  res.status(200);
  res.end("hello");
});*/
const server = http.createServer(app);
server.listen(5000, "localhost", () => {
  console.log(`listening`);
});
