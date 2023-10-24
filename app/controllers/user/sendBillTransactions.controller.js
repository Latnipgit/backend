const db = require("../../models/user");
const admin_db = require("../../models/admin");
const SendBillTransactions = db.sendBillTransactions;
const Debtors = db.debtors;
const PaymentHistory = admin_db.paymentHistory;

// Create and Save a new Tutorial
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

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

    Tutorial.find(condition)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Tutorial.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Tutorial with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Tutorial with id=" + id });
        });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Tutorial.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`
                });
            } else res.send({ message: "Tutorial was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Tutorial with id=" + id
            });
        });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Tutorial.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
                });
            } else {
                res.send({
                    message: "Tutorial was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Tutorial with id=" + id
            });
        });
};

// Delete all Tutorials from the database.
//Tutorial.deleteMany({})