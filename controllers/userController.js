const multer = require("multer")
const sharp = require("sharp")
const AppError = require('../utils/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     }, //call back function has access to req, file and callback function similar to next
//     filename: (req, file, cb) => {
//         // user-userId-currentTimeStamp.fileExtension
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)

//     }
// }) // can also be used to store in memory buffer

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); //null means no error
    }
    else {
        cb(new AppError("Not an image! Please upload only images.", 400), false); // false dont allows it to pass
    }
} //to check if uploaded file is an image

const upload = multer({
    // dest: 'public/img/users'

    storage: multerStorage,
    fileFilter: multerFilter
}) // when no options is specified, uploaded image would not have been save anywhere, we upload in file system and put that in db

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    // it is better to save image to buuffer
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; //sets the file name, which is not set in memory storage
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`) // for square image

    next();
})

// Helper Functions

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    })
    return newObj;
}

// Route Handlers

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getAllUsers = factory.getAll(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getUser = factory.getOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.file); //returns the file passed
    // console.log(req.body); //need multer package to handle the body parser for the image


    // 1. Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) return next(new AppError("This route is not for password updates. Please use /updateMyPassword.", 400))

    // 2. Update user document
    const filteredBody = filterObj(req.body, "name", "email");
    if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {// dont want to change eveything specified,so we'll filter the body.
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: "success",
        data: null,
    })
})
