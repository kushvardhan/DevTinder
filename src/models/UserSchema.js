const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            minLength: 2,
            maxLength: 30, 
            index : true,      
        },                     
        lastName: {
            type: String,
        },
        email: {
            type: String,
            lowercase: true,  
            required: [true, 'Email is required'],
            unique: true, 
            trim: true,  
            minLength: 4,  
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        age: {
            type: Number,
            min: [0, 'Age must be positive'],
            max: 90,
        },
        gender: {
            type: String,
            validate(value) {               
                if (!["Male", "Female", "Other"].includes(value)) {
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
            type: [String], 
        },
    },
    {
        timestamps: true 
    }
);

userSchema.index({firstName:1,lastName:1});

userSchema.methods.getJWT = async function () {

    const user = this ;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token ;
}

module.exports = mongoose.model('User', userSchema);
