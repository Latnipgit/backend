const db = require("../../models/common/");
const Logs = db.logs;

exports.getLogsByPaymentId = async(req, res) => {
    try {
        let ress = await Logs.findOne({ pmtHistoryId: req.body.paymentId });
        res
            .status(200)
            .send({ message: "fetched log", success: false, response: ress });
    } catch (err) {
            res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.getAllLogs = async(req, res) => {
    try {
        let ress = await Logs.find();
        res
            .status(200)
            .send({ message: "fetched all logs", success: false, response: ress });
    } catch (err) {
            res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.createLog = async(req, res) => {
    try {
        let log = await Logs.create({
            pmtHistoryId: req.body.pmtHistoryId,  // pmtHistory id
            logs: req.body.logs 
        });
        res
            .status(200)
            .send({ message: "Log created", success: true, response: log });
    } catch (err) {
            res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};






// exports.addMailTemplate = async(req, res) => {
//     try {

//         const template = await MailTemplates.create({
//             mailType: req.body.mailType,
//             subject: req.body.subject,
//             description: req.body.description,
//         }); 

//         // return new user
//         res.status(200).json({message: 'template created successfully.', success: true, response: template});
//     } catch (err) {
//         console.log(err)
//         res
//             .status(500)
//             .send({ message: "Something went wrong", success: false });
//     }
// };
