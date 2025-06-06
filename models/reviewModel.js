const mongoose = require('mongoose')
const Tour = require("./tourModel")

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        require: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: "name photo"
    });
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: "name photo"
    // });
    next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',//first field we need to specify
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }

            }
        }
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    }
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 0
        })
    }
}

// for every time the rating is received
reviewSchema.post('save', function () {
    //this points to current review
    this.constructor.calcAverageRatings(this.tour) //constructor is used as we need to create object of this doc
})

reviewSchema.pre(/^findOneAnd/, async function (next) {//this can't be post as query will get executed
    this.r = await this.findOne();//trick to pass the data from pre middleware to post middleware
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    // await this.findOne(); does not work as query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

// POST /tour/:id/reviews
// GET /tour/:id_tour/reviews/
// GET /tour/:id_tour/reviews/:id_review