const db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const Companies = db.companies;
const User = db.user;
const config = process.env;

exports.addCompany = function(companyDetails) {
    return Companies.create({
        companyName: companyDetails.companyName,
        gstin: companyDetails.gstin,
        companyPan: companyDetails.companyPan,
    });
};
  
// exports.addUserToCompany = function(companyId, user) {
//     return db.companies.findByIdAndUpdate(
//         companyId,
//       { $push: { users: user._id } },
//       { new: true, useFindAndModify: false }
//     );
// };
  