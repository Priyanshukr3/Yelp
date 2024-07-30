const Review = require("../models/review");
const Campground = require('../models/campground');

module.exports.createReview = async (req,res) =>{
    let camp = await Campground.findByIdAndUpdate(req.params.id);
    const review = new Review(req.body.review)//since we are now storing the data as review[body]
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash("success", "Review created")
    res.redirect(`/campground/${camp._id}`)
}

module.exports.deleteReview =     async (req,res) =>{
    let {id , reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews : reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted")
    res.redirect(`/campground/${id}`);
    // res.send("working")
}