const db = require("../../models/user");
const commondb = require("../../models/common/");

const User = db.user;
const Companies = db.companies;
const Token = commondb.token;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const mailUtility = require('../../util/mailUtility')
const commonUtil = require('../../util/commonUtil')
const mailController=  require('../../controllers/common/mailTemplates.controller')
const config = process.env;
const Joi = require("joi");
const crypto = require("crypto");

exports.signup = async(req, res) => {

    try {
        const oldUser = await User.findOne({ emailId: req.body.emailId });
        if (oldUser) {
            return res.status(409).send({ message: "User Already Exist.", success: false });
        }
        password = commonUtil.generateRandomPassword()
        let encryptedPassword = await bcrypt.hash(password, 10);

        // Create a Tutorial
        const user = await User.create({
            name: req.body.name,
            userName: req.body.emailId,
            companyPan: req.body.companyPan,
            mobile: req.body.mobile,
            password: encryptedPassword,
            emailId: req.body.emailId,
            passwordChangeNeeded: true
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

       res.status(201).json({ message: "success", success: true, response: user });

    }catch (err) {
        console.log(err)
        res
            .status(500)
              .send({ message: "Something went wrong", success: false });
    }
};

exports.changePasswordUsingToken = async(req, res) => {
    try {
        var decodedToken = jwt.verify(req.body.passwordChangeToken, config.TOKEN_KEY)
        var query = {_id: decodedToken.userDetails.id, password: decodedToken.userDetails.password};
        var newvalues = { $set: {password: await bcrypt.hash(req.body.password, 10) ,passwordChangeNeeded: false}};
        console.log( await User.findOne(query))
        let out =await User.findOneAndUpdate(query, newvalues)
        
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

        const user = await User.findOne({ emailId: req.body.emailId });
        if (!user)
            return res.status(400).send({message: "user with given email doesn't exist.",  success: false});

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.USER_FRONTEND_BASE_URL}/password-reset/${user._id}/${token.token}`;
        let replacements = [];
        replacements.push({target: "PASSWORD_RESET_LINK", value: link })
        mailObj = await mailController.getMailTemplate("FORGET_PASSWORD", replacements)
 
        mailObj.to = req.body.emailId
        mailUtility.sendMail(mailObj)
 
        res.status(200).json({message: "password reset link sent to your email account.",  success: true});

    } catch (error) {
        console.log(err)
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

        const user = await User.findById(req.params.userId);
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
        var query = {_id: req.token.userDetails.id};
        var newvalues = { $set: {password: await bcrypt.hash(req.body.password, 10) }};
        let user =  await User.findOne(query)
        
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
exports.authenticateUser = async(req, res) => {
    try {
        const id = req.body.userName;
        // Validate if user exist in our database
        const user = await User.findOne({ userName: req.body.userName });
        if (!user) {
            res.status(200).send({ message: "User not found, Please signup", success: false });
        } else if (user && (await bcrypt.compare(req.body.password, user.password))) {
            // Create token
            if(!user.passwordChangeNeeded){
                user.token = jwtUtil.generateUserToken(user);
                res.status(200).json({ message: "Logged in Successfully.", success: true, response: user });
            } else {
                let passwordChangeToken = jwtUtil.generateUserToken(user);
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
