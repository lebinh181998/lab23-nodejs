const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//tạo user
exports.createUser = async (req, res, next) => {
  const errorResults = validationResult(req);
  const errors = errorResults.array();
  //kiểm tra mảng errors từ validationRéult
  //có: gửi phản hồi các lỗi
  if (errors.length > 0) {
    return res.status(422).json({ status: false, message: errors[0].msg });
  }
  //không có lỗi thì tạo user
  try {
    const body = req.body;
    const password = await bcrypt.hash(body.password, 12);
    const user = new User({
      email: body.email,
      name: body.name,
      password: password,
    });
    await user.save();
    res.status(200).json({ status: true, message: "created a new user" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error server" });
  }
};

//login
exports.login = async (req, res, next) => {
  try {
    const body = req.body;
    const errorResults = validationResult(req);
    const errors = errorResults.array();

    //kiểm tra mảng errors từ validationRéult
    //có: gửi phản hồi các lỗi
    if (errors.length > 0) {
      return res.status(422).json({ status: false, message: errors[0].msg });
    }
    const user = await User.findOne({ email: body.email });
    const password = await bcrypt.compare(body.password, user.password);
    //kiểm tra password có giống
    //không: gửi phản hồi lỗi
    if (!password) {
      return res
        .status(422)
        .json({ status: false, message: "Password is wrong" });
    }
    //tạo token xác thực đăng nhập
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "authusertouserpostsapp",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      status: true,
      message: "LoggedIn",
      token: token,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: false, message: "Error server" });
  }
};

exports.checkLogin = (req, res, next) => {
  if (req.session.user) {
    res.status(200).json({ status: true, user: req.session.user });
  } else {
    res.status(401).json({ status: false });
  }
};
