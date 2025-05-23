const express = require('express')
const tourController = require('./../controllers/tourController')
const authController = require('../controllers/authController')
const router = express.Router();

const { checkID, checkBody, getAllTours, createTour, getTour, updateTour, deleteTour } = tourController;

// router.param('id', checkID)

router
    .route('/')
    .get(authController.protect, getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        deleteTour);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/tours-stats')
    .get(tourController.getTourStats)
router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan)


module.exports = router;