const db = require("../../models/common/");
const Logs = db.logs;

exports.getLogsByPaymentId = async(req, res) => {
    try {
        return Logs.findOne({ pmtHistoryId: paymentId });
    } catch (err) {
        console.log(err)
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
