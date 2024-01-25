const db = require("../../models/admin/");
const user_db = require("../../models/user");
const User = user_db.user;
const SubscriptionPkg = db.subscriptionPkg;
const SubscriptionPkgAPIQuotaMapping = db.subscriptionPkgAPIQuotaMapping;
const constants = require('../../constants/userConstants');

const commondb = require("../../models/common/");
const paymentHistory = require("../../service/admin/paymentHistory.service");

const Admin = db.admin;
const PaymentHistory = db.paymentHistory;
const SendBillTrans = user_db.sendBillTransactions;
const DefaulterEntry = user_db.defaulterEntry;
const Questions = user_db.questions;
const Companies = user_db.companies;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../../controllers/common/mailTemplates.controller')
const mailUtility = require('../../util/mailUtility')
const config = process.env;
const Joi = require("joi");
const crypto = require("crypto");
// const { defaulterEntry } = require("../../service/user");
const service = require("../../service/user/");
const defaulterEntryService = service.defaulterEntry;

exports.addAdmin = async(req, res) => {

    try {
        const oldUser = await Admin.findOne({ emailId: req.body.emailId });
        if (oldUser) {
            return res.status(409).send({ message: "User Already Exists.", success: false, response: "" });
        }
        password = commonUtil.generateRandomPassword()
        let encryptedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
                name: req.body.name,
                userName: req.body.emailId,
                emailId: req.body.emailId,
                password: encryptedPassword,
                passwordChangeNeeded: true,
                phoneNumber: req.body.phoneNumber,
                joinedOn: new Date(0),
                adminRole: req.body.adminRole
            })
        
            // Create token
        // admin.token = jwtUtil.generateAdminToken(admin);
        let replacements = [];
        replacements.push({target: "password", value: password })
        mailObj = await mailController.getMailTemplate("ADMIN_SIGNUP", replacements)

        mailObj.to = req.body.emailId
        mailUtility.sendMail(mailObj)

        // return new user
        res.status(201).json({ message: "User added successfully.", success: true, response: this.admin });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.changePasswordUsingToken = async(req, res) => {
    try {
        var decodedToken = jwt.verify(req.body.passwordChangeToken, config.TOKEN_KEY)
        var query = {_id: decodedToken.adminDetails.id, password: decodedToken.adminDetails.password};
        var newvalues = { $set: {password: await bcrypt.hash(req.body.password, 10) ,passwordChangeNeeded: false}};
        console.log( await Admin.findOne(query))
        let out =await Admin.findOneAndUpdate(query, newvalues)
        
        if(out) {
            res.status(200).json({message: "Password changed successfully.",  success: true});
        } else {
            res.status(200).json({message: "Invalid details provided.",  success: false});
        }
    }catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};


exports.forgetPassword = async(req, res) => {
    try {
        const schema = Joi.object({ emailId: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await Admin.findOne({ emailId: req.body.emailId });
        if (!user)
            return res.status(400).send({message: "user with given email doesn't exist.",  success: false});

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.ADMIN_FRONTEND_BASE_URL}/password-reset/${user._id}/${token.token}`;
        let replacements = [];
        replacements.push({target: "PASSWORD_RESET_LINK", value: link })
        mailObj = await mailController.getMailTemplate("FORGET_PASSWORD", replacements)
 
        mailObj.to = req.body.emailId
        mailUtility.sendMail(mailObj)
 
        res.status(200).json({message: "password reset link sent to your email account.",  success: true});

    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.forgetPasswordLink = async(req, res) => {
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await Admin.findById(req.params.userId);
        if (!user) return res.status(400).send({message: "invalid link or expired.",  success: false});

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send({message: "Invalid link or expired.",  success: false});

        user.password = await bcrypt.hash(req.body.password, 10);
        await user.save();
        await token.delete();

        res.status(200).json({message: "password reset sucessfully.",  success: true});

    } catch (error) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.changePasswordUsingOldPass = async(req, res) => {
    try {
        var query = {_id: req.token.adminDetails.id};
        var newvalues = { $set: {password: await bcrypt.hash(req.body.password, 10) }};
        let user =  await Admin.findOne(query)
        
        if (user && (await bcrypt.compare(req.body.oldPassword, user.password))) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.save()
            res.status(200).json({message: "Password changed successfully.",  success: true});
        } else {
            res.status(200).json({message: "Invalid details provided.",  success: false});
        }
    }catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

// Find a single Tutorial with an id
exports.authenticateAdmin = async(req, res) => {
    try {
        const id = req.body.userName;
        // Validate if user exist in our database
        const user = await Admin.findOne({ userName: req.body.userName });
        if (!user) {
            res.status(200).send({ message: "user not found, Please signup", success: false });
        } else if (user && (await bcrypt.compare(req.body.password, user.password))) {
            // save user token
            if(!user.passwordChangeNeeded){
                user.token = jwtUtil.generateAdminToken(user);
                res.status(200).json({ message: "Logged in Successfully.", success: true, response: user });
            } else {
                let passwordChangeToken = jwtUtil.generateAdminToken(user);
                res.status(200).json({ message: "Please change your password to continue.", success: false , passwordChangeNeeded: true, passwordChangeToken: passwordChangeToken});
            }
        } else {
            res.status(400).send({ message: "Invalid Credentials", success: false });
        }

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    };

};


exports.logout = (req, res) => {
    req.session.destroy();
};
exports.getLoginInfo = async(req, res) => {
    const loggedInUser = await Admin.findOne({ _id: req.token.adminDetails.id });

    if (loggedInUser) {
        res.send({message: 'Login Info', success: true, response: loggedInUser});
    } else {
        res.status(403).send({ message: "Unauthorised", success: false });
    }
};
exports.getAllAdmins = async(req, res) => {
    try {
        let members = await Admin.find();
        // return all members
        res.status(200).json({ message: "Employee list fetched successfully.", success: true, response: members });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};
exports.getAllTransactions = async(req, res) => {
    try {
        let transactions = await PaymentHistory.find({ pendingWith: req.token.adminDetails.adminRole, status : {$ne: constants.PAYMENT_HISTORY_STATUS.APPROVED} }).populate(
        [
            { path: 'defaulterEntry' },
            { path: 'defaulterEntry', populate: {
              path: 'invoices', populate: [
                'purchaseOrderDocument',
                'challanDocument',
                'invoiceDocument',
                'transportationDocument',
                'otherDocuments'
              ]
            }},
            { path: 'defaulterEntry' , populate: {
                path: 'debtor', populate: [
                  'ratings']}
            }
          ]
        );
        let detailed = [];
        // for(let i=0; i<transactions.length; i++){
        //     sendBill = await SendBillTrans.findOne({_id: transactions[i].invoiceId}).populate("purchaseOrderDocument challanDocument invoiceDocument transportationDocument");
        //     let paymentHistory = transactions[i];

        //     detailed[i] = { paymentHistory, Invoice: sendBill
        //         // , debtor: sendBill?.debtor
        //      };
        //     // detailed[i] =  await sendBill.populate("debtor");
        // }
        // console.log(detailed);
        //user =  await userService.getUserById( user._id ).populate("companies");
        // return all transactions
        res.status(200).json({ message: "Transaction list fetched successfully.", success: true, response: transactions });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}
exports.getAllUsers = async(req, res) => {
    try {
        let users = await User.find();
        // return all members
        res.send({message: 'Users list fetched.', success: true, response: users});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, response: null });
    }
};

// subscription pkg methods -----------------------------------------------------------------------------
exports.addSubscriptionPkg = async(req, res) => {
    try {
        const subPkg = await SubscriptionPkg.findOne({ subscriptionPkgName: req.body.subscriptionPkgName });
        if (subPkg) {
            return res.status(409).send({ message: "Package Already Exists.", success: false });
        }

        const subscriptionPkg = await SubscriptionPkg.create({
                subscriptionPkgName: req.body.subscriptionPkgName,
                monthlyAmt: req.body.monthlyAmt,
                yearlyAmt: req.body.yearlyAmt,
                monthlyDiscount: req.body.monthlyDiscount,
                yearlylyDiscount: req.body.yearlylyDiscount
            })

        res.status(201).json({ message: "Subscription Package added successfully.", success: true, response: subscriptionPkg });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getAllSubscriptionPkg = async(req, res) => {
    try {
        let subscriptionPkgs = await SubscriptionPkg.find();
        res.status(201).json({ message: "Subscription Packages found.", success: true, response: subscriptionPkgs });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.getSubscriptionPkgById = async(req, res) => {
    try {
        const subPkg = await SubscriptionPkg.findOne({ _id: req.body.subscriptionPkgId });
        if (subPkg) {
            res.status(201).json({ message: "Subscription Package found.", success: true, response: subPkg });
        }else{
            res.status(409).send({ message: "Package Does Not Exists.", success: false });
        }
        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.updateSubscriptionPkgById = async(req, res) => {
    try {
        let subscriptionPkg = {
            subscriptionPkgName: req.body.subscriptionPkgName,
            monthlyAmt: req.body.monthlyAmt,
            yearlyAmt: req.body.yearlyAmt,
            monthlyDiscount: req.body.monthlyDiscount,
            yearlylyDiscount: req.body.yearlylyDiscount
        }
        const updatedSubPkg = await SubscriptionPkg.findByIdAndUpdate({ _id: req.body.subscriptionPkgId}, subscriptionPkg );
        res.status(201).json({ message: "Subscription Package updated.", success: true, response: updatedSubPkg});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.deleteSubscriptionPkg = async(req, res) => {
    try {
        const subPkg = await SubscriptionPkg.findByIdAndRemove({ _id: req.body.subscriptionPkgId });
        res.status(201).json({ message: "Subscription Package deleted.", success: true, response: subPkg });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

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
                monthlyQuotaLimit: req.body.monthlyQuotaLimit,
                yearlyQuotaLimit: req.body.yearlyQuotaLimit
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
            monthlyQuotaLimit: req.body.monthlyQuotaLimit,
            yearlyQuotaLimit: req.body.yearlyQuotaLimit
        }
        const updatedMapp = await SubscriptionPkgAPIQuotaMapping.findByIdAndUpdate({ _id: req.body.quotaId}, updateMapping );
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

exports.escalateRequest = async(req, res) => {
    try {
        // will receive paymentId and escalate in the body
        let pendingWith= "";
        let paymentId= req.body.paymentId;
        
        let result = null;
        if(req.token.adminDetails.adminRole == "L1"){
            pendingWith="L2";
            result = await paymentHistory.updatePaymentHistoryForEscalate({pendingWith, paymentId});
        }if(req.token.adminDetails.adminRole == "L2"){
            pendingWith="L2";
            result = await paymentHistory.updatePaymentHistoryForEscalate({pendingWith, paymentId});
        }
        return res.status(200).send({ message: "Issue Escalated", success: true, response: result });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};

exports.removeQuestion = async(req, res) => {

    try {
        const q = await Questions.findByIdAndRemove({ _id: req.body.questionId });
       res.status(200).json({success: true, message: "Question deleted successfully", response: q });

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};

exports.companiesFilter = async(req, res) => {
    try {
        const { cities, state } = req.body;

        let filter = {};

        if (cities && cities.length > 0) {
            filter.city = { $in: cities };
        }

        if (state) {
            filter.state = state;
        }

        // if (subStatus) {
        //     filter.subStatus = subStatus;
        // }

        const cmpns = await Companies.find(filter);

        res.status(200).json({success: true, message: "Filtered the result", response: cmpns });

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
}

exports.getDefaulterCountForSelectedCompanies = async(req, res) => {
    try {
        let defEntCnt = []
        for(let i = 0; i < req.body; i++){
            defEntCnt.push(defaulterEntryService.getDefaulterCountForSelectedCompany(req.body[i].gstin));
        }

        res.status(200).json({success: true, message: "Count Retrieved", response: defEntCnt});

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
}
