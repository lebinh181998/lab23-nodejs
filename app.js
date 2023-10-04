const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require("multer");
// const MongoDBSession = require("connect-mongodb-session")(session);
const path = require("path");
const User = require("./models/user");
const { v4: uuidv4 } = require("uuid");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

console.log(process.env.MONGO_USER);
console.log(process.env.MONGO_PASSWORD);
console.log(process.env.MONGO_DEFAULT_DATABASE);

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.iewp9yb.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

// const store = new MongoDBSession({
//   uri: MONGO_URI,
//   collection: "sessions",
// });

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
//   })
// );
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   session({
//     secret: "posts-session",
//     resave: false,
//     saveUninitialized: false,
//     store: store,
//   })
// );
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, DELETE, PUT, PATCH"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// app.use(async (req, res, next) => {
//   if (req.session.user) {
//     const user = await User.findById(req.session.user._id);
//     req.user = user;
//   }
//   next();
// });

const authRouter = require("./routers/auth");
const userRouter = require("./routers/user");
const postRouter = require("./routers/post");
app.use(authRouter);
app.use(userRouter);
app.use(postRouter);

const PORT = process.env.PORT || 5000;

console.log(process.env.PORT);

mongoose
  .connect(MONGO_URI)
  .then((res) => {
    const server = app.listen(PORT);
    const io = require("./util/socket").init(server);
    console.log("connected db");
    io.on("connection", (socket) => {
      console.log("connected server" + PORT);
    });
  })
  .catch((err) => console.log(err));
