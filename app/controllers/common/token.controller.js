const db = require("../../models/common/");
const commonService = require("../../service/common");
const TokenService = commonService.tokenService;

// exports.getMailTemplate = async(mailType, replacements) => {
//     var template;
//     try {
//         template = await tokens.findOne({ mailType: mailType });

//         for (i = 0; i < replacements.length; i++) {
//             console.log(replacements[i])
//             template.description= template.description.replaceAll("{{"+replacements[i].target+"}}", replacements[i].value)
//         }
//     } catch (err) {
//         console.log(err)
//     }

//     return template;
// };


// exports.getAllMailTemplate = async(req, res) => {
//     let templates;
//     try {
//         templates = await MailTemplates.find();
//         res.status(200).json({message: '.', success: true, response: templates});
//     } catch (err) {
//         console.log(err)
//     }

// };



exports.saveTokenToDb = async(req, res) => {
    try {

        let tokenDetails = {
            paymentId: req.body.paymentId,
            userType: tokenDetails.userType,
            token: req.body.linkToken
        }
        const token = await TokenService.saveTokenToDb(tokenDetails);

        res.status(200).json({message: 'Token Saved successfully.', success: true, response: token});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};

exports.deleteTokenFromDb = async(req, res) => {
    try {

        let obj= {
            paymentId: req.body.paymentId,
            userType: tokenDetails.userType
        };
         
        let deletedTok = await TokenService.deleteTokenFromDb(obj);
        if(deletedTok){
            res.status(200).json({message: 'Token deleted from db.', success: true, response: deletedTok});
        }
        res.status(403).json({message: 'Token not Found.', success: false, response: deletedTok});
        
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};
