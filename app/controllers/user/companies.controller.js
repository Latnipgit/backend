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
        res.status(200).json({message: 'Users list fetched.', success: true, response: company});
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
            res.status(200).json({message: 'Companies list fetched.', success: true, response: data});
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
            else{
                res.status(200).json({ success: true, response: data});
            }
        })
        .catch(err => {
            res
                .status(500)
                .send({ message: "Error retrieving company", success: false });
        });
};
