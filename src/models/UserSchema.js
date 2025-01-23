const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            minLength: 2,
            maxLength: 30, 
            index : true,       // much prefereable to use 'unique : true' coz it creates the unique index
        },                      // but we can't put unique in this field coz name can be duplicates
        lastName: {
            type: String,
        },
        email: {
            type: String,
            lowercase: true,       // the email id will be stored in lowercase
            required: [true, 'Email is required'],
            unique: true, // Ensures no duplicate emails in the database
            trim: true,   // Removes leading/trailing spaces
            minLength: 4,  // email should have the name of minimum length 4
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        age: {
            type: Number,
            min: [0, 'Age must be positive'], // Optional: Minimum age validation
            max: 90,
        },
        gender: {
            type: String,
            validate(value) {                    // Validate function 
                if (!["male", "female", "other"].includes(value)) {
                    throw new Error('Gender should only be Male, Female, Other.');
                }
            }
        },
        photoUrl: {
            type: String,
            default: "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png",
        },
        about: {
            type: String,
            trim: true,
        },
        skills: {
            type: [String], // Array of strings for better validation
        },
    },
    {
        timestamps: true // This will add 'createdAt' and 'updatedAt' fields
    }
);

userSchema.index({firstName:1,lastName:1});

userSchema.methods.getJWT = async function () {

    const user = this ;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); // token expires in 7day
    return token ;
}

module.exports = mongoose.model('User', userSchema);
