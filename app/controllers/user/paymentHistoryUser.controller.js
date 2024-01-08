const db = require("../../models/admin/");
const user_db = require("../../models/user");

const PaymentHistory = db.paymentHistory;
const SendBillTrans = user_db.sendBillTransactions;
const Debtors = user_db.debtors;
const constants = require('../../constants/userConstants');

exports.confirmPaymentByCreditor = async(req, res) => {
    try {

        const pHistory = await PaymentHistory.findOne({ invoiceId: req.body.invoiceId, status: "PENDING" });
        if (pHistory) {
            const pmtHistory = await PaymentHistory.findByIdAndUpdate(pHistory._id,{
                invoiceId: req.body.invoiceId,
                amtPaid: req.body.amtPaid,
                proofFiles: "",
                status: "APPROVED",
                pendingWith: "",
                approvedByCreditor: "true"
            }, {new: true});
    
        }else{
            const pmtHistory = await PaymentHistory.create({
                invoiceId: req.body.invoiceId,
                amtPaid: req.body.amtPaid,
                proofFiles: "",
                status: "APPROVED",
                pendingWith: "",
                approvedByCreditor: "true"
            });
        };
        
        let invoice = await SendBillTrans.findOne({_id: req.body.invoiceId});
        let newRemainingAmount = invoice.remainingAmount - amtPaid;
        let updatedSendBill = await SendBillTrans.findByIdAndUpdate({_id: result.invoiceId}, {remainingAmount: newRemainingAmount});
        
        return res.status(200).send({ message: "Payment verification Done directly from creditor side", success: true, response: this.pmtHistory });

        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};


exports.getTransactionsPendingForDocs = async(req, res) => {
    try {
        let debtorIds = await Debtors.find({ gstin: req.token.companyDetails.gstin}).select('_id').lean();
        let pHistory = await PaymentHistory.find({
            status: constants.PAYMENT_HISTORY_STATUS.DOCUMENTS_NEEDED,
            $or: [
              { creditorCompanyId: req.token.companyDetails.id },
              { debtorId: { $in: debtorIds } }
            ]
          });
        
        return res.status(200).send({ message: "List fethed", success: true, response: pHistory });

        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};