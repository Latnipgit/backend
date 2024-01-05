const db = require("../../models/user");
const commondb = require("../../models/common/");

const SendBillTransactions = db.sendBillTransactions;
const defaulterEntry = db.defaulterEntry; 

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


exports.defaultInvoiceById = function(defaulterEntryId) {
    return defaulterEntry.findByIdAndUpdate(
        defaulterEntryId
        ,
        { status: constants.INVOICE_STATUS.DEFAULTED },
        { new: true }
      );
};


exports.createEntry = function(defaulterEntryList, debtor, status, totalAmount,companyDetails) {
  const result = defaulterEntry.create({
      debtor: debtor,
      creditorCompanyId: companyDetails.id, 
      invoices: defaulterEntryList,
      status: status,
      totalAmount: totalAmount
  });

  let replacements = [];
  replacements.push({target: "alertMessage", value: "Invoices have been marked default, kindly check." })
  mailObj = mailController.getMailTemplate("DEFAULTER_ENTRY_CREATE", replacements)

  mailObj.to = debtor.customerEmail
  mailUtility.sendMail(mailObj)

  return result;

};
  

exports.getCompleteDefaultEntryData = function(condition) {
  return defaulterEntry.find(condition).populate("invoices debtor invoices.purchaseOrderDocument invoices.challanDocument invoices.invoiceDocument invoices.transportationDocument");
};
  