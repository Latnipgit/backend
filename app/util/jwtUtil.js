const jwt = require("jsonwebtoken");
const createError = require('http-errors')

exports.generateUserToken = (user) => {
    let payload = {"userDetails" : { id: user._id, emailId: user.emailId, phoneNumber: user.phoneNumber, password: user.password, role: user.role}}
    const secret = process.env.TOKEN_KEY
    const options = {
        expiresIn: '1m',
        // issuer: 'pickurpage.com',
        audience: user.id,
    }
  
    const token = jwt.sign(payload, secret, options); 

    return token;
};

exports.generateUserRefreshToken = (user) => {
    let payload = {"userDetails" : { id: user._id, emailId: user.emailId, phoneNumber: user.phoneNumber, password: user.password, role: user.role}}
    const secret = process.env.TOKEN_KEY
    const options = {
        expiresIn: '5m',
        // issuer: 'pickurpage.com',
        audience: user.id,
    }
  
    const token = jwt.sign(payload, secret, options); 

    return token;
  }


exports.generateUserTokenWithCmpDetails = (user, cmp) => {
    const token = jwt.sign({"userDetails" : user, 
                            "companyDetails" : {_id: cmp.id, id: cmp.id, companyName: cmp.companyName, gstin: cmp.gstin, companyPan: cmp.companyPan,
                                                 createdAt: cmp.createdAt, updatedAt:cmp.updatedAt}},
        process.env.TOKEN_KEY, {
        expiresIn: "1m",
    }); 
    return token;
};



exports.generateUserRefreshTokenWithCmpDetails = (user, cmp) => {
    let payload = {"userDetails" : user, "companyDetails" : {_id: cmp.id, id: cmp.id, companyName: cmp.companyName, gstin: cmp.gstin, companyPan: cmp.companyPan,
        createdAt: cmp.createdAt, updatedAt:cmp.updatedAt}}
    const secret = process.env.TOKEN_KEY
    const options = {
        expiresIn: '5m',
        // issuer: 'pickurpage.com',
        audience: user.id,
    }
  
    const token = jwt.sign(payload, secret, options); 

    return token;
  }

exports.generateAdminToken = (admin) => {
    
    const token = jwt.sign({"adminDetails" : { id: admin._id, emailId: admin.emailId, password: admin.password, adminRole: admin.adminRole}},
        process.env.TOKEN_KEY, {
            expiresIn: "2h",
        }
    );
    return token;
};


exports.generateAdminRefreshToken = (admin) => {
    let payload = {"adminDetails" : { id: admin._id, emailId: admin.emailId, password: admin.password, adminRole: admin.adminRole}}
    const secret = process.env.TOKEN_KEY
    const options = {
        expiresIn: '1d',
        // issuer: 'pickurpage.com',
        audience: admin._id.toString(),
    }
  
    const token = jwt.sign(payload, secret, options); 

    return token;
}


exports.signAccessTokenWithPayload = (payload) => {
    const secret = process.env.TOKEN_KEY
    delete payload.exp 
    const options = {
        expiresIn: '1m',
        // issuer: 'pickurpage.com',
        // audience: user.id,
    }

    const token = jwt.sign(payload, secret , options); 

    return token;
}

exports.signRefreshTokenWithPayload = (payload) => {
    const secret = process.env.TOKEN_KEY
    delete payload.exp 
    const options = {
        expiresIn: '5m',
        // issuer: 'pickurpage.com',
        // audience: user.id,
    }
  
    const token = jwt.sign(payload, secret, options); 

    return token;
}

exports.getLoggedInUserDetails = () =>{

}


exports.verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.TOKEN_KEY,
        (err, payload) => {
          if (err) return reject(createError.Unauthorized())
          resolve(payload)
          // client.GET(userId, (err, result) => {
          //   if (err) {
          //     console.log(err.message)
          //     reject(createError.InternalServerError())
          //     return
          //   }
          //   if (refreshToken === result) return resolve(userId)
          //   reject(createError.Unauthorized())
          // })
        }
      )
    })
}