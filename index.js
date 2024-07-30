if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const metohdOverride = require('method-override');
const ejsMate = require("ejs-mate")//to use our boilerplates
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const User = require("./models/user");
const userRoutes = require("./routes/users");

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require("connect-mongo")(session);
const dbUrl = 'mongodb://127.0.0.1:27017/YelpCamp';
 
mongoose.connect(dbUrl)
 .then(()=>{
    console.log("Database connected(local)");
 })
 .catch(err => {
    console.log("error)")
    console.log(err)
});

const store = new MongoDBStore({
    url : dbUrl,
    secret : "notagoodsecret",
    touchAfter : 24*60*60
});

store.on("error", function(e){
    console.log("session store error", e)
})

const sessionConfig = {
    store,
    name : "session",
    secret : "notagoodsecret",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7,
        httpOnly : true
        //secure = true
    }
};

//middelware
app.engine("ejs", ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended  :true}))
app.use(metohdOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));//our static js and styles files
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());//to be called after session is initialized

app.use(mongoSanitize());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhdi9u0mo/",  
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use((req, res, next)=>{
    res.locals.curruser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next()
});//middelware for flash messages


//passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(8000, ()=>{
    console.log("getting started");
})


//campground routes
app.get("/", (req, res)=>{
    res.render("home")
})

app.use("/campground", campgroundRoutes)


//Review routes
app.use("/campground/:id/reviews", reviewRoutes)


//User routes
app.use("/", userRoutes)


//Error handling
app.all("*", (req,res,next)=>{
    next(new ExpressError("Page Not Found", 404))
})


app.use((err, req, res,next)=>{
    let { statusCode } = err;
    let name = err.name;
    if(name !== "Error")
    { //for mongoose errors
        return next();
    }
    if(!err.message) err.message = "Something went wrong"
    console.log(statusCode, err)
    console.log("error")
    res.status(statusCode).render("error", {err});
})