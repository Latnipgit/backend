const db = require("../../models/user");
const admin_db = require("../../models/admin");
const commondb = require("../../models/common/");
const Documents = commondb.documents;

const SendBillTransactions = db.sendBillTransactions;
const defaulterEntry = db.defaulterEntry; 
const PaymentHistory = admin_db.paymentHistory;

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

exports.updateDefaulterEntry = function(reqBody) {
  let tempArray = [];
  const deftEnt = defaulterEntry.findByIdAndUpdate(reqBody.defaulterEntryId,{
    creditorCompanyId: reqBody.creditorCompanyId,
    status: reqBody.status,
    totalAmount: reqBody.totalAmount
  }, {new: true});

  const deftEntNew = defaulterEntry.findById(reqBody.defaulterEntryId);
  console.log(deftEntNew);
  tempArray = deftEntNew.invoices
  for(let i= 0; i < tempArray.length; i++){

    let purchaseOrderDocument = null;
    let challanDocument= null;
    let invoiceDocument= null;
    let transportationDocument=null;
    if(reqBody.invoices[i].purchaseOrderDocument) purchaseOrderDocument = Documents.findById(reqBody.invoices[i].purchaseOrderDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) challanDocument = Documents.findById(reqBody.invoices[i].challanDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) invoiceDocument = Documents.findById(reqBody.invoices[i].invoiceDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) transportationDocument = Documents.findById(reqBody.invoices[i].transportationDocument);

    const invoiceId = tempArray[i]._id
    SendBillTransactions.updateOne({ _id: invoiceId }, {
      billDate: reqBody.invoices[i].billDate,
      billDescription: reqBody.invoices[i].billDescription,
      billNumber: reqBody.invoices[i].billNumber,
      creditAmount: reqBody.invoices[i].creditAmount,
      remainingAmount: reqBody.invoices[i].creditAmount, 

      interestRate: reqBody.invoices[i].interestRate,
      creditLimitDays: reqBody.invoices[i].creditLimitDays,
      remark: reqBody.invoices[i].remark,
      items: reqBody.invoices[i].items,
      subTotal: reqBody.invoices[i].subTotal,
      tax: reqBody.invoices[i].tax,

      referenceNumber: reqBody.invoices[i].referenceNumber,
      invoiceNumber: reqBody.invoices[i].invoiceNumber,
      dueDate: reqBody.invoices[i].dueDate,
      percentage: reqBody.invoices[i].percentage,

      purchaseOrderDocument: purchaseOrderDocument,
      challanDocument: challanDocument,
      invoiceDocument: invoiceDocument,
      transportationDocument: transportationDocument
      
    });
  }

  return defaulterEntry.findById(reqBody.defaulterEntryId);

};


exports.getCompleteDefaultEntryData = function(condition) {
  return defaulterEntry.find(condition).populate("invoices debtor invoices.purchaseOrderDocument invoices.challanDocument invoices.invoiceDocument invoices.transportationDocument");
};

exports.createPaymentHistory = function(reqbody, newStatus, newPendingWith, newApprovedByCreditor) {
      return PaymentHistory.create({
        defaulterEntryId: reqbody.defaulterEntryId,
        amtPaid: reqbody.amtPaid,
        requestor: reqbody.requestor,
        paymentDate: reqbody.paymentDate,
        paymentMode: reqbody.paymenttMode,
        attachments: reqbody.attachments,
        status: newStatus,
        pendingWith: newPendingWith,
        approvedByCreditor: newApprovedByCreditor
    });
}
