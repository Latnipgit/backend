const db = require("../models");
const Debtors = db.debtors;
const Companies = db.companies;

// Create and Save a new Tutorial
exports.add = (req, res) => {
    // Validate request
    // Create a Tutorial
    const id = req.body.session.companyDetails.id;
    console.log("logged in company details", req.body.companyDetails)
    const debtor = new Debtors({
        ownerName: req.body.ownerName,
        ownerMobile: req.body.ownerMobile,
        companyName: req.body.companyName,
        gstin: req.body.gstin,
        companyPan: req.body.companyPan,
        creditorCompanyId: id
    });

    // Save Tutorial in the database
    debtor
        .save(debtor)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Tutorial."
            });
        });
};

exports.getDebtors = (req, res) => {

    const id = req.body.session.companyDetails.id;
    console.log(req.session.companyDetails)
    var condition = { creditorCompanyId: id };

    Debtors.find(condition)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving tutorials."
            });
        });
};


exports.getCreditors = (req, res) => {

    const pancard = req.body.session.companyDetails.companyPan;
    var condition = { companyPan: pancard };

    Debtors.find(condition)
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