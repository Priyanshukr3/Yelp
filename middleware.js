const Campground = require("./models/campground")
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated())
    {
        req.session.returnTo = req.originalUrl;
        
        req.flash("error", "You must be logged in")
        return res.redirect("/login");
    }
    next();
}

module.exports.storeReturnTo = (req,res,next) => {
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.isAuthor = async (req,res,next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)){
        req.flash("error", "You are not authorized");
        res.redirect(`/campground/${camp._id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req,res,next) => {
    const {id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id))
    {
        req.flash("error", "You are not authorized");
        res.redirect(`/campground/${id}`);
    }
    next();
}