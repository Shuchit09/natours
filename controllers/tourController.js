const Tour = require('./../models/tourModel')
const APIFeatuers = require('./../utils/apiFeatures')

// MIDDLEWARES

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// ROUTE HANDLERS

exports.getAllTours = async (req, res) => {
    try {

        // For Reference
        // console.log(req.qurey)


        // BUILDING QUERY
        // 1(A). FILTERING
        // const queryObj = { ...req.query };
        // const excludedFields = ['page', 'sort', 'limit', 'fields']; //filter to ignore these, because these don't exist as document part but needed with url
        // excludedFields.forEach(el => delete queryObj[el])
        // console.log(queryObj)

        // // 1(B). ADVANCEDD FILTERING

        // let queryStr = JSON.stringify(queryObj)
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //regex -- regular expression, \b make it to match the exact word only and /g will make it 
        // console.log(JSON.parse(queryStr))

        // let query = Tour.find(JSON.parse(queryStr));

        // const tours = await Tour.find({
        //     duration: 5,
        //     difficulty: 'easy'
        // }); NORMAL WAY TO WRITE A QUERY

        // const tours = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');


        // 2. SORTING
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ')
        //     console.log(sortBy)
        //     query = query.sort(sortBy)
        // }
        // else {
        //     query = query.sort("-createdAt")
        // }

        // 3. FIELD LIMITING
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields)
        // }
        // else {
        //     query = query.select('-__v')
        // }

        // 4. PAGINATION
        // const page = req.query.page * 1 || 1
        // const limit = req.query.limit * 1 || 100
        // const skip = (page - 1) * limit
        // page=2&limit=10, 1-10 skip, page 1, 11-20 ,page 2,....


        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip > numTours) throw new Error('This page is not available')
        // }
        // query = query.skip(skip).limit(limit) //skip() amount of entries to be skipped before queryig, limiy is number of result


        // EXECUTING QUERY

        const features = new APIFeatuers(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;
        // console.log(features.query)

        // SEND RESPONSE    
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    }
    catch (err) {
        console.log(err)
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
            new: true, //new updated document is returned
            runValidators: true
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

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } } // compares the field
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    num: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                } //aggregates the fields
            },
            {
                $sort: {
                    avgPrice: 1
                } //sorts
            },
            // {
            //     $match: {
            //         _id: { $ne: "EASY" }
            //     }
            // }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1; //2021
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates' //deconstruct the input array and returns document per element of array
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            }, {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }//pushes names to the array
                },
            }, {
                $addFields: { month: '$_id' } //adds fields
            },
            {
                $project: {
                    _id: 0
                } //each field name recieves 0 or 1, defining the display of field in result
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12//limits number of document as output
            }
        ])

        res.status(200).json({
            status: 'success',
            length: plan.length,
            data: {
                plan
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
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

