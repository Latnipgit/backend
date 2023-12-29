const db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const Debtor = db.debtors;
const DebtorRating = db.debtorRating;
const config = process.env;

exports.addDebtorRating = function(rating) {
    return DebtorRating.create(rating);
};

exports.findCompany = function(companyDetails) {
    condition = {$and: [{$or: [{ companyPan: companyDetails.companyPan }, { gstin: companyDetails.gstin }]}, {"$regex": companyDetails.companyName,"$options":"i"} ]};
    return Companies.findOne(condition);
};
  
exports.addDebtorRatingToDebtor = function(debtorId, rating) {
    return  Debtor.findByIdAndUpdate(
        debtorId,
      { $push: { ratings: rating._id } },
      { new: true, useFindAndModify: false }
    );
};