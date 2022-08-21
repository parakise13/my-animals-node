const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("사용자 정보를 가져올 수 없습니다.", 500);
    return next(error);
  }

  if (!users) {
    return next(new HttpError("사용자를 찾을 수 없습니다.", 404));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "회원가입에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    console.log(err);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("입력하신 이메일 정보가 이미 존재합니다.", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    imageUrl:
      "https://www.rd.com/wp-content/uploads/2021/04/GettyImages-528127648-scaled.jpg?resize=1536,1027",
    animals: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "회원가입에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    console.log(err);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "로그인에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    console.log(err);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "유효하지 않는 정보를 입력하셨습니다. 다시 시도해주세요.",
      401
    );
    console.log(err);
    return next(error);
  }

  res.json({ message: "logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
