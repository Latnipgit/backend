const db = require("../../models/common/");
const MailTemplates = require("../../models/common").mailTemplates;

exports.getMailTemplate = async(mailType, replacements) => {
    var template;
    try {
        template = await MailTemplates.findOne({ mailType: mailType });

        for (i = 0; i < replacements.length; i++) {
            console.log(replacements[i])
            template.description= template.description.replaceAll("{{"+replacements[i].target+"}}", replacements[i].value)
        }
    } catch (err) {
        console.log(err)
    }

    return template;
};



exports.addMailTemplate = async(req, res) => {
    try {

        const template = await MailTemplates.create({
            mailType: req.body.mailType,
            subject: req.body.subject,
            description: req.body.description,
        }); 

        // return new user
        res.status(200).json({message: 'template created successfully.', success: true, response: template});
    } catch (err) {
        console.log(err)
        res
            .status(500)
            .send({ message: "Something went wrong", success: false });
    }
};
