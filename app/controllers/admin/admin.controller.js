const db = require("../../models/admin/");
const Admin = db.admin;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../../controllers/common/mailTemplates.controller')
const mailUtility = require('../../util/mailUtility')
const config = process.env;

exports.addAdmin = async(req, res) => {
    // Validate request
    // if (!req.body.title) {
    //   res.status(400).send({ message: "Content can not be empty!" });
    //   return;
    // }

    // Create a Tutorial
    try {
        const oldUser = await Admin.findOne({ emailId: req.body.emailId });
        if (oldUser) {
            return res.status(409).send({ message: "User Already Exists.", success: false });
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
                adminRole: "admin"
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
