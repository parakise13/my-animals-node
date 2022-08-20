const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Tommy",
    email: "test@test.com",
    password: "test1234",
  },
];

const getUsers = (req, res, next) => {
  const users = DUMMY_USERS;

  if (!users) {
    return next(new HttpError("사용자를 찾을 수 없습니다.", 404));
  }

  res.json({ users });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    return next(new HttpError("입력하신 이메일 정보가 이미 존재합니다.", 422));
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError("입력하신 정보로 사용자를 찾을 수 없습니다.", 401)
    );
  }

  res.json({ message: "logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
