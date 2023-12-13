const express = require("express");

const router = express.Router();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/profile/");
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    newFileName = file.fieldname + "-" + Date.now() + "." + extension;
    //cb(null, file.originalname + '-' + uniqueSuffix);
    cb(null, newFileName);
    //cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Check if the user is logged in - Weaam
const ensureLoggedIn = require("../config/ensureLoggedIn");

//so the controller can encode the data from the form
router.use(express.urlencoded({ extended: true }));

const userCntrl = require("../controllers/user");

router.get("/index", ensureLoggedIn, userCntrl.user_index_get);

router.get("/edit", ensureLoggedIn, userCntrl.user_update_get);

router.post("/update", ensureLoggedIn, userCntrl.user_update_post);

router.get("/profile", ensureLoggedIn, userCntrl.user_profile_get);

router.post(
  "/updateUser",
  ensureLoggedIn,
  upload.single("item_img"),
  userCntrl.user_profile_post
);

module.exports = router;
