const jwt = require("jsonwebtoken");

exports.generateUserToken = (user) => {
    const token = jwt.sign({"userDetails" : { id: user._id, emailId: user.emailId, phoneNumber: user.phoneNumber, password: user.password, role: user.role}},
        process.env.TOKEN_KEY, {
        expiresIn: "2h",
    });
    return token;
};
exports.generateUserTokenWithCmpDetails = (user, cmp) => {
    const token = jwt.sign({"userDetails" : user, 
                            "companyDetails" : {_id: cmp.id, id: cmp.id, companyName: cmp.companyName, gstin: cmp.gstin, companyPan: cmp.companyPan,
                                                 createdAt: cmp.createdAt, updatedAt:cmp.updatedAt}},
        process.env.TOKEN_KEY, {
        expiresIn: "2h",
    }); 
    return token;
};

exports.generateAdminToken = (admin) => {
    
            
    const token = jwt.sign({"adminDetails" : { id: admin._id, emailId: admin.emailId, password: admin.password, adminRole: admin.adminRole}},
        process.env.TOKEN_KEY, {
            expiresIn: "2h",
        }
    );
    return token;
};

exports.getLoggedInUserDetails = () =>{

}