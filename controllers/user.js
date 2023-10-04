const Post = require("../models/post");
const { validationResult } = require("express-validator");
const fs = require("fs");
const io = require("../util/socket");
const User = require("../models/user");

//tạo post
exports.createPost = async (req, res, next) => {
  const errorResults = validationResult(req);
  const errors = errorResults.array();
  const image = req.file;
  //kiểm tra image có tồn tại
  //không: tạo lỗi để phản hồi
  if (!image) {
    errors.push({ path: "image", msg: "Please choose an image" });
  }
  //kiểm tra mảng errors từ validationResult
  //có: gửi phản hồi về các lỗi
  if (errors.length > 0) {
    // let errorInputs = [];
    // errors.map((error) => (errorInputs = [...errorInputs, error.path]));
    return res.status(422).json({
      status: false,
      message: errors[0].msg,
      //   errorInputs: errorInputs,
    });
  }
  //không có lỗi thì thực hiện thêm post vào DB
  try {
    const body = req.body;
    const post = new Post({
      title: body.title,
      image: image.path.replace("\\", "/"),
      content: body.content,
      user: req.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await post.save();
    const user = await User.findById(req.userId);
    post.user = user;
    io.getIO().emit("posts", { action: "create", post: post });

    res.status(200).json({ status: true, post: post });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: false, message: "Error server" });
  }
};

//sửa 1 post dựa vào postID
exports.editPost = async (req, res, next) => {
  const errorResults = validationResult(req);
  const errors = errorResults.array();
  //kiểm tra mảng errors từ validationResult
  //có: gửi phản hồi về các lỗi
  if (errors.length > 0) {
    return res.status(422).json({
      status: false,
      message: errors[0].msg,
    });
  }
  //không có lỗi thì thực hiện thêm post vào DB
  try {
    const body = req.body;
    const postID = body.postID;
    const image = req.file;
    const updatedTitle = body.title;
    const updatedContent = body.content;

    const post = await Post.findById(postID).populate("user");
    post.title = updatedTitle;
    if (image) {
      fs.unlink(post.image, (err) => {
        console.log(err);
      });
      post.image = image.path.replace("\\", "/");
    }
    post.content = updatedContent;
    post.updatedAt = new Date();

    if (req.userId.toString() !== post.user._id.toString()) {
      console.log(req.userId, post.user._id);
      return res.status(403).json({ status: false, message: "Not authorized" });
    }

    await post.save();
    io.getIO().emit("posts", { action: "update", post: post });

    res.status(200).json({ status: true, post: post });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: false, message: "Error server" });
  }
};

//xoá 1 post dựa vào postID
exports.deletePost = async (req, res, next) => {
  try {
    const postID = req.params.postID;
    const post = await Post.findById(postID).populate("user");

    if (!post) {
      return res.status(422).json({ status: false, message: "not found post" });
    }

    if (req.userId.toString() !== post.user._id.toString()) {
      return res.status(403).json({ status: false, message: "Not authorized" });
    }

    fs.unlink(post.image, (err) => {
      console.log(err);
    });

    await Post.findByIdAndRemove(postID);
    io.getIO().emit("posts", { action: "delete", post: post });

    res.status(200).json({ status: true, post: post });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error server" });
  }
};
