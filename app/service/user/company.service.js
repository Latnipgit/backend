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
        city: companyDetails.city,
        state: companyDetails.state,
        zipcode: companyDetails.zipcode
    });
};

exports.findCompany = function(companyDetails) {
    condition = {$and: [{$or: [{ companyPan: companyDetails.companyPan }, { gstin: companyDetails.gstin }]}, {"$regex": companyDetails.companyName,"$options":"i"} ]};
    return Companies.findOne(condition);
};
  