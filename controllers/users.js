const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render("user/register")
}

module.exports.registerUser =  async (req, res) => {
    try {
        let { username, password, email } = req.body;
        let user = new User({ username, email});
        let registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if(err) return next(err);

            req.flash("success", "User registered successfully")
            res.redirect("/campground");
        })
    }
    catch(err)
    {
        req.flash('error', err.message);
        res.redirect("/register");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("user/login");
    
}

module.exports.login = (req, res) => {
    
    req.flash("success", "Logged in successfully");
    let redirectUrl = res.locals.returnTo || "/campground";

    res.redirect(redirectUrl);
   // console.log(req.user)
}

module.exports.logout = (req, res,next) => {
    req.logout( function (e) {
        if(e)
        return next(e);

    req.flash("success", "Logged out")
    res.redirect("/campground")
    //console.log(req.user)
    })
}
