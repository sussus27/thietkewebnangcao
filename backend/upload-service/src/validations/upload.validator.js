const { body } = require('express-validator');

const createUpload = [
    body('title')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 255 })
        .withMessage('title must be at most 255 characters')
];

module.exports = {
    createUpload
};
