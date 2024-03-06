const nodemailer = require('nodemailer');

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
        // text: '<h1>Node.js testing mail for GeeksforGeeks</h1>'
        html: mailObj.description
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurred while sending email', err);
            console.log('Failed email details: ', mailDetails);
        }
    });
}
