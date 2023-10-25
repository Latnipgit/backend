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
    let passwordChangeNeeded = process.env.ENV == "LOCAL" ? false : true;

    return User.create({
        name: user.name,
        userName: user.emailId,
        phoneNumber: user.mobile,
        aadharCardNo: user.aadharCardNo,
        password: user.password,
        emailId: user.emailId,
        role: user.role,
        passwordChangeNeeded: passwordChangeNeeded,
        permissions:  user.permissions
    });
};


exports.getUserById = function(userId) {
    return  User.findById(userId);
};


exports.updateUser = function(userId, user) {
    let updates= {
        name: user.name,
        phoneNumber: user.mobile,
        aadharCardNo: user.aadharCardNo,
        password: user.password,
    }
    return  User.findByIdAndUpdate(userId, updates);
};


exports.addCompanyToUser = function(userId, company) {
    return  User.findByIdAndUpdate(
        userId,
      { $push: { companies: company._id } },
      { new: true, useFindAndModify: false }
    );
};
  