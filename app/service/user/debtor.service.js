const db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const Debtor = db.debtors;
const DebtorRating = db.debtorRating;
const config = process.env;


exports.addDebtor = function(debtorDetails) {
    return Debtor.create({
        companyName: debtorDetails.companyName,
        gstin: debtorDetails.gstin,
        companyPan: debtorDetails.companyPan,

        debtorType: debtorDetails.debtorType,
        salutation: debtorDetails.salutation,
        firstname: debtorDetails.firstname,
        lastname: debtorDetails.lastname,
        customerEmail: debtorDetails.customerEmail,
        customerMobile: debtorDetails.customerMobile,
        address1: debtorDetails.address1,
        address2: debtorDetails.address2,
        city: debtorDetails.city,
        state: debtorDetails.state,
        zipcode: debtorDetails.zipcode,

        creditorCompanyId: debtorDetails.creditorCompanyId
    });
};

exports.addDebtorRating = function(rating) {
    let ratingObj = {
        debtorId: rating.debtorId,
        ratingCompany: rating.ratingCompany,
        question: rating.questionId,
        response: rating.response
    }
    return DebtorRating.create(ratingObj);
};

function buildDebtorQuery(companyDetails) {
    let queryConditions = [];

    if (companyDetails.companyPan) {
        queryConditions.push({ companyPan: companyDetails.companyPan });
    }

    if (companyDetails.gstin) {
        queryConditions.push({ gstin: companyDetails.gstin });
    }

    if (companyDetails.companyName) {
        queryConditions.push({ companyName: { $regex: companyDetails.companyName, $options: "i" } });
    }

    let condition = queryConditions.length ? { $or: queryConditions } : {};

    return Debtor.find(condition);
}


exports.companySearch = function(companyDetails) {
    condition = buildDebtorQuery(companyDetails)
        return Debtor.find(condition);
};
  
exports.addDebtorRatingToDebtor = function(debtorId, rating) {
    
    return Debtor.findByIdAndUpdate(
        debtorId,
      { $push: {   
                ratings: rating._id
            } 
        },
      { new: true, useFindAndModify: false }
    );

};