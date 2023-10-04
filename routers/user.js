const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/user");
const isAuth = require("../util/jwt");

router.post(
  "/new-post",
  isAuth,
  [
    body("title")
      .trim()
      .custom(async (value, { req }) => {
        if (value === "") {
          new Promise.reject("Please enter title");
        }
        return true;
      }),
    body("content")
      .trim()
      .custom(async (value, { req }) => {
        if (value === "") {
          new Promise.reject("Please enter content");
        }
        return true;
      }),
  ],
  userController.createPost
);
router.post(
  "/edit-post",
  isAuth,
  [
    body("title")
      .trim()
      .custom(async (value, { req }) => {
        if (value === "") {
          new Promise.reject("Please enter title");
        }
        return true;
      }),
    body("content")
      .trim()
      .custom(async (value, { req }) => {
        if (value === "") {
          new Promise.reject("Please enter content");
        }
        return true;
      }),
  ],
  userController.editPost
);

router.delete("/delete-post/:postID", isAuth, userController.deletePost);

module.exports = router;
