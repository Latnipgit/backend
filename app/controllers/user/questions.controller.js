const db = require("../../models/user");
const commondb = require("../../models/common");
const dotenv = require('dotenv');

dotenv.config();

const DebtorRating = db.debtorRating;
const Questions = db.questions;
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


exports.addQuestion = async(req, res) => {

    try {
        const q = await Questions.findOne({ questionDesc: req.body.questionDesc });
        if (q) {
            return res.status(404).send({ message: "Question already exist.", success: false });
        }

        const question = await Questions.create({
            questionDesc: req.body.questionDesc,
            questionType: req.body.questionType,
            values: req.body.values
        });
        
       res.status(200).json({success: true, message: "Question added successfully", response: question });

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};

exports.getQuestionById = async(req, res) => {

    try {
        const question = await Questions.findOne({_id: req.body.questionId});
        if (!question) {
            console.log("Question not found")
            return res.status(409).send({ message: "Question not found", success: false, response: "" });
        };
        res.status(200).json({success: true, message: "Fetched Question!", response: question });

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};

exports.getAllQuestions = async(req, res) => {

    try {
        const q = await Questions.find();
        res.status(200).json({success: true, message: "Questions fetched successfully", response: q });

    } catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};