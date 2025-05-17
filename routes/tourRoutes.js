const express = require('express')
const tourController = require('./../controllers/tourController')
const router = express.Router();

const { checkID, checkBody, getAllTours, createTour, getTour, updateTour, deleteTour } = tourController;

// router.param('id', checkID)

router
    .route('/')
    .get(getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;