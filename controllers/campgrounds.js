const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res)=>{
    let campgrounds  = await Campground.find({});
    res.render("campground/list", { campgrounds });
}

module.exports.renderNewForm = (req, res)=>{
    res.render("campground/create");
}

module.exports.getCampground = async (req, res)=>{
    let { id } = req.params;
    let camp = await Campground.findById(id).populate({
        path : "reviews",
        populate : {
            path : "author"
        }
    }).populate("author")
    
    if(!camp)
    {
        req.flash("error", "Campground not found")
        return res.redirect("/campground")
    }
    //console.log(camp)
    res.render("campground/details" , { camp });
}

module.exports.editCampground =  async (req, res)=>{
    let camp = await Campground.findById(req.params.id)
    if(!camp)
    {
        req.flash("error", "Campground not found")
        return res.redirect("/campground")
    }
    res.render("campground/edit", {camp})
}

module.exports.createCampground = async (req, res)=>{
    const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
    console.log(geoData)
    let camp = new Campground(req.body)
    camp.geometry = geoData.features[0].geometry;
    
    //console.log(camp);

    camp.image = req.files.map(f => ({url : f.path, filename : f.filename}))
    camp.author = (req.user._id);
    await camp.save();
    console.log(camp);
    req.flash("success", "Campground created")

    res.redirect(`/campground/${camp.id}`)
} 

module.exports.updateCampground =  async (req,res) =>{
    let {id} = req.params;
    console.log(req.body);
    let camp  = await Campground.findByIdAndUpdate(id, { ...req.body})

    //updating maps
    const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
    camp.geometry = geoData.features[0].geometry;

    const imgs = req.files.map(f => ({url : f.path, filename : f.filename}));
    camp.image.push(...imgs);
    await camp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({$pull: { image : {filename : {$in : req.body.deleteImages}}}})
        console.log(camp)
    }
    req.flash('sucess', 'updated sucessfully');
    res.redirect(`/campground/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) =>{
    let {id} = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Campground deleted")
    res.redirect("/campground")
    // console.log("deleted")
}