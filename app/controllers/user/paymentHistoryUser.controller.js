const db = require("../../models/admin/");
const user_db = require("../../models/user");

const PaymentHistory = db.paymentHistory;
const SendBillTrans = user_db.sendBillTransactions;

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
        
        return res.status(409).send({ message: "Payment verification Done directly from creditor side", success: true, response: this.pmtHistory });

        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};