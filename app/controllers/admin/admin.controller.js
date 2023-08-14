const db = require("../../models/admin/");
const Admin = db.admin;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')

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
            return res.status(409).send({ message: "User Already Exist.", success: false });
        }
        console.log(req.body.email, oldUser)

        let encryptedPassword = await bcrypt.hash(req.body.password, 10);


        const admin = await Admin.create({
                name: req.body.name,
                userName: req.body.emailId,
                emailId: req.body.emailId,
                password: encryptedPassword,
                phoneNumber: req.body.phoneNumber,
                joinedOn: new Date(0),
                adminRole: "user"
            })
            // Create token
        admin.token = jwtUtil.generateAdminToken(admin);

        // return new user
        res.status(201).json(admin);
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
exports.getLoginInfo = (req, res) => {
    res.send(req.user);
};
exports.getAllAdmins = async(req, res) => {
    try {
        let members = await Admin.find();
        // return all members
        res.status(200).json(members);
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
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
                message: err.message || "Some error occurred while retrieving tutorials.", success: false
            });
        });
};
// Find a single Tutorial with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Tutorial.findById(id)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found Tutorial with id " + id, success: false });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving Tutorial with id=" + id, success: false });
        });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!",
            success: false
        });
    }

    const id = req.params.id;

    Tutorial.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`,
                    success: false
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
                    message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`,
                    success: false
                });
            } else {
                res.send({
                    message: "Tutorial was deleted successfully!",
                    success: false
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Tutorial with id=" + id,
                success: false
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