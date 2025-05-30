const Review = require("../models/reviewModel")
const catchAsync = require("../utils/catchAsync")
const factory = require('./handlerFactory')

// Middlewares

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}


// Route Handlers
exports.getAllReviews = factory.getAll(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//     // Allow nested routes
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body); //fields in body not in review schema will be ignored

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview
//         }
//     })
// })


