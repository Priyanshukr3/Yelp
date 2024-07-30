const express = require('express');
const Review = require("../models/review");
const Campground = require('../models/campground');
const path = require('path');
const {reviewSchema} = require("../schema.js");
const router = express.Router({mergeParams: true}); //required to access the params since we arre wrirting the original url as campground/:id/reviews
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Joi = require("joi");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews")

//validadtions
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    //console.log(error);
    if(error){
        let msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    else
    next();
}


//routes

router.post("/", validateReview , isLoggedIn, catchAsync(reviews.createReview))


router.delete("/:reviewId" , isLoggedIn, isReviewAuthor,  catchAsync(reviews.deleteReview))


module.exports = router;