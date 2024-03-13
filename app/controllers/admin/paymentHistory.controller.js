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
            
            // status = constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED;
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
            // }).populate(["defaulterEntry", "defaulterEntry.debtor"]);
            }).populate([
                {path: "defaulterEntry"},
                {path: "defaulterEntry.debtor"},
                { path: "defaulterEntry", populate: { path: "debtor", select: "customerEmail" } }
            ]);
                        //let paymentHistoryAndInvoice =  await result.populate("invoice");
            // let creditorDetails = await Companies.findById(transaction.defaulterEntry.creditorCompanyId);
            
            // mail for debtor
            let replacements = [];
            linkToken = jwtUtil.generateCustomToken({"paymentId": transaction.id, "type": "DEBTOR"}, "CUSTOM");
            const link = `${process.env.USER_FRONTEND_BASE_URL}/upload-supporting-document-direct?token=/${linkToken}`;
            replacements.push({target: "UPLOAD_SUPPORTING_DOCUMENTS_LINK", value: link })

            let mailObj = await mailController.getMailTemplate(constants.MAIL_TEMPLATES.SUPPORTING_DOCUMENTS_NEEDED_DEBTOR, replacements)
            mailObj.to = transaction.defaulterEntry.debtor.customerEmail
            mailUtility.sendMail(mailObj)

            if(req.body.isDocumentsRequiredByCreditor){
                let credMail = await userService.getCompanyOwner(transaction.defaulterEntry.creditorCompanyId).select("emailId");

                // mail for creditor
                let creditorReplacements = [];
                linkToken = jwtUtil.generateCustomToken({"paymentId": transaction.id, "type": "CREDITOR"}, "CUSTOM");
                const link = `${process.env.USER_FRONTEND_BASE_URL}/upload-supporting-document-direct?token=/${linkToken}`;
                creditorReplacements.push({target: "UPLOAD_SUPPORTING_DOCUMENTS_LINK", value: link })

                let mailObj2 = await mailController.getMailTemplate(constants.MAIL_TEMPLATES.SUPPORTING_DOCUMENTS_NEEDED_CREDITOR, creditorReplacements)
                mailObj2.to = credMail
                mailUtility.sendMail(mailObj2)
            }//658c45c62a986850aee382d9
     
            return res.status(200).send({ message: "Transaction has now been moved to Document Needed Queue and mail is sent to Creditor and Debtor", success: true, response: transaction });

        // return res.status(409).send({ message: "Not Implemented", success: true, response: result });
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