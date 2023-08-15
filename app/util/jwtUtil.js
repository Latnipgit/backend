const jwt = require("jsonwebtoken");

exports.generateUserToken = (user) => {
    const token = jwt.sign({"userDetails" : { id: user._id, emailId: user.emailId}},
        process.env.TOKEN_KEY, {
        expiresIn: "2h",
    });
    return token;
};

exports.generateAdminToken = (admin) => {
    
            
    const token = jwt.sign({"adminDetails" : { id: admin._id, emailId: admin.emailId }},
        process.env.TOKEN_KEY, {
            expiresIn: "2h",
        }
    );
    return token;
};

exports.getLoggedInUserDetails = () =>{

}