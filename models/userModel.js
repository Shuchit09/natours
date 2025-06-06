const crypto = require('crypto')
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "A name is requried"],

    },
    email: {
        type: String,
        require: [true, "Please provide your email"],
        unique: true,
        lowercase: true, // Shuchit@gmail => shuchit@gmail
        validate: [validator.isEmail, "Invalid email address, provide valid email"]
    },
    photo: { type: String, default: 'default.jpg' },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        require: [true, "Password is required"],
        minlength: 8,
        select: false

    },
    passwordConfirm: {
        type: String,
        require: [true, "Please confirm your password"],
        validate: {
            // This only works on create() and save()!!!
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same."
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: {
        type: Date,
        default: Date.now()
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function (next) {
    //Only run this function if password was actually modified

    if (!this.isModified('password')) return next();

    // ASYNC version, we also have sync version, but not using as it can freeze the single thread process
    this.password = await bcrypt.hash(this.password, 12) // 12 is the value of cost parameter,i.e.,CPU intensity, default value is 10

    this.passwordConfirm = undefined; // does not persists in the db
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; //-1000 because sometimes saving to the db is slower than generating JWT

    next();

})

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    // this.password // cant be accessed as select property is false
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex'); // generates 32 digits hex string

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 //10 mins

    return resetToken;
}



const User = mongoose.model("User", userSchema);

module.exports = User;