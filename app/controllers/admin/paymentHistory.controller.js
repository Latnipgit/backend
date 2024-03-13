const db = require("../../models/admin/");
const user_db = require("../../models/user/");

const PaymentHistory = db.paymentHistory;
const Companies = user_db.companies;
const Debtors = user_db.debtors;
const Users = user_db.user;
const DefaulterEntry = user_db.defaulterEntry;
const constants = require('../../constants/userConstants');
const service = require("../../service/admin/");
const userService = require("../../service/user/user.service");
const paymentHistoryService = service.paymentHistoryService
const mailController=  require('../../controllers/common/mailTemplates.controller')
const mailUtility = require('../../util/mailUtility')
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')


exports.getAllApprovedTransactions = async(req, res) => {
    try {
        let approvedTransactions = await PaymentHistory.find({
            status: constants.PAYMENT_HISTORY_STATUS.APPROVED,
        });

        return res.status(200).send({ message: "", success: true, response: approvedTransactions });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};


exports.getAllDisputedTransactions = async(req, res) => {
    try {
        let disputedTransactions = await PaymentHistory.find({
            status: constants.PAYMENT_HISTORY_STATUS.REJECTED,
        });

        return res.status(200).send({ message: "", success: true, response: disputedTransactions });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};


exports.approveOrRejectPayment = async(req, res) => {
    try {
        let status = null;
        let paymentId= req.body.paymentId;
        let amtPaid = req.body.amtPaid;

        if(req.body.approve == true){
            status = constants.PAYMENT_HISTORY_STATUS.APPROVED;
            result = await paymentHistoryService.updatePaymentHistoryStatus({status, paymentId});
            let deftEntry = await DefaulterEntry.findById(result.defaulterEntryId);
            //let paymentHistoryAndInvoice =  await result.populate("invoice");

            deftEntry.totalAmount = deftEntry.totalAmount - result.amtPaid;
            if(deftEntry.totalAmount<=0){
                deftEntry.status=  constants.INVOICE_STATUS.PAID
            }
            deftEntry.save()

            return res.status(200).send({ message: "Payment Approved!", success: true, response: {result, deftEntry} });

        } else if(req.body.approve == false){
            status = constants.PAYMENT_HISTORY_STATUS.REJECTED;
            result = await paymentHistoryService.updatePaymentHistoryStatus({status, paymentId});
            return res.status(200).send({ message: "Payment Rejected", success: true, response: result });
        }
        // return res.status(409).send({ message: "Not Implemented", success: true, response: result });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};


exports.askForSupportingDocument = async(req, res) => {
    try {
            let transaction = await paymentHistoryService.moveToDocumentsNeededQueue({
                status: constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED,
                paymentId: req.body.paymentId,
                pendingWith: "USER",
                documentsRequiredFromCreditor: req.body.documentsRequiredFromCreditor,
                documentsRequiredFromDebtor: req.body.documentsRequiredFromDebtor,
                isDocumentsRequiredByCreditor: req.body.isDocumentsRequiredByCreditor,
                isDocumentsRequiredByDebtor: true,
                adminRemarksForDebtor: req.body.adminRemarksForDebtor,
                adminRemarksForCreditor: req.body.adminRemarksForCreditor
            }).populate([
                {path: "defaulterEntry"},
                { path: 'defaulterEntry', populate: ['invoices']},
                {path: "defaulterEntry.debtor"},
                { path: "defaulterEntry", populate: { path: "debtor", select: "customerEmail" } }
            ]);
            
            // mail for debtor
            let replacements = [];
            linkToken = jwtUtil.generateCustomToken({"paymentId": transaction.id, "type": "DEBTOR"}, "CUSTOM");
            const link = `${process.env.USER_FRONTEND_BASE_URL}/upload-supporting-document-direct?token=/${linkToken}&userType=DEBTOR`;
            replacements.push({target: "UPLOAD_SUPPORTING_DOCUMENTS_LINK", value: link })

            let mailObj = await mailController.getMailTemplate(constants.MAIL_TEMPLATES.SUPPORTING_DOCUMENTS_NEEDED_DEBTOR, replacements)
            mailObj.to = transaction.defaulterEntry.debtor.customerEmail

            let debtorDocumentIds = []
            debtorDocumentIds.push(transaction.debtorcacertificate);
            debtorDocumentIds.push(...transaction.debtoradditionaldocuments);

            mailUtility.sendEmailWithAttachments(mailObj, debtorDocumentIds);

            if(req.body.isDocumentsRequiredByCreditor){
                let credMail = await userService.getCompanyOwner(transaction.defaulterEntry.creditorCompanyId).select("emailId");

                // mail for creditor
                let creditorReplacements = [];
                linkToken = jwtUtil.generateCustomToken({"paymentId": transaction.id, "type": "CREDITOR"}, "CUSTOM");
                const link = `${process.env.USER_FRONTEND_BASE_URL}/upload-supporting-document-direct?token=/${linkToken}&userType=CREDITOR`;
                creditorReplacements.push({target: "UPLOAD_SUPPORTING_DOCUMENTS_LINK", value: link })

                let mailObj2 = await mailController.getMailTemplate(constants.MAIL_TEMPLATES.SUPPORTING_DOCUMENTS_NEEDED_CREDITOR, creditorReplacements)
                mailObj2.to = credMail

                let credDocumentIds = []
                if (transaction.creditorcacertificate) {
                    credDocumentIds.push(transaction.creditorcacertificate);
                }
                if (transaction.creditoradditionaldocuments) {
                    credDocumentIds.push(...transaction.creditoradditionaldocuments);
                }
            
                let invoices = transaction.defaulterEntry.invoices;
                
                for (let i = 0; i < invoices.length; i++) {
                    let invoice = invoices[i];
                    let invoiceDocuments = []; 

                    if (invoice.purchaseOrderDocument) {
                        invoiceDocuments.push(invoice.purchaseOrderDocument);
                    }
                    if (invoice.challanDocument) {
                        invoiceDocuments.push(invoice.challanDocument);
                    }
                    if (invoice.invoiceDocument) {
                        invoiceDocuments.push(invoice.invoiceDocument);
                    }
                    if (invoice.transportationDocument) {
                        invoiceDocuments.push(invoice.transportationDocument);
                    }

                    credDocumentIds.push(...invoiceDocuments);
                }

                mailUtility.sendEmailWithAttachments(mailObj2, credDocumentIds)
            }
     
            return res.status(200).send({ message: "Transaction has now been moved to Document Needed Queue and mail is sent to Creditor and Debtor", success: true, response: transaction });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};



exports.getDocumentsRequiredFromPaymentId = async(req, res) => {
    try {
        const token = jwtUtil.verifyCustomToken(req.body.token);
        console.log(token);
        const _paymentId = token.tokenDetails.paymentId;
        const _userType = token.tokenDetails.type;
        const result = await service.paymentHistoryService.getDocumentsRequiredFromPaymentId(_paymentId, _userType);
        return res.status(200).send({ message: "Records returned", success: true, response: result });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
}
}