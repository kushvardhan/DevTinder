const validator = require('validator');

// Validator for Signup Data
function validatorSignupData(req) {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
        throw new Error('All fields are required.');
    }

    if (!validator.isEmail(email)) {
        throw new Error('Invalid email address.');
    }

    if (!validator.isStrongPassword(password, { minLength: 8 })) {
        throw new Error('Password must be at least 8 characters long with uppercase, lowercase, and numbers.');
    }
}

// Validator for Profile Edit Data
function validateProfileEditData(req) {
    const allowedEditFields = ['firstName', 'lastName', 'gender', 'age', 'skills', 'about', 'photoUrl'];
    const fieldsInRequest = Object.keys(req.body);

    // Ensure every field in the request is allowed
    return fieldsInRequest.every((field) => allowedEditFields.includes(field));
}

module.exports = { validatorSignupData, validateProfileEditData };