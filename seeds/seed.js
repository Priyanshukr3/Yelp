const mongoose = require('mongoose');
const Campground = require('../models/campground');// .. used to go up one folder
const cities = require("./cities");
const { descriptors , places } = require("./seedhelpers")


mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp')
 .then(()=>{
    console.log("Database connected(local)");
 })
 .catch(err => {
    console.log("error)")
    console.log(err)
});


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*1000)+500;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [
                {
                  url: 'https://res.cloudinary.com/dhdi9u0mo/image/upload/v1721829187/YelpCamp/tvaa6k9ugnyg33bbxhdr.jpg',
                  filename: 'YelpCamp/tvaa6k9ugnyg33bbxhdr'
                }
              ],
            author : "669fd0aba8c27092ddb9ab05",
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
              },
            description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis aut nihil similique illum vitae ipsa minus officiis odio officia dolores reprehenderit commodi accusamus labore, autem nobis laborum necessitatibus rerum laudantium."
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})