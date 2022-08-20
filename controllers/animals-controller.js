const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

let DUMMY_ANIMALS = [
  {
    id: "a1",
    animalName: "봉순",
    species: "코리안 숏헤어",
    age: 13,
    description: "성질이 드러움",
    imageUrl:
      "https://www.rd.com/wp-content/uploads/2021/04/GettyImages-528127648-scaled.jpg?resize=1536,1027",
    creator: "u1",
  },
  {
    id: "a2",
    animalName: "봉철",
    species: "페르시안 친칠라",
    age: 13,
    description: "털이 많이 빠짐",
    imageUrl:
      "https://www.rd.com/wp-content/uploads/2021/04/GettyImages-528127648-scaled.jpg?resize=1536,1027",
    creator: "u1",
  },
];

const getAnimalById = (req, res, next) => {
  const animalId = req.params.aid;
  const animal = DUMMY_ANIMALS.find((a) => a.id === animalId);

  if (!animal) {
    return next(new HttpError("반려동물을 찾을 수 없습니다.", 404));
  }

  res.json({ animal });
};

const getAnimalsByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const animals = DUMMY_ANIMALS.filter((a) => a.creator === userId);

  if (!animals || animals.length === 0) {
    return next(new HttpError("반려동물을 찾을 수 없습니다.", 404));
  }

  res.json({ animals });
};

const createAnimal = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }

  const { animalName, species, age, description, creator } = req.body;
  const createdAnimal = {
    id: uuidv4(),
    animalName,
    species,
    age,
    description,
    creator,
  };

  DUMMY_ANIMALS.push(createdAnimal);
  res.status(201).json({ createdAnimal });
};

const updateAnimal = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("유효하지 않은 정보를 입력하였습니다.", 422));
  }

  const { animalName, species, age, description } = req.body;
  const animalId = req.params.aid;

  const updatedAnimal = { ...DUMMY_ANIMALS.find((a) => a.id === animalId) };
  const animalIdx = DUMMY_ANIMALS.findIndex((a) => a.id === animalId);
  updatedAnimal.animalName = animalName;
  updatedAnimal.species = species;
  updatedAnimal.age = age;
  updatedAnimal.description = description;

  DUMMY_ANIMALS[animalIdx] = updateAnimal;

  res.status(200).json({ animal: updatedAnimal });
};

const deleteAnimal = (req, res, next) => {
  const animalId = req.params.aid;
  DUMMY_ANIMALS = DUMMY_ANIMALS.filter((a) => a.id !== animalId);

  res.status(200).json({ message: "반려동물을 삭제하였습니다." });
};

exports.getAnimalById = getAnimalById;
exports.getAnimalsByUserId = getAnimalsByUserId;
exports.createAnimal = createAnimal;
exports.updateAnimal = updateAnimal;
exports.deleteAnimal = deleteAnimal;
