const db = require("../../models/admin");
const user_db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const PaymentHistory = db.paymentHistory;
const User = user_db.user;
const config = process.env;

exports.updatePaymentHistoryForEscalate = function(escObj) {
    console.log(escObj);
    return PaymentHistory.findByIdAndUpdate({_id: escObj.paymentId}, {pendingWith: escObj.pendingWith});
};
  