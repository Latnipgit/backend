const db = require("../../models/admin/");
const Admin = db.admin;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../../controllers/common/mailTemplates.controller')
const mailUtility = require('../../util/mailUtility')

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
            user.token = jwtUtil.generateAdminToken(user);

            res.status(200).json({ message: "Logged in Successfully.", success: true, response: user });
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
