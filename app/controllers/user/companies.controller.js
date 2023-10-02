const db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const Companies = db.companies;
const User = db.user;
const config = process.env;
const companyService = require("../../service/user/company.service");

// Create and Save a new Tutorial
exports.addCompany = async(req, res) => {
    // Validate request
    // Create a Tutorial
    try {

        const loggedInUser = await User.findOne({ emailId: req.token.userDetails.emailId });

        const company = await companyService.addCompany(req.body);
        // await userService.addUserToCompany(company._id, loggedInUser);
        // return new user
        res.status(200).json({message: 'Users list fetched.', success: true, response: company});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};


exports.findAll = async(req, res) => {
    try{
        const title = req.query.title;
        data = await Companies.find();
        res.status(200).json({message: 'Companies list fetched.', success: true, response: data});
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.findAllByUserId = async(req, res) => {

    try{
        const user = await User.findById(req.token.userDetails.id).populate("companies");
        res.status(200).json({message: 'Companies list fetched for user.', success: true, response: user.companies});
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
        
};

exports.selectCompanyByCompanyId = async(req, res) => {
    try{
        const userToken = req.token.userDetails;
        company = await Companies.findOne({_id: req.body.companyId});
        if (!company){
            res.status(404).send({ message: "Not found company ", success: false });
        }
        const companyDetails = company.toJSON();
        companyDetails.id = companyDetails.id.toString();

        // console.log({userToken, companyDetails});
        const newToken = jwtUtil.generateUserTokenWithCmpDetails(userToken, companyDetails);
        res.status(200).json({  message: "Selected a company", success: true, response: {"token": newToken}});
            
    }catch(error){
        console.log(error);
        res
            .status(500)
            .send({ message: "Error retrieving company", success: false });
    }

}

// Find a single Company with an id
exports.findOne = async(req, res) => {
    try{
        data = await companyService.findCompany(req.body);
        if (!data){
            res.status(404).send({ message: "Not found company ", success: false, response: ""});
        }else{
            res.status(200).json({ message: "Search successful", success: true, response: data});
        }
    } catch (error) {
        console.log(error)
        res
            .status(500)
            .send({ message: "Error retrieving company", success: false, response: ""});
    }
};
