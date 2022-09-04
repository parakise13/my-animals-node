const express = require("express");
const { check } = require("express-validator");

const animalControllers = require("../controllers/animals-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:aid", animalControllers.getAnimalById);

router.get("/user/:uid", animalControllers.getAnimalsByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.upload.single("imageUrl"),
  async (req, res, next) => {
    console.log(req.file);
    console.log(req.imageUrl);
    const returnData = {
      signedRequest: req.imageUrl,
      url: `https://${fileUpload.s3bucket}.s3.amazonaws.com/${req.imageUrl}`,
    };
    res.write(JSON.stringify(returnData));
    next();
  },
  [
    check("animalName").not().isEmpty(),
    check("species").not().isEmpty(),
    check("age").not().isEmpty(),
    check("description").isLength({ min: 5 }),
  ],
  animalControllers.createAnimal
);

router.patch(
  "/:aid",
  [
    check("animalName").not().isEmpty(),
    check("species").not().isEmpty(),
    check("age").not().isEmpty(),
    check("description").isLength({ min: 5 }),
  ],
  animalControllers.updateAnimal
);

router.delete("/:aid", animalControllers.deleteAnimal);

module.exports = router;
