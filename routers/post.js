const express = require("express");
const router = express.Router();
const isAuth = require("../util/jwt");

const postController = require("../controllers/post");

router.get("/posts", isAuth, postController.getPosts);
router.get("/posts/:postID", isAuth, postController.getPost);

module.exports = router;
