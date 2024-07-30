const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review");
const { object } = require('joi');

const ImageSchema = new Schema({
    url : String,
    filename : String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/t_Thumbnail');
});

const opts = { toJSON: { virtuals: true } };

const Campgroundschema = new Schema({
    title : String,
    price : Number,
    description : String,
    location : String,
    image : [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
        },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ]
}, opts);


//virtual for properties 
Campgroundschema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campground/${this._id}">${this.title}</a>`;
})

//mongoose middleware 
//post gives us the object deleted after delete query 
Campgroundschema.post("findOneAndDelete", async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id : {
                $in : doc.reviews
            }
        })
    }
})


module.exports = mongoose.model("Campground", Campgroundschema);