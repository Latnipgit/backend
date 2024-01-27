const db = require("../../models/user");
const admin_db = require("../../models/admin");
const commondb = require("../../models/common/");
const Documents = commondb.documents;

const SendBillTransactions = db.sendBillTransactions;
const defaulterEntry = db.defaulterEntry; 
const PaymentHistory = admin_db.paymentHistory;
const Debtor = db.debtors;

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

exports.updateDefaulterEntry = async function(reqBody) {
  let tempArray = [];
  const deftEnt = await defaulterEntry.findByIdAndUpdate(reqBody.defaulterEntryId,{
    // creditorCompanyId: reqBody.creditorCompanyId,
    status: reqBody.status,
    totalAmount: reqBody.totalAmount,
  }, {new: true});

  // const deftEntNew = await defaulterEntry.findById(reqBody.defaulterEntryId);
  // console.log(deftEntNew);
  tempArray = deftEnt.invoices
  let sendB;
  for(let i= 0; i < tempArray.length; i++){

    let purchaseOrderDocument = null;
    let challanDocument= null;
    let invoiceDocument= null;
    let transportationDocument=null;
    let otherDocuments = null;
    if(reqBody.invoices[i].purchaseOrderDocument) purchaseOrderDocument = await Documents.findById(reqBody.invoices[i].purchaseOrderDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) challanDocument = await Documents.findById(reqBody.invoices[i].challanDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) invoiceDocument = await Documents.findById(reqBody.invoices[i].invoiceDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) transportationDocument = await Documents.findById(reqBody.invoices[i].transportationDocument);
    if(reqBody.invoices[i].purchaseOrderDocument) otherDocuments = await Documents.findById(reqBody.invoices[i].otherDocuments);

    const invoiceId = tempArray[i]._id
    sendB = await SendBillTransactions.findByIdAndUpdate(invoiceId, {
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
      transportationDocument: transportationDocument,
      otherDocuments: otherDocuments
      
    });
  
  }

  return await defaulterEntry.findById(reqBody.defaulterEntryId);

};

exports.findInvoicesForCreditorPendingByDebtor = function(creditorId, debtorId, condition) {
  return defaulterEntry.find(
      { creditorCompanyId: creditorId , debtor: debtorId,
      ...condition
      }
      );
};

exports.findInvoicesPendingByDebtorIds = function(debtorIds, condition) {
  return defaulterEntry.find(
      {debtor:{ $in: debtorIds},
      ...condition
      }
      );
};


exports.getCompleteDefaultEntryData = function(condition) {
  

  return defaulterEntry.find(condition).populate([
    { path: 'invoices' },
    { path: 'debtor' },
    { path: 'invoices', populate: [
        { path: 'purchaseOrderDocument' },
        { path: 'challanDocument' },
        { path: 'invoiceDocument' },
        { path: 'transportationDocument' },
        { path: 'otherDocuments' }
      ]
    },
    { path: 'debtor' },
    { path: 'debtor', populate: 'ratings' },
    { path: 'creditorCompanyId', model: 'company' }
  ])
};

exports.createPaymentHistory = function(reqbody, defaulterEntry, newStatus, newPendingWith, isApprovedByCreditor) {
      return PaymentHistory.create({
        defaulterEntryId: reqbody.defaulterEntryId,
        defaulterEntry: defaulterEntry,
        amtPaid: reqbody.amtPaid,
        requestor: reqbody.requestor,
        paymentDate: reqbody.paymentDate,
        paymentMode: reqbody.paymenttMode,
        attachments: reqbody.attachments,
        status: newStatus,
        pendingWith: newPendingWith,
        approvedByCreditor: isApprovedByCreditor,

        isDispute: (reqbody.isDispute && reqbody.isDispute != null )? reqbody.isDispute : false,
        debtorRemarks: reqbody.debtorRemarks
    });
}

exports.getDefaulterCountForSelectedCompany = async function(companyGstin) {
  let debtrs = await Debtor.find({gstin: companyGstin}).select('_id');
  
  // let arrayOfDebtorIds = debtrs.map(debtor => debtor._id);
  let arrayOfDebtorIds = debtrs;
  

  // const reslt = [];
  let ct = 0
  for(let i = 0; i < arrayOfDebtorIds.length ; i++){
    console.log(arrayOfDebtorIds[i])
    const temp = await defaulterEntry.find({debtor: arrayOfDebtorIds[i]._id})
    if(temp){ct += temp.length}
  }

  return ct;

};