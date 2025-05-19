const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true,
        maxlength: [40, "A tour name must have atmost 40 characters"],
        minlength: [5, "A tour name must have atleast 5 characters"],
        // validate: [validator.isAlpha,"Tour name must only contain characters."]
    },
    slug: String,
    duration: {
        type: Number, required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficulty'],
            message: "Difficulty is either: easy, medium or difficult"
        }
    },
    ratingsAverage: {
        type: Number, default: 0,
        min: [1, "Rating must be above 1.0"],
        max: [1, "Rating must be below 5.0"]
    },
    ratingsQuantity: {
        type: Number, default: 0
    },
    price: {
        type: Number, required: [true, "A tour must have price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //this only points to current doc on NEW document
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price' // VALUE receives the entered value
        },
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have image cover]"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,

    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},
    { toJSON: { virtuals: true }, toObject: { virtuals: true } })

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

// Document middleware, runs before .save() and .create()  command, but not on .insertMany()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }) //creating a slug
    next(); //sends to next middleware or db
}) //pre-saved middleware has next, this points to currently being saved document

// tourSchema.pre('save', function (next) {
//     console.log('Will save document...')
//     next();
// }) //can have multipe pre-save middleware or hook

// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// }) //has access to next as well as doc saved in db

// QUERY MIDDLEWARE, runs before or after any query
tourSchema.pre(/^find/, function (next) {// processes query starting with "find"
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    // console.log(`Query took: ${Date.now() - this.start}ms`)
    // console.log(docs)
    next();
})


// AGGREGATION MIDDLEWARE

tourSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    console.log(this.pipeline()); // Logs the current aggregation pipeline which is an array
    next();
});


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;