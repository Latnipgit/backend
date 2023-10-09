const db = require("../../models/user");
const commondb = require("../../models/common");
const Subscription = db.subscription;
const SubscriptionIdRemQuotaMapping = db.subscriptionIdRemQuotaMapping;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')
const { addMonths, format } = require('date-fns');

// subscription Id remaining Quota Mapping methods -----------------------------------------------------------------------------
exports.addSubIdRemQtMapping = async(req, res) => {
    try {
        const mapping = await SubscriptionIdRemQuotaMapping.findOne({ subscriptionId: req.body.subscriptionId, apiName: req.body.apiName});
        if (mapping) {
            return res.status(409).send({ message: "Mapping Already Exists.", success: false });
        }

        const SubscriptionIdRemQuotaMapping = await SubscriptionIdRemQuotaMapping.create({
                subscriptionId: req.body.subscriptionId,
                apiName: req.body.apiName,
                limitRemaining: req.body.limitRemaining
            })

        res.status(201).json({ message: "Mapping added successfully.", success: true, response: SubscriptionIdRemQuotaMapping });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getAllSubIdRemQtMapping = async(req, res) => {
    try {
        let mappings = await SubscriptionIdRemQuotaMapping.find();
        res.status(201).json({ message: "Mappings found.", success: true, response: mappings });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getSubIdRemQtMappingById = async(req, res) => {
    try {
        const subPkg = await SubscriptionIdRemQuotaMapping.findOne({ _id: req.body.remQuotaId});
        if (subPkg) {
            res.status(201).json({ message: "Mapping found.", success: true, response: subPkg });
        }else{
            res.status(409).send({ message: "Mapping Does Not Exists.", success: false, reponse: "" });
        }
        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.updateSubIdRemQtMappingById = async(req, res) => {
    try {
        let updateMapping = {
            subscriptionId: req.body.subscriptionId,
            apiName: req.body.apiName,
            limitRemaining: req.body.limitRemaining
        }
        const updatedMapp = await SubscriptionIdRemQuotaMapping.findByIdAndUpdate({ _id: req.body.remQuotaId}, updateMapping);
        res.status(201).json({ message: "Mapping updated.", success: true, response: updatedMapp});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.deleteSubIdRemQtMappingById = async(req, res) => {
    try {
        const remMapping = await SubscriptionIdRemQuotaMapping.findByIdAndRemove({ _id: req.body.remQuotaId });
        res.status(201).json({ message: "Mapping deleted.", success: true, response: remMapping });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};



// subscription methods --------------------------------------------------------------------------------------------------------
exports.addSubscription = async(req, res) => {
    try {
        const sub = await Subscription.findOne({ userId: req.token.userDetails.id, isActive: true});
        let endDate = null;
        let startDate = new Date();
        if (sub) {
            if(req.body.isForce == false){
                return res.status(409).send({ message: "Subscription Already Exists.", success: false });
            }else if(req.body.isForce == true){
                // found subscription and force is true here, disable previous subscription here
                let updateData = {
                    isActive: false
                }
                const updatedMapp = await Subscription.findByIdAndUpdate({ _id: sub._id}, updateData );
            }
        }

        if(req.body.tenure == "Monthly"){
            let updatedDate= addMonths(startDate, 1);
            endDate = format(updatedDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx')
        }else if(req.body.tenure == "Yearly"){
            let currentDate = new Date();
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            endDate = currentDate.toISOString();
        }

        const RSubscription = await Subscription.create({
                userId: req.token.userDetails.id,
                subscriptionPkgId: req.token.subscriptionPkgId,
                startDate: startDate.toISOString(),
                endDate: endDate,
                tenure: req.body.tenure,
                isActive: true
            })
        
        const mapping = await SubscriptionIdRemQuotaMapping.findOne({ subscriptionId: req.body.subscriptionId, apiName: req.body.apiName});
        if (mapping) {
            // if already present, remove that mapping
            const sub = await Subscription.findByIdAndRemove({ _id: req.body.subscriptionId });
        }
        // bring subscription package from pkg id and check with tenure and amount from package, assign limit on that basis
        // create new mapping 
        const SubscriptionIdRemQuotaMapping = await SubscriptionIdRemQuotaMapping.create({
                subscriptionId: req.body.subscriptionId,
                apiName: req.body.apiName,
                limitRemaining: req.body.limitRemaining
            })

        res.status(201).json({ message: "Subscription added successfully.", success: true, response: RSubscription });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getAllSubscription = async(req, res) => {
    try {
        let sub = await Subscription.find();
        res.status(201).json({ message: "Subscriptions found.", success: true, response: sub });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getSubscriptionById = async(req, res) => {
    try {
        const subPkg = await Subscription.findOne({ _id: req.body.subscriptionId});
        if (subPkg) {
            res.status(201).json({ message: "Subscription found.", success: true, response: subPkg });
        }else{
            res.status(409).send({ message: "Subscription Does Not Exists.", success: false, reponse: "" });
        }
        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.deleteSubscriptionById = async(req, res) => {
    try {
        const sub = await Subscription.findByIdAndRemove({ _id: req.body.subscriptionId });
        res.status(201).json({ message: "Subscription deleted.", success: true, response: sub });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};