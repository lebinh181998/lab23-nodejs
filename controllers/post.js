const Post = require("../models/post");

//lấy tất cả post
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("user").sort({ createdAt: -1 });
    res.status(200).json({ status: true, posts: posts });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error server" });
  }
};

//lấy 1 post dựa vào postID
exports.getPost = async (req, res, next) => {
  try {
    const postID = req.params.postID;
    const post = await Post.findById(postID).populate("user");
    console.log(post);
    res.status(200).json({ status: true, post: post });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error server" });
  }
};
