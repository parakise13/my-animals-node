const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Animal = require("../models/animal");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getAnimalById = async (req, res, next) => {
  const animalId = req.params.aid;

  let animal;
  try {
    animal = await Animal.findById(animalId);
  } catch (err) {
    const error = new HttpError(
      "정보와 일치하는 반려동물을 찾을 수 없습니다.",
      500
    );
    return next(error);
  }

  if (!animal) {
    const error = next(
      new HttpError("정보와 일치하는 반려동물을 찾을 수 없습니다.", 404)
    );
    return next(error);
  }

  res.json({ animal: animal.toObject({ getters: true }) });
};

const getAnimalsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithAnimals;
  try {
    userWithAnimals = await User.findById(userId).populate("animals");
  } catch (err) {
    const error = new HttpError(
      "사용자 정보와 일치하는 반려동물을 찾을 수 없습니다.",
      500
    );
    return next(error);
  }

  if (!userWithAnimals || userWithAnimals.animals.length === 0) {
    const error = new HttpError(
      "사용자 정보와 일치하는 반려동물을 찾을 수 없습니다.",
      404
    );

    return next(error);
  }

  res.json({
    animals: userWithAnimals.animals.map((animal) =>
      animal.toObject({ getters: true })
    ),
  });
};

const createAnimal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }

  const { animalName, species, age, description, creator } = req.body;
  const createdAnimal = new Animal({
    animalName,
    species,
    age,
    description,
    imageUrl:
      "https://www.rd.com/wp-content/uploads/2021/04/GettyImages-528127648-scaled.jpg?resize=1536,1027",
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("일치하는 사용자를 찾을 수 없습니다.", 404);
    console.log(err);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("", 500);
    console.log(err);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdAnimal.save({ session: sess });
    user.animals.push(createdAnimal);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "반려동물 생성에 실패하였습니다. 다시 시도해주세요.",
      500
    );
    console.log(err);
    return next(error);
  }

  res.status(201).json({ animal: createdAnimal });
};

const updateAnimal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }

  const { animalName, species, age, description } = req.body;
  const animalId = req.params.aid;

  let animal;
  try {
    animal = await Animal.findById(animalId);
  } catch (err) {
    const error = new HttpError("일치하는 정보를 가져올 수 없습니다.", 500);
    console.log(err);
    return next(error);
  }

  animal.animalName = animalName;
  animal.species = species;
  animal.age = age;
  animal.description = description;

  try {
    await animal.save();
  } catch (err) {
    const error = new HttpError("반려동물 정보 수정이 불가능합니다.", 500);
    console.log(err);
    return next(error);
  }

  res.status(200).json({ animal: animal.toObject({ getters: true }) });
};

const deleteAnimal = async (req, res, next) => {
  const animalId = req.params.aid;

  let animal;
  try {
    animal = await Animal.findById(animalId).populate("creator");
  } catch (err) {
    const error = new HttpError("반려동물을 삭제할 수 없습니다.", 500);
    console.log(err);
    return next(error);
  }

  if (!animal) {
    const error = new HttpError(
      "일치하는 정보의 반려동물을 찾을 수 없습니다.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await animal.remove({ session: sess });
    animal.creator.animals.pull(animal);
    await animal.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("반려동물을 삭제할 수 없습니다.", 500);
    console.log(err);
    return next(error);
  }

  res.status(200).json({ message: "반려동물을 삭제하였습니다." });
};

exports.getAnimalById = getAnimalById;
exports.getAnimalsByUserId = getAnimalsByUserId;
exports.createAnimal = createAnimal;
exports.updateAnimal = updateAnimal;
exports.deleteAnimal = deleteAnimal;
