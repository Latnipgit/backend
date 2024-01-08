const db = require("../../models/admin/");
const user_db = require("../../models/user/");

const PaymentHistory = db.paymentHistory;
const Companies = user_db.companies;
const DefaulterEntry = user_db.defaulterEntry;
const constants = require('../../constants/userConstants');
const service = require("../../service/admin/");
const paymentHistoryService = service.paymentHistoryService
const mailController=  require('../../controllers/common/mailTemplates.controller')
const mailUtility = require('../../util/mailUtility')


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
            let deftEntry = await DefaulterEntry.findOne({_id: result.defaulterEntryId});
            //let paymentHistoryAndInvoice =  await result.populate("invoice");

            let newtotalAmount = deftEntry.totalAmount - amtPaid;

            let updatedDefaulterEntry = await DefaulterEntry.findByIdAndUpdate({_id: result.defaulterEntryId}, {totalAmount: newtotalAmount});

            return res.status(200).send({ message: "Payment Approved!", success: true, response: {result, updatedDefaulterEntry} });

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
            let transaction = await paymentHistoryService.moveToDocumentsNeededQueue({status:  constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED, paymentId: req.body.paymentId, pendingWith: "USER"}).populate(["defaulterEntry","defaulterEntry.debtor"]);
            //let paymentHistoryAndInvoice =  await result.populate("invoice");
            let creditorDetails = await Companies.findById(transaction.defaulterEntry.creditorCompanyId)
            
            // mail for debtor
            let replacements = [];
            // replacements.push({target: "password", value: password })
            let mailObj = await mailController.getMailTemplate(constants.MAIL_TEMPLATES.SUPPORTING_DOCUMENTS_NEEDED_DEBTOR, replacements)
     
            mailObj.to = transaction.defaulterEntry.debtor.customerEmail
            mailUtility.sendMail(mailObj)
     
            return res.status(200).send({ message: "Transaction has now been moved to Document Needed Queue and mail is sent to Creditor and Debtor", success: true, response: transaction });

        // return res.status(409).send({ message: "Not Implemented", success: true, response: result });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};


