const nodemailer = require('nodemailer');

exports.generateRandomPassword = (mailObj) => {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';
 
    for (let i = 1; i <= 8; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
 
        pass += str.charAt(char)
    }
 
    return pass;
}

exports.calculateAverageRating= (ratings) => {
    if (Array.isArray(ratings)) {
        // Filter ratings that have a 'rating' field
        const validRatings = ratings.filter(r => typeof r.rating === 'number');

        // Calculate the average rating
        const averageRating = validRatings.reduce((acc, r) => acc + r.rating, 0) / validRatings.length;

        return averageRating;
    }
}
