const db = require("../../models/user");
const User = db.user;
const Companies = db.companies;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')

exports.signup = async(req, res) => {

    try {
        const oldUser = await User.findOne({ emailId: req.body.emailId });
        if (oldUser) {
            return res.status(409).send({ message: "User Already Exist.", success: false });
        }
        console.log(req.body.email, oldUser)
        let encryptedPassword = await bcrypt.hash(req.body.password, 10);

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
        
        user.token = jwtUtil.generateUserToken(user);
       // Save Tutorial in the database
                
        res.status(201).json(user);

    }catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }

};


exports.changePassword = async(req, res) => {

    try {
        var myquery = { emailId: req.body.emailId};

        var newvalues = { $set: {password: await bcrypt.hash(req.body.password, 10) }};
        let update = await User.updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
          });

        res.status(201).json(user);

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
            res.status(200).json(user);
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
    const loggedInUser = await User.findOne({ emailId: req.user.userId });

    if (loggedInUser) {
        res.send({message: 'Login Info', success: true, response: loggedInUser});
    } else
        res.send(null)
};

exports.getAllUsers = async(req, res) => {
    try {
        let users = await User.find();
        // return all members
        res.status(200).json(users);
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false, response: null });
    }
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

    Tutorial.find(condition)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};
// Find a single Tutorial with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Tutorial.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Tutorial with id " + id });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Tutorial with id=" + id });
        });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }

    const id = req.params.id;

    Tutorial.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`
                });
            } else res.send({ message: "Tutorial was updated successfully." });
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Tutorial with id=" + id
            });
        });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Tutorial.findByIdAndRemove(id, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
                });
            } else {
                res.send({
                    message: "Tutorial was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Tutorial with id=" + id
            });
        });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
    Tutorial.deleteMany({})
        .then(data => {
            res.send({
                message: `${data.deletedCount} Tutorials were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all tutorials."
            });
        });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
    Tutorial.find({ published: true })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};