const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controller");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").not().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

router.post(
  "/login",
  [
    check("email").not().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.login
);

module.exports = router;
