 const express = require('express');
//const path = require('path');
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {campgroundSchema} = require("../schema.js");
const router = express.Router();
const Campground = require('../models/campground');
const campgrounds = require("../controllers/campgrounds");
const Joi = require("joi");
const { isLoggedIn, isAuthor } = require("../middleware")
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({storage});

//validations
const validateCamp = (req, res, next) => {
    let { error } = campgroundSchema.validate(req.body);
    if(error){
        let msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    else
    next();//do not pass any argument or else it will be considered as error
}


//routes
router.get("/" , catchAsync(campgrounds.index))


router.get("/new" , isLoggedIn , campgrounds.renderNewForm)


router.get('/:id' , catchAsync(campgrounds.getCampground))


router.get("/:id/edit" , isLoggedIn, isAuthor,  catchAsync(campgrounds.editCampground))


router.post("/", isLoggedIn, upload.array('image'), validateCamp, catchAsync(campgrounds.createCampground))


router.put("/:id", isLoggedIn, isAuthor, upload.array('image'),  validateCamp, catchAsync(campgrounds.updateCampground))


router.delete("/:id", isLoggedIn, isAuthor,  catchAsync(campgrounds.deleteCampground))


module.exports = router;