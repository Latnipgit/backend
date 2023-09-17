const db = require("../../models/user");
const commondb = require("../../models/common/");
const Debtors = db.debtors;
const Companies = db.companies;
const SendBillTrans = db.sendBillTransactions;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')

// Create and Save a new Tutorial
exports.add = async(req, res) => {

    try{
        //console.log(req.token)
        const id = req.token.companyDetails.id
        //console.log("logged in company details", req.body.companyDetails)
        const debtor = new Debtors({
            ownerName: req.body.ownerName,
            ownerMobile: req.body.ownerMobile,
            companyName: req.body.companyName,
            gstin: req.body.gstin,
            companyPan: req.body.companyPan,
            creditorCompanyId: id
        });
        const data = await debtor.save(debtor);
        res.send({message: 'Debtor added', success: true, response: data});

    }catch(error){
        res.status(500).send({
            message: error.message || "Something went wrong.",
            success:false,
            response: null
        });
    }

};

exports.getDebtors = async(req, res) => {

    try{

        const id = req.token.companyDetails.id;
        var condition = { creditorCompanyId: id };
        const data = await Debtors.find(condition)
        res.send({message: 'found', success: true, response: data});

    }catch(error){
        res.status(500).send({
            message: error.message || "Something went wrong.",
            success:false,
            response: null
        });
    }

};


exports.getCreditors = async(req, res) => {

    try{

        const pancard = req.body.session.companyDetails.companyPan;
        var condition = { companyPan: pancard };

        const data = await Debtors.find(condition)
        res.send({message: 'found creditors', success: true, response: data});

    }catch(error){
        res.status(500).send({
            message: error.message || "Something went wrong.",
            success:false,
            response: null
        });
    }

};

exports.getAllDebtorsByCompanyId = async(req, res) => {
    try{
        const dbtrs = await Debtors.find({creditorCompanyId:req.token.companyDetails.id});
        res.status(200).json({message: 'Debtors list fetched for company.', success: true, response: dbtrs});
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllCreditorsByCompanyId = async(req, res) => {
    try{
        const dbtrs = await Debtors.find({gstin:req.token.companyDetails.gstin});
        //console.log(dbtrs);
        let crdtrs = [];
        for(let i = 0; i < dbtrs.length; i++){
            console.log(dbtrs[i]);
            crdtrs[i] = await Companies.findOne({_id:dbtrs[i].creditorCompanyId});
            //console.log(crdtrs[i]);
        }
        res.status(200).json({message: 'Creditors list fetched for company.', success: true, response: crdtrs});
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllInvoicesSentToMe = async(req, res) => {
    try{
        const dbtrs = await Debtors.find({gstin:req.token.companyDetails.gstin});
        //console.log(dbtrs);
        let crdtrs = [];
        for(let i = 0; i < dbtrs.length; i++){
            //console.log(dbtrs[i]);
            crdtrs[i] = await SendBillTrans.findOne({creditorCompanyId:dbtrs[i].creditorCompanyId});
            //console.log(crdtrs[i]);
        }
        res.status(200).json({message: 'Invoices sent for you are fetched', success: true, response: crdtrs});
    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllInvoicesRaisedByMe = async(req, res) => {
    try{
        const invoices = await SendBillTrans.find({creditorCompanyId:req.token.companyDetails.id});
        res.status(200).json({message: 'Invoices raised by you are fetched', success: true, response: invoices});
    }catch(error){
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

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
exports.deleteAll = (req, res) => {
    Tutorial.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Tutorials were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all tutorials."
            });
        });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
    Tutorial.find({ published: true })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};