const db = require("../../models/admin/");
const user_db = require("../../models/user");
const User = user_db.user;
const SubscriptionPkg = db.subscriptionPkg;
const SubscriptionPkgAPIQuotaMapping = db.subscriptionPkgAPIQuotaMapping;
const constants = require('../../constants/userConstants');

const commondb = require("../../models/common/");
const adminServices = require("../../service/admin/");

const paymentHistoryService = adminServices.paymentHistoryService;
const subscriptionPkgService = adminServices.subscriptionPkgService;

const Admin = db.admin;
const PaymentHistory = db.paymentHistory;
const SendBillTrans = user_db.sendBillTransactions;
const DefaulterEntry = user_db.defaulterEntry;
const Questions = user_db.questions;
const Companies = user_db.companies;
const Debtor = user_db.debtors;
const Token = commondb.token;
const Logs = commondb.logs;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')
const mailController = require('../../controllers/common/mailTemplates.controller')
const mailUtility = require('../../util/mailUtility')
const config = process.env;
const Joi = require("joi");
const crypto = require("crypto");
// const { defaulterEntry } = require("../../service/user");
const service = require("../../service/user/");
const defaulterEntryService = service.defaulterEntry;
const userService = service.user;
const debtorService = service.debtor;

exports.addAdmin = async (req, res) => {

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
        let replacements = [];
        replacements.push({ target: "password", value: password })
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

exports.changePasswordUsingToken = async (req, res) => {
    try {
        var decodedToken = jwt.verify(req.body.passwordChangeToken, config.TOKEN_KEY)
        var query = { _id: decodedToken.adminDetails.id, password: decodedToken.adminDetails.password };
        var newvalues = { $set: { password: await bcrypt.hash(req.body.password, 10), passwordChangeNeeded: false } };
        console.log(await Admin.findOne(query))
        let out = await Admin.findOneAndUpdate(query, newvalues)

        if (out) {
            res.status(200).json({ message: "Password changed successfully.", success: true });
        } else {
            res.status(200).json({ message: "Invalid details provided.", success: false });
        }
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};


exports.forgetPassword = async (req, res) => {
    try {
        const schema = Joi.object({ emailId: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await Admin.findOne({ emailId: req.body.emailId });
        if (!user)
            return res.status(400).send({ message: "user with given email doesn't exist.", success: false });

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.ADMIN_FRONTEND_BASE_URL}/password-reset/${user._id}/${token.token}`;
        let replacements = [];
        replacements.push({ target: "PASSWORD_RESET_LINK", value: link })
        mailObj = await mailController.getMailTemplate("FORGET_PASSWORD", replacements)

        mailObj.to = req.body.emailId
        mailUtility.sendMail(mailObj)

        res.status(200).json({ message: "password reset link sent to your email account.", success: true });

    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.forgetPasswordLink = async (req, res) => {
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await Admin.findById(req.params.userId);
        if (!user) return res.status(400).send({ message: "invalid link or expired.", success: false });

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send({ message: "Invalid link or expired.", success: false });

        user.password = await bcrypt.hash(req.body.password, 10);
        await user.save();
        await token.delete();

        res.status(200).json({ message: "password reset sucessfully.", success: true });

    } catch (error) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.changePasswordUsingOldPass = async (req, res) => {
    try {
        var query = { _id: req.token.adminDetails.id };
        var newvalues = { $set: { password: await bcrypt.hash(req.body.password, 10) } };
        let user = await Admin.findOne(query)

        if (user && (await bcrypt.compare(req.body.oldPassword, user.password))) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.save()
            res.status(200).json({ message: "Password changed successfully.", success: true });
        } else {
            res.status(200).json({ message: "Invalid details provided.", success: false });
        }
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

// Find a single Tutorial with an id
exports.authenticateAdmin = async (req, res) => {
    try {
        const id = req.body.userName;
        // Validate if user exist in our database
        const user = await Admin.findOne({ userName: req.body.userName });
        if (!user) {
            res.status(200).send({ message: "user not found, Please signup", success: false });
        } else if (user && (await bcrypt.compare(req.body.password, user.password))) {
            // save user token
            if (!user.passwordChangeNeeded) {
                user.token = jwtUtil.generateAdminToken(user);
                user.refreshToken = jwtUtil.generateAdminRefreshToken(user);
                res.status(200).json({ message: "Logged in Successfully.", success: true, response: user });
            } else {
                let passwordChangeToken = jwtUtil.generateAdminToken(user);
                res.status(200).json({ message: "Please change your password to continue.", success: false, passwordChangeNeeded: true, passwordChangeToken: passwordChangeToken });
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


exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        let payload = await jwtUtil.verifyRefreshToken(refreshToken)

        const accessToken = jwtUtil.signAccessTokenWithPayload(payload)
        const refToken = jwtUtil.signRefreshTokenWithPayload(payload)

        res.send({ message: "New Token generated successfully.", success: true, response: { "token": accessToken, "refreshToken": refToken } })

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
exports.getLoginInfo = async (req, res) => {
    const loggedInUser = await Admin.findOne({ _id: req.token.adminDetails.id });

    if (loggedInUser) {
        res.send({ message: 'Login Info', success: true, response: loggedInUser });
    } else {
        res.status(403).send({ message: "Unauthorised", success: false });
    }
};
exports.getAllAdmins = async (req, res) => {
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
exports.getAllTransactions = async (req, res) => {
    try {
        let transactions = await PaymentHistory.find({ pendingWith: req.token.adminDetails.adminRole, status: { $ne: constants.PAYMENT_HISTORY_STATUS.APPROVED } }).populate(
            [
                { path: 'defaulterEntry' },
                {
                    path: 'defaulterEntry', populate: {
                        path: 'invoices', populate: [
                            'purchaseOrderDocument',
                            'challanDocument',
                            'invoiceDocument',
                            'transportationDocument',
                            'otherDocuments'
                        ]
                    }
                },
                {
                    path: 'defaulterEntry', populate: {
                        path: 'debtor', populate: [
                            'ratings']
                    }
                },
                { path: 'defaulterEntry', populate: { path: 'creditorCompanyId', model: 'company' } },
                { path: 'creditorcacertificate' },
                { path: 'creditoradditionaldocuments' },
                { path: 'debtorcacertificate' },
                { path: 'debtoradditionaldocuments' },
                { path: 'supportingDocuments' }
                // { path: 'defaulterEntry.creditorCompanyId', model: 'company' } // Populate the creditorCompanyId field
            ]
        );

        transactions = transactions.map(transaction => {
            transaction = transaction.toJSON();
            if (transaction.defaulterEntry && transaction.defaulterEntry.creditorCompanyId) {
                transaction.defaulterEntry.creditor = transaction.defaulterEntry.creditorCompanyId;
                delete transaction.defaulterEntry.creditorCompanyId;
            }
            return transaction;
        });

        // return all transactions
        res.status(200).json({ message: "Transaction list fetched successfully.", success: true, response: transactions });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getalltransactionsMerged = async (req, res) => {
    try {
        let transactions = await PaymentHistory.find({ pendingWith: req.token.adminDetails.adminRole, status: { $ne: constants.PAYMENT_HISTORY_STATUS.APPROVED } }).populate(
            [
                { path: 'defaulterEntry' },
                {
                    path: 'defaulterEntry', populate: {
                        path: 'invoices', populate: [
                            'purchaseOrderDocument',
                            'challanDocument',
                            'invoiceDocument',
                            'transportationDocument',
                            'otherDocuments'
                        ]
                    }
                },
                {
                    path: 'defaulterEntry', populate: {
                        path: 'debtor', populate: [
                            'ratings']
                    }
                },
                { path: 'defaulterEntry', populate: { path: 'creditorCompanyId', model: 'company' } },
                { path: 'creditorcacertificate' },
                { path: 'creditoradditionaldocuments' },
                { path: 'debtorcacertificate' },
                { path: 'debtoradditionaldocuments' },
                { path: 'supportingDocuments' }
                // { path: 'defaulterEntry.creditorCompanyId', model: 'company' } // Populate the creditorCompanyId field
            ]
        );

        transactions = transactions.map(transaction => {
            transaction = transaction.toJSON();
            if (transaction.defaulterEntry && transaction.defaulterEntry.creditorCompanyId) {
                transaction.defaulterEntry.creditor = transaction.defaulterEntry.creditorCompanyId;
                delete transaction.defaulterEntry.creditorCompanyId;
            }
            return transaction;
        });

        let transBackup = [];
        transBackup = transactions;

        let resArray = [];
        let countMap = new Map();
        let count = 0;

        for (let i = 0; i < transactions.length; i++) {
            if (countMap.has(transactions[i].defaulterEntryId)) {
                delete transactions[i].defaulterEntry;
                resArray[countMap.get(transactions[i].defaulterEntryId)].pHArray.push(transactions[i]);
            } else {
                let temp = { "defaulterEntry": transactions[i].defaulterEntry }
                delete transactions[i].defaulterEntry;
                temp["pHArray"] = [transactions[i]];

                resArray[count] = temp;
                countMap.set(transactions[i].defaulterEntryId, count);
                count++;
            }
        }

        // let countMap = new Map();
        // for(let i = 0; i < transactions.length; i++){
        //     if(countMap.has(transactions[i].defaulterEntryId)){
        //         countMap.get(transactions[i].defaulterEntryId).push(transactions[i]);
        //     }else{
        //         countMap.set(transactions[i].defaulterEntryId, [transactions[i]]);
        //     }
        // }

        // console.log(countMap);

        // return all transactions
        res.status(200).json({ message: "Transaction list fetched successfully.", success: true, response: resArray });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        let users = await User.find();
        // return all members
        res.send({ message: 'Users list fetched.', success: true, response: users });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, response: null });
    }
};

// subscription pkg methods -----------------------------------------------------------------------------


exports.getServicesListForSubPkg = async (req, res) => {
    try {

        res.status(201).json({ message: "Subscription Packages found.", success: true, response: subscriptionPkgs });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.addSubscriptionPkg = async (req, res) => {
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
            yearlylyDiscount: req.body.yearlylyDiscount,
            subscriptionFor: req.body.subscriptionFor
        })
        subscriptionPkgAPIQuota = []
        for (row of req.body.services) {
            row.subscriptionPkgId = subscriptionPkg._id
            subscriptionPkgAPIQuota.push(await subscriptionPkgService.addSubscriptionPkgAPIQuotaMapping(row))
        }
        subscriptionPkg.subscriptionPkgAPIQuota = subscriptionPkgAPIQuota
        subscriptionPkg.save()
        res.status(201).json({ message: "Subscription Package added successfully.", success: true, response: subscriptionPkg });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getAllSubscriptionPkg = async (req, res) => {
    try {
        let subscriptionPkgs = await SubscriptionPkg.find().populate("subscriptionPkgAPIQuota");
        res.status(201).json({ message: "Subscription Packages found.", success: true, response: subscriptionPkgs });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.getSubscriptionPkgById = async (req, res) => {
    try {
        const subPkg = await SubscriptionPkg.findOne({ _id: req.body.subscriptionPkgId }).populate("subscriptionPkgAPIQuota");
        if (subPkg) {
            res.status(201).json({ message: "Subscription Package found.", success: true, response: subPkg });
        } else {
            res.status(409).send({ message: "Package Does Not Exists.", success: false });
        }

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.updateSubscriptionPkgById = async (req, res) => {
    try {
        const subPkg = await SubscriptionPkg.findOne({ _id: req.body.subscriptionPkgId });
        if (!subPkg) {
            res.status(201).json({ message: "Subscription Package not found.", success: true, response: subPkg });
        }
        let subscriptionPkg = {
            subscriptionPkgName: req.body.subscriptionPkgName,
            monthlyAmt: req.body.monthlyAmt,
            yearlyAmt: req.body.yearlyAmt,
            monthlyDiscount: req.body.monthlyDiscount,
            yearlylyDiscount: req.body.yearlylyDiscount
        }

        const updatedSubPkg = await SubscriptionPkg.findByIdAndUpdate(
            { _id: req.body.subscriptionPkgId },
            {
                $addToSet: {
                    subscriptionFor: { $each: req.body.subscriptionFor }
                },
                ...subscriptionPkg
            },

        );

        res.status(201).json({ message: "Subscription Package updated.", success: true, response: updatedSubPkg });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.deleteSubscriptionPkg = async (req, res) => {
    try {
        const subPkg = await SubscriptionPkg.findByIdAndRemove({ _id: req.body.subscriptionPkgId });
        await SubscriptionPkgAPIQuotaMapping.deleteMany({ subscriptionPkgId: req.body.subscriptionPkgId })
        res.status(201).json({ message: "Subscription Package deleted.", success: true, response: subPkg });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

// subscription pkg quota mapping methods -----------------------------------------------------------------------------
exports.addSubPkgAPIQtMapping = async (req, res) => {
    try {
        const mapping = await SubscriptionPkgAPIQuotaMapping.findOne({ subscriptionPkgId: req.body.subscriptionPkgId, apiName: req.body.apiName });
        if (mapping) {
            return res.status(409).send({ message: "Mapping Already Exists.", success: false });
        }

        let subscriptionPkgAPIQuota = await subscriptionPkgService.addSubscriptionPkgAPIQuotaMapping(req.body)

        res.status(201).json({ message: "Mapping added successfully.", success: true, response: subscriptionPkgAPIQuota });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.getAllSubPkgAPIQtMapping = async (req, res) => {
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

exports.getSubPkgAPIQtMappingById = async (req, res) => {
    try {
        const subPkg = await SubscriptionPkgAPIQuotaMapping.findOne({ _id: req.body.quotaId });
        if (subPkg) {
            res.status(201).json({ message: "Mapping found.", success: true, response: subPkg });
        } else {
            res.status(409).send({ message: "Mapping Does Not Exists.", success: false, reponse: "" });
        }

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.updateSubPkgAPIQtMappingById = async (req, res) => {
    try {
        let updateMapping = {
            subscriptionPkgId: req.body.subscriptionPkgId,
            apiName: req.body.apiName,
            monthlyQuotaLimit: req.body.monthlyQuotaLimit,
            yearlyQuotaLimit: req.body.yearlyQuotaLimit
        }
        const updatedMapp = await SubscriptionPkgAPIQuotaMapping.findByIdAndUpdate({ _id: req.body.quotaId }, updateMapping);
        res.status(201).json({ message: "Mapping updated.", success: true, response: updatedMapp });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, reponse: "" });
    }
};

exports.deleteSubPkgAPIQtMappingById = async (req, res) => {
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

exports.escalateRequest = async (req, res) => {
    try {
        // will receive paymentId and escalate in the body
        let pendingWith = "";
        let paymentId = req.body.paymentId;

        let result = null;
        if (req.token.adminDetails.adminRole == "L1") {
            pendingWith = "L2";
            result = await paymentHistoryService.updatePaymentHistoryForEscalate({ pendingWith, paymentId });
            let existingLog = await Logs.findOne({ pmtHistoryId: paymentId });
            let logMsg = "Payment Record escalated to L2";
            if (existingLog) {
                // If the document exists, update the logs array
                existingLog.logs.push(logMsg);
                await existingLog.save();
            } else {
                // create log
                let log = await Logs.create({
                    pmtHistoryId: paymentId,  // pmtHistory id
                    logs: [logMsg]  
                });
            }
        } if (req.token.adminDetails.adminRole == "L2") {
            pendingWith = "L3";
            result = await paymentHistoryService.updatePaymentHistoryForEscalate({ pendingWith, paymentId });
            let existingLog = await Logs.findOne({ pmtHistoryId: paymentId });
            let logMsg = "Payment Record escalated to L3";
            if (existingLog) {
                // If the document exists, update the logs array
                existingLog.logs.push(logMsg);
                await existingLog.save();
            } else {
                // create log
                let log = await Logs.create({
                    pmtHistoryId: paymentId,  // pmtHistory id
                    logs: [logMsg]  
                });
            }
        }
        return res.status(200).send({ message: "Issue Escalated", success: true, response: result });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", reponse: "", success: false });
    }
};

exports.removeQuestion = async (req, res) => {

    try {
        const q = await Questions.findByIdAndRemove({ _id: req.body.questionId });
        res.status(200).json({ success: true, message: "Question deleted successfully", response: q });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};


exports.addQuestion = async(req, res) => {

    try {
        let questions = [];
        for(let i = 0; i < req.body.length; i++){
            const q = await Questions.findOne({ questionDesc: req.body[i].questionDesc });
            if (q) {
                return res.status(409).send({ message: "Question already exist.", success: false });
            }

            const question = await Questions.create({
                questionDesc: req.body[i].questionDesc,
                questionType: req.body[i].questionType,
                values: req.body[i].values
            });

            questions.push(question);
        }
        
        
       res.status(200).json({success: true, message: "Questions added successfully", response: questions });

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};


exports.companiesFilter = async (req, res) => {
    try {
        const { cities, state, defaulterCountFlag, activeSubscriptionFlag } = req.body;

        let filter = {};

        if (cities && cities.length > 0) {
            filter.city = { $in: cities };
        }

        if (state) {
            filter.state = state;
        }

        let cmpns = await Companies.find(filter);
        // cmpns = cmpns.toJSON();
        cmpns = cmpns.map(cmpn => cmpn.toObject());

        if (defaulterCountFlag) {
            for (let i = 0; i < cmpns.length; i++) {
                cmpns[i].defaulterCount = await defaulterEntryService.getDefaulterCountForSelectedCompany(cmpns[i].gstin)
            }
        }

        if (activeSubscriptionFlag) {
            for (let i = 0; i < cmpns.length; i++) {
                cmpns[i].usersWithActiveSubscription = await userService.getUsersWithActiveSubscriptionByCompanyId(cmpns[i]._id)
            }
        }

        res.status(200).json({ success: true, message: "Filtered the result", response: cmpns });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getAllCompanies = async (req, res) => {
    try {

        data = await Debtor.find();
        for (let i = 0; i < data.length; i++) {
            const dbtrs = await Debtor.find({ gstin: data[i].gstin });
            let debtordIds = dbtrs.map(item => item._id);

            let allEntries = await defaulterEntryService.findInvoicesPendingByDebtorIds(debtordIds, { $or: [{ status: constants.INVOICE_STATUS.PENDING }, { status: constants.INVOICE_STATUS.DEFAULTED }] }).populate("invoices")
            data[i] = data[i].toJSON()
            data[i].totalAmount = 0;

            for (let elem of allEntries) {
                // finding lowest duefrom date
                for (let invoice of elem.invoices) {
                    if (data[i].dueFrom) {
                        if (data[i].dueFrom > invoice.dueDate) {
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

        res.status(200).json({ success: true, message: "All companies fetched", response: data });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getCompanyCountStateWise = async (req, res) => {
    try {
        const result = await Companies.aggregate([
            {
                $group: {
                    _id: "$state",
                    totalCompanies: { $sum: 1 },
                }
            },
            {
                $project: {
                    state: "$_id",
                    totalCompanies: 1,
                    _id: 0
                }
            }
        ]);
        return res.status(200).json({ success: true, message: "statewise result", response: result });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
}

exports.getCompanyCountCityWiseForState = async (req, res) => {
    try {
        const stateToFilter = req.body.state;
        const result = await Companies.aggregate([
            {
                $match: { state: stateToFilter }
            },
            {
                $group: {
                    _id: "$city",
                    totalCompanies: { $sum: 1 }
                }
            },
            {
                $project: {
                    city: "$_id",
                    totalCompanies: 1,
                    _id: 0
                }
            }
        ]);
        return res.status(200).json({ success: true, message: "citywise result", response: result });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
};

exports.getDisputedTransactionsStateCityWise = async (req, res) => {
    try {
        const { state, city } = req.body;

        const result = await DefaulterEntry.aggregate([
            {
                $lookup: {
                    from: "debtors",
                    localField: "debtor",
                    foreignField: "_id",
                    as: "debtor"
                }
            },
            {
                $unwind: {
                    path: "$debtor",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "debtor.state": state,
                    "debtor.city": city
                }
            }
        ]);

        return res.status(200).json({ success: true, message: "Disputed Transactions City and State wise result", response: result });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
};

exports.deleteAdmin = async (req, res) => {
    console.log('dfd', req.body.emailid);
    try {
        await Admin.deleteOne({ emailId: req.body.emailid });
        res.status(201).json({ success: true, message: "User deleted successfully." });

    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.activateDeactivateUser = async(req, res) => {
    try {

        let user = await User.findOne({_id: req.body.userId});
        if(req.body.userActivateFlag == "ACTIVE"){

            if(user.isActiveAccount && user.isActiveAccount=="ACTIVE"){  // already active
                res.status(200).json({success: true, message: "User is already active.", response: ""});
            }else{              // user.isActiveAccount && user.isActiveAccount=="INACTIVE" or just not exist
                user.isActiveAccount = "ACTIVE";
                user.save();
                res.status(200).json({success: true, message: "User Activated", response: user});
            }   
            
        }else if(req.body.userActivateFlag == "INACTIVE"){

            if(user.isActiveAccount && user.isActiveAccount=="INACTIVE"){  // already Inactive
                res.status(200).json({success: true, message: "User is already Inactive.", response: ""});
            }else{              // user.isActiveAccount && user.isActiveAccount=="ACTIVE" or just not exist
                user.isActiveAccount = "INACTIVE";
                user.save();
                res.status(200).json({success: true, message: "User De-activated", response: user});
            } 

        }else{
            res.status(403).json({message: 'User not Found to activate or deactivate.', success: false, response: ""});
        }

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
}
