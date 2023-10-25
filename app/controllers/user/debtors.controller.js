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
