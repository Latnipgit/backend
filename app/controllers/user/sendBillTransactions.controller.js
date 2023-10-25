const db = require("../../models/user");
const admin_db = require("../../models/admin");
const SendBillTransactions = db.sendBillTransactions;
const Debtors = db.debtors;
const PaymentHistory = admin_db.paymentHistory;

exports.create = async(req, res) => {
    try{
    // Validate request
        const debtor = await Debtors.findOne({ _id: req.body.debtorId });
            if (!debtor) {
                console.log("debtor not found", req.body.debtorId)
                return res.status(409).send({ message: "debtor not found", success: false, response: "" });
            }
        // Debtors.find(condition)
        //     .then(debtor => {
        //         debtor = debtor ? debtor[0] : null
        //         console.log("debtor in send bill transaction", debtor)
        //         const id = req.token.companyDetails.id;

            // Create a SendBillTransactions
            const bill = await SendBillTransactions.create({
                debtor: debtor,
                debtorId: req.body.debtorId,
                billDate: req.body.billDate,
                billDescription: req.body.billDescription,
                billNumber: req.body.billNumber,
                creditAmount: req.body.creditAmount,
                remainingAmount: req.body.creditAmount, 
                status: "OPEN",
                interestRate: req.body.interestRate,
                creditorCompanyId: req.token.companyDetails.id,
                creditLimitDays: req.body.creditLimitDays,
                Remark: req.body.Remark
            });

        res.status(201).json({ message: "sendbill added successfully.", success: true, response: this.bill });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }

};

