const db = require("../../models/user");
const User = db.user;
const Companies = db.companies;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const mailUtility = require('../../util/mailUtility')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../../controllers/common/mailTemplates.controller')

exports.signup = async(req, res) => {

    try {
        const oldUser = await User.findOne({ emailId: req.body.emailId });
        if (oldUser) {
            return res.status(409).send({ message: "User Already Exist.", success: false });
        }
        console.log(req.body.email, oldUser)
        password = commonUtil.generateRandomPassword()
        let encryptedPassword = await bcrypt.hash(password, 10);

        // Create a Tutorial
        const user = await User.create({
            name: req.body.name,
            userName: req.body.emailId,
            companyPan: req.body.companyPan,
            mobile: req.body.mobile,
            password: encryptedPassword,
            emailId: req.body.emailId
        });
        const company = await Companies.create({
            companyName: req.body.companyName,
            gstin: req.body.gstin,
            companyPan: req.body.companyPan,
            user: user
        }); 
        
        // user.token = jwtUtil.generateUserToken(user);
       // Save Tutorial in the database
       let replacements = [];
       replacements.push({target: "password", value: password })
       mailObj = await mailController.getMailTemplate("USER_SIGNUP", replacements)

       mailObj.to = req.body.emailId
       mailUtility.sendMail(mailObj)

       res.status(201).json({ message: "success", success: false, response: user });

    }catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }

};


exports.changePassword = async(req, res) => {

    try {
        var id = req.token.userDetails.id;
        var newvalues = { $set: {password: await bcrypt.hash(req.body.password, 10) }};
        console.log( await User.findById(id))
        let out =await User.findByIdAndUpdate(id, newvalues, { useFindAndModify: true })
          
      
        res.status(200).json({"message": "Password changed successfully.",  "success": true});

    }catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }

};

// Find a single Tutorial with an id
exports.authenticateUser = async(req, res) => {
    try {
        const id = req.body.userName;
        // Validate if user exist in our database
        const user = await User.findOne({ userName: req.body.userName });
        if (!user) {
            res.status(200).send({ message: "user not found, Please signup", success: false });
        } else if (user && (await bcrypt.compare(req.body.password, user.password))) {
            // Create token
            user.token = jwtUtil.generateUserToken(user);
            mailUtility.sendMail();
            res.send({message: 'Login successfull.', success: true, response: user});
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
    const loggedInUser = await User.findOne({ _id: req.token.userDetails.id });

    if (loggedInUser) {
        res.send({message: 'Login Info', success: true, response: loggedInUser});
    } else
        res.status(403).send({ message: "Unauthorised", success: false });
};

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
