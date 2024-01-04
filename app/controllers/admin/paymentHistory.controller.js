const db = require("../../models/admin/");

const PaymentHistory = db.paymentHistory;

exports.getAllApprovedTransactions = async(req, res) => {
    try {
        let approvedTransactions = await PaymentHistory.find({
            status: "APPROVED",
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
            status: "REJECTED",
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
            status = "APPROVED";
            result = await paymentHistory.updatePaymentHistoryStatus({status, paymentId});
            let deftEntry = await DefaulterEntry.findOne({_id: result.defaulterEntryId});
            //let paymentHistoryAndInvoice =  await result.populate("invoice");

            let newtotalAmount = deftEntry.totalAmount - amtPaid;

            let updatedDefaulterEntry = await SendBillTrans.findByIdAndUpdate({_id: result.defaulterEntryId}, {totalAmount: newtotalAmount});

            return res.status(200).send({ message: "Payment Approved!", success: true, response: {result, updatedDefaulterEntry} });

        }else if(req.body.approve == false){
            status = "REJECTED";
            result = await paymentHistory.updatePaymentHistoryStatus({status, paymentId});
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