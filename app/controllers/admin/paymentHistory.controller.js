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
