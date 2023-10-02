const db = require("../../models/user");
const commondb = require("../../models/common");
const SubscriptionPkgAPIQuotaMapping = db.subscriptionPkgAPIQuotaMapping;
const Subscription = db.subscription;
const SubscriptionIdRemQuotaMapping = db.subscriptionIdRemQuotaMapping;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')

// subscription pkg quota mapping methods -----------------------------------------------------------------------------

exports.addSubPkgAPIQtMapping = async(req, res) => {
    try {
        const mapping = await SubscriptionPkgAPIQuotaMapping.findOne({ subscriptionPkgId: req.body.subscriptionPkgId, apiName: req.body.apiName});
        if (mapping) {
            return res.status(409).send({ message: "Mapping Already Exists.", success: false });
        }

        const subscriptionPkgAPIQuotaMapping = await SubscriptionPkgAPIQuotaMapping.create({
                subscriptionPkgId: req.body.subscriptionPkgId,
                apiName: req.body.apiName,
                quotaLimit: req.body.quotaLimit,
                amtPurchase: req.body.amtPurchase
            })

        res.status(201).json({ message: "Mapping added successfully.", success: true, response: subscriptionPkgAPIQuotaMapping });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getAllSubPkgAPIQtMapping = async(req, res) => {
    try {
        let mappings = await SubscriptionPkgAPIQuotaMapping.find();
        res.status(201).json({ message: "Mappings found.", success: true, response: mappings });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getSubPkgAPIQtMappingById = async(req, res) => {
    try {
        const subPkg = await SubscriptionPkgAPIQuotaMapping.findOne({ _id: req.body.quotaId});
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

exports.updateSubPkgAPIQtMappingById = async(req, res) => {
    try {
        let updateMapping = {
            subscriptionPkgId: req.body.subscriptionPkgId,
            apiName: req.body.apiName,
            quotaLimit: req.body.quotaLimit,
            amtPurchase: req.body.amtPurchase
        }
        const updatedMapp = await SubscriptionPkgAPIQuotaMapping.findByIdAndUpdate({ _id: req.body.quotaId, updateMapping });
        res.status(201).json({ message: "Mapping updated.", success: true, response: updatedMapp});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.deleteSubPkgAPIQtMappingById = async(req, res) => {
    try {
        const remMapping = await SubscriptionPkgAPIQuotaMapping.findByIdAndRemove({ _id: req.body.quotaId });
        res.status(201).json({ message: "Mapping deleted.", success: true, response: remMapping });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};





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
        const updatedMapp = await SubscriptionIdRemQuotaMapping.findByIdAndUpdate({ _id: req.body.remQuotaId, updateMapping });
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
        const mapping = await Subscription.findOne({ userId: req.token.userDetails.id, subscriptionPkgId: req.body.subscriptionPkgId});
        if (mapping) {
            return res.status(409).send({ message: "Subscription Already Exists.", success: false });
        }

        const Subscription = await Subscription.create({
                userId: req.token.userDetails.id,
                subscriptionPkgId: req.token.subscriptionPkgId,
                remQuotaId: req.body.remQuotaId,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                amtPurchase: req.body.amtPurchase
            })

        res.status(201).json({ message: "Subscription added successfully.", success: true, response: Subscription });
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
        const subPkg = await Subscription.findOne({ _id: req.body.quotaId});
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

exports.updateSubscriptionById = async(req, res) => {
    try {
        let updateMapping = {
            subscriptionPkgId: req.token.subscriptionPkgId,
            remQuotaId: req.body.remQuotaId,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            amtPurchase: req.body.amtPurchase
        }
        const updatedMapp = await Subscription.findByIdAndUpdate({ _id: req.body.quotaId, updateMapping });
        res.status(201).json({ message: "Subscription updated.", success: true, response: updatedMapp});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.deleteSubscriptionById = async(req, res) => {
    try {
        const remMapping = await Subscription.findByIdAndRemove({ _id: req.body.quotaId });
        res.status(201).json({ message: "Subscription deleted.", success: true, response: remMapping });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};