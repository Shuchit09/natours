const Tour = require('./../models/tourModel')


// ROUTE HANDLERS

exports.getAllTours = async (req, res) => {
    try {
        // BUILDING QUERY
        // 1. FILTERING
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields']; //filter to ignore these
        excludedFields.forEach(el => delete queryObj[el])
        console.log(queryObj)

        // 2. ADVANCEDD FILTERING
        const queryStr = JSON.stringify(queryObj)
        queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr))

        const query = Tour.find(queryObj);
        // 3. EXECUTING QUERY
        const tours = await query;
        // const tours = await Tour.find({
        //     duration: 5,
        //     difficulty: 'easy'
        // }); NORMAL WAY TO WRITE A QUERY

        // const tours = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');


        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id); //Tour.findOne{{_id:req.params.id}}

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        })
    }

}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

}

exports.updateTour = async (req, res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        })
        res.status(202).json({
            status: 'success',
            data: {
                updatedTour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        })

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


////////////////////////////////////////////////////////////

// FOR REFERENCE


// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// exports.checkID = (req, res, next, val) => {
//     console.log(`This tour has id: ${val}`)
//     if (req.params.id * 1 >= tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         })
//     }
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'failed',
//             message: 'Missing name or price'
//         })
//     }
//     next();
// }

