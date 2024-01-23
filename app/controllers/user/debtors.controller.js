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
const service = require("../../service/user/");
const debtorService = service.debtor
const defaulterEntryService = service.defaulterEntry;
const constants = require('../../constants/userConstants');
const subscriptionService = service.subscription;


// Create and Save a new Tutorial
exports.add = async(req, res) => {

    try{
        //console.log(req.token)
        req.body.creditorCompanyId = req.token.companyDetails.id
        //console.log("logged in company details", req.body.companyDetails)
        
        
        const data = await debtorService.addDebtor(req.body)
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
        let condition = { creditorCompanyId: id };
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
        let condition = { companyPan: pancard };

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
        const dbtrs = await Debtors.find({creditorCompanyId:req.token.companyDetails.id}).populate("ratings");
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

exports.getAllCreditorsByDebtorId = async(req, res) => {
    try{
        const dbtr = await Debtors.findOne({_id:req.body.debtorId});
        const dbtrs = await Debtors.find({gstin: dbtr.gstin});
        let credIds = dbtrs.map(item => item.creditorCompanyId);

        const crdtrs = await Companies.find({ _id: { $in: credIds } });
        let allEntries = []
        for( let elem of dbtrs){
            let entries = await defaulterEntryService.findInvoicesForCreditorPendingByDebtor(elem.creditorCompanyId, elem._id.toString(), { $or: [ {status: constants.INVOICE_STATUS.PENDING} , {status: constants.INVOICE_STATUS.DEFAULTED}] }).populate("invoices")
            allEntries.push(...entries)
            console.log(allEntries)
        }
        let totalAmount = 0;
        for( let elem of allEntries){
            let i=0;
            // finding matching creditor from invoice
            while(i<crdtrs.length && crdtrs[i]._id != elem.creditorCompanyId){
                i++;
            }
            if(i>= crdtrs.length){   
                 console.log("creditor not found")
                 break;
            }
            crdtrs[i] = crdtrs[i].toJSON()

            // finding lowest duefrom date
            for(let invoice of elem.invoices){
                if(crdtrs[i].dueFrom){
                    if(crdtrs[i].dueFrom > invoice.dueDate) {
                        crdtrs[i].dueFrom = invoice.dueDate
                    }
                } else {
                    crdtrs[i].dueFrom = invoice.dueDate
                }
            }
            crdtrs[i].dueFrom = commonUtil.getDateInGeneralFormat(crdtrs[i].dueFrom)
            crdtrs[i].status = elem.status

            //finding totalAmount
            crdtrs[i].totalAmount = 0;
            crdtrs[i].totalAmount += Number(elem.totalAmount)
        }

        res.status(200).json({message: 'Creditors list fetched for company.', success: true, response: crdtrs});
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}


exports.companySearch = async(req, res) => {
    try{
        // find in subscription by userId and isActive  => get subscription Id
        // find Rem Quota mapp . limit remaining using sId
        const updateRemQuota = await subscriptionService.updateRemQuota(req.token.userDetails);

        if(updateRemQuota){

            // data = await companyService.findCompany(req.body);
            data = await debtorService.companySearch(req.body).populate("ratings");
            for(let i=0;i<data.length;i++) {
                const dbtrs = await Debtors.find({gstin: data[i].gstin});
                let debtordIds = dbtrs.map(item => item._id);
        
                let allEntries = await defaulterEntryService.findInvoicesPendingByDebtorIds( debtordIds, { $or: [ {status: constants.INVOICE_STATUS.PENDING} , {status: constants.INVOICE_STATUS.DEFAULTED}] }).populate("invoices")
                data[i] = data[i].toJSON()
                data[i].totalAmount = 0;

                for( let elem of allEntries){
                    // finding lowest duefrom date
                    for(let invoice of elem.invoices){
                        if(data[i].dueFrom){
                            if(data[i].dueFrom > invoice.dueDate) {
                                data[i].dueFrom = invoice.dueDate
                            }
                        } else {
                            data[i].dueFrom = invoice.dueDate
                        }
                    }
                    data[i].dueFrom = commonUtil.getDateInGeneralFormat(data[i].dueFrom)
        
                    //finding totalAmount
                    data[i].totalAmount += Number(elem.totalAmount)
                }
        
            }
            if (!data){
                res.status(404).send({ message: "Not found company ", success: false, response: ""});
            }else{
                res.status(200).json({ message: "Search successful", success: true, response: data});
            }
        } else{
            res.status(200).send({ message: "you don't have an active subscription. Please purchase one suubscription to continue.", success: false, response: ""});
        }
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Error retrieving company", success: false, response: ""});
    }
};
