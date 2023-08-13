const db = require("../../models/user");
const Companies = db.companies;
const User = db.user;

// Create and Save a new Tutorial
exports.addCompany = async(req, res) => {
    // Validate request
    // Create a Tutorial
    try {

        const loggedInUser = await User.findOne({ emailId: req.user.userId });

        const company = await Companies.create({
            companyName: req.body.companyName,
            gstin: req.body.gstin,
            companyPan: req.body.companyPan,
            user: loggedInUser
        }); 

        // return new user
        res.status(200).json(company);
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

    Companies.find(condition)
        .then(data => {
            res.send({message: data, success: true});
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials.",
                success: false
            });
        });
};

// Find a single Company with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    condition = { $or: [{ companyPan: req.body.companyPan }, { gstin: req.body.gstin }, {aadharCardNo: req.body.aadharCardNo}] }
    Companies.find(condition)
        .then(data => {
            if (!data)
                res.status(404).send({ message: "Not found company ", success: false });
            else res.send(data);
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving company", success: false });
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