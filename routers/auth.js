const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter an email")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Email has already existed");
        }
        return true;
      }),
    body("name", "Please enter field name").trim().isLength({ min: 1 }),
    body("password", "Please enter field password").trim().isLength({ min: 1 }),
  ],
  authController.createUser
);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter an email")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) {
          return Promise.reject("Email is not exist");
        }
        return true;
      }),
    body("password", "Please enter field password").trim().isLength({ min: 1 }),
  ],
  authController.login
);

// router.get("/check-login", authController.checkLogin);

module.exports = router;
