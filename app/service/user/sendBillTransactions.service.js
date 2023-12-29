const db = require("../../models/user");
const commondb = require("../../models/common/");

const SendBillTransactions = db.sendBillTransactions;
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
const constants = require('../../constants/userConstants');


exports.defaultInvoiceById = function(invoiceId) {
    return SendBillTransactions.findByIdAndUpdate(
        invoiceId
        ,
        { status: constants.INVOICE_STATUS.DEFAULTED },
        { new: true }
      );
};


// exports.getUserById = function(userId) {
//     return  User.findById(userId);
// };


// exports.updateUser = function(userId, user) {
//     let updates= {
//         name: user.name,
//         phoneNumber: user.mobile,
//         aadharCardNo: user.aadharCardNo,
//         password: user.password,
//     }
//     return  User.findByIdAndUpdate(userId, updates);
// };


// exports.addCompanyToUser = function(userId, company) {
//     return  User.findByIdAndUpdate(
//         userId,
//       { $push: { companies: company._id } },
//       { new: true, useFindAndModify: false }
//     );
// };
  