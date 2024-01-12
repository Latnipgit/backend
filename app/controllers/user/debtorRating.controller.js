const db = require("../../models/user");
const commondb = require("../../models/common");
const dotenv = require('dotenv');

dotenv.config();

const DebtorRating = db.debtorRating;
const Debtor = db.debtors;
const Companies = db.companies;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const mailUtility = require('../../util/mailUtility')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../common/mailTemplates.controller')
const config = process.env;
const Joi = require("joi");
const crypto = require("crypto");
const service = require("../../service/user");
const userService = service.user;
const debtorService = service.debtor;
var constants = require('../../constants/userConstants');


exports.addRating = async(req, res) => {

    try {
        const oldUser = await Debtor.findOne({ id: req.body.debtorId });
        if (!oldUser) {
            return res.status(404).send({ message: "Debtor does not exist.", success: false });
        }
        let resArray = [];
        for(let i = 0; i<req.body.length; i++){
            const rating = await debtorService.addDebtorRating(req.body[i])
            await debtorService.addDebtorRatingToDebtor(req.body[i].debtorId, req.token.companyDetails, rating)
        }
        
       res.status(200).json({success: true, message: "Rating added successfully", response: ""});

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};

exports.getAllEmployees = async(req, res) => {
    try {
        let condition = { 'companies': { $in: [req.token.companyDetails.id] } };
        let emmployees = await DebtorRating.find(condition);
        // return all members
        res.status(200).json({ message: "Employee list fetched successfully.", success: true, response: emmployees });
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};
