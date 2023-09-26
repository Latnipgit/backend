const db = require("../../models/user");
const commondb = require("../../models/common/");

const User = db.user;
const Companies = db.companies;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const mailUtility = require('../../util/mailUtility')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../../controllers/common/mailTemplates.controller')
const config = process.env;
const Joi = require("joi");
const crypto = require("crypto");


exports.addUser = function(user) {
    return User.create({
        name: user.name,
        userName: user.emailId,
        companyPan: user.companyPan,
        mobile: user.mobile,
        password: user.password,
        emailId: user.emailId,
        role: user.role,
        passwordChangeNeeded: false
    });
};


exports.addUser = function(userId) {
    return User.findByIdAndUpdate(userId);
};


exports.addCompanyToUser = function(userId, company) {
    return User.findByIdAndUpdate(
        userId,
      { $push: { companies: company._id } },
      { new: true, useFindAndModify: false }
    );
};
  