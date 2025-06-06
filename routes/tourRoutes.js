const express = require('express')
const tourController = require('./../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes')

const router = express.Router();


// router.param('id', checkID)


// router.route('/:tourId/review')
//     .post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
    .route('/tours-stats')
    .get(tourController.getTourStats)

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tours-within/:distance/center/:latlng')

router
    .route('/monthly-plan/:year')
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);




module.exports = router;