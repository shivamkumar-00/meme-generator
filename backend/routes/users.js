var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
const storage = require("node-sessionstorage");
var router = express.Router();
router.use(bodyParser.json());

router.get("/", function (req, res, next) {
  if (storage.getItem("username") !== undefined) {
    console.log(storage.getItem("username"), storage.getItem("password"));
    User.find({ username: storage.getItem("username") })
      .then((user) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          user: storage.getItem("username"),
          password: storage.getItem("password"),
          images: user[0].images,
        });
      })
      .catch((err) => console.log("get endpoint problem"));
  } else {
    console.log("get errror");
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end();
  }
});

router.post("/signup", (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Registration UnSuccessfull", err: err });
      } else {
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ status: "Registration Successful", user: user });
        });
      }
    }
  );
});

router.post("/login", passport.authenticate("local"), (req, res, next2) => {
  storage.setItem("username", req.body.username);
  storage.setItem("password", req.body.password);
  console.log("Login detected", req.session);
  User.find({ username: req.body.username })
    .then((users) => {
      res.setStatusCode = 200;
      res.setHeader("Content-Type", "application/json");

      res.json(users);
    })
    .catch((err) => console.log(err));
});
router.post("/add", (req, res, next) => {
  var im;
  User.find({ username: req.body.username })
    .then((user) => {
      im = user[0].images;
      console.log(im.length);
      im.push(req.body.data);
      console.log(im.length);

      try {
        User.updateOne(
          { username: req.body.username },
          { $set: { images: im } }
        )
          .then((result) => console.log("result", result))
          .catch((err) => console.log("error", err));
        console.log("result", result);
      } catch (e) {
        console.log("findoneandupdate error");
      }
    })
    .catch((err) => console.log(err));

  res.setStatusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end();
});

router.post("/delete", (req, res, next) => {
  var u = storage.getItem("username");
  console.log(u);
  var ims,
    r = [],
    i = 0,
    index = parseInt(req.body.index);
  console.log("index", index);
  User.find({ username: u })
    .then((user) => {
      ims = user[0].images;
      console.log("before delete", ims.length);
      ims.map((im) => {
        if (i !== index) r.push(im);
        i++;
      });
      console.log("after delete", r.length, u);
      User.updateOne({ username: u }, { $set: { images: r } })
        .then((result) => console.log("done delete"))
        .catch((err) => console.log("err in updateone"));
    })
    .catch((err) => console.log("err in find"));

  res.setStatusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end();
});

router.get("/logout", (req, res, next2) => {
  storage.removeItem("username");
  storage.removeItem("password");
  res.setStatusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end();
});

module.exports = router;
