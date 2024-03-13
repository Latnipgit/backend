const nodemailer = require('nodemailer');
const db = require("../models/common");
const axios = require('axios');
const fs = require('fs').promises;

const Documents = db.documents;

exports.sendEmailWithAttachments = async (mailObj, documentIds) => {
    try {

        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAILID,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const documents = await Documents.find({ _id: { $in: documentIds } });
        const attachments = [];
        for (const doc of documents) {
            const response = await axios.get(doc.url, { responseType: 'arraybuffer' });
            const attachment = {
                filename: doc.name,
                content: response.data
            };
            attachments.push(attachment);
        }
        
        let mailDetails = {
            from: 'gitlatnip91@gmail.com',
            to: mailObj.to,
            subject: mailObj.subject,
            html: mailObj.description,
            attachments: attachments
        };
        
        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log('Error Occurred while sending email', err);
                console.log('Failed email details: ', mailDetails);
            }
        });

    } catch (error) {
        console.error("Error fetching document attachments:", error);
        throw error; // Handle or propagate the error as needed
    }
};

exports.sendMail = (mailObj) => {
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAILID,
            pass: process.env.SMTP_PASSWORD
        }
    });
    
    let mailDetails = {
        from: 'gitlatnip91@gmail.com',
        to: mailObj.to,
        subject: mailObj.subject,
        html: mailObj.description
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurred while sending email', err);
            console.log('Failed email details: ', mailDetails);
        }
    });
}
