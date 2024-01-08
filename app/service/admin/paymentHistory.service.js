const db = require("../../models/admin");
const user_db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const PaymentHistory = db.paymentHistory;
const User = user_db.user;
const config = process.env;
const constants = require('../../constants/userConstants');

exports.updatePaymentHistoryForEscalate = function(escObj) {
    console.log(escObj);
    return PaymentHistory.findByIdAndUpdate({_id: escObj.paymentId}, {pendingWith: escObj.pendingWith});
};

exports.updatePaymentHistoryStatus = function(escObj) {
    console.log(escObj);
    return PaymentHistory.findByIdAndUpdate({_id: escObj.paymentId}, {status: escObj.status, pendingWith: escObj.pendingWith});
};

exports.moveToDocumentsNeededQueue = function(escObj) {
    // This arrangement can be altered based on how we want the date's format to appear.
    escObj.documentsPendingSince = new Date().toJSON().slice(0, 10);

    return PaymentHistory.findByIdAndUpdate(escObj.paymentId, {status: escObj.status, pendingWith: escObj.pendingWith,documentsPendingSince: escObj.documentsPendingSince});
};

exports.moveDocumentsWithPendingDocBackToAdminQueue = function()  {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    console.log('PaymentHistory status updated for documents older than 7 days.');

    return PaymentHistory.updateMany(
        {
            documentsPendingSince: { $lte: sevenDaysAgo },
            status: { $ne: constants.PAYMENT_HISTORY_STATUS.PENDING }
        },
        {
            $set: { status: constants.PAYMENT_HISTORY_STATUS.PENDING }
        }
    )
}

exports.addPaymentHistory = function(details, amount) {
    
    return PaymentHistory.create({
        defaulterEntryId: details.defaulterEntryId,
        amtPaid: amount ,
        proofFiles: "",
        status: "PENDING",
        pendingWith: "L1",
        approvedByCreditor: "false"
    });
};
  

exports.createPaymentHistory = function(details, newStatus, newPendingWith, newApprovedByCreditor) {
    return PaymentHistory.create({
      defaulterEntryId: details.defaulterEntryId,
      amtPaid: details.amtPaid,
      requestor: details.requestor,
      attachment: details.attachmentId,
      status: newStatus,
      pendingWith: newPendingWith,
      approvedByCreditor: newApprovedByCreditor
  });
}
