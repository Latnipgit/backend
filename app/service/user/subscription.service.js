const db = require("../../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../../util/jwtUtil')
const { ObjectId } = require('mongodb');
const Subscription = db.subscription;
const SubscriptionIdRemQuotaMapping = db.subscriptionIdRemQuotaMapping;
const User = db.user;
const config = process.env;

exports.updateRemQuota = async function(userDetails) {
    // find in subscription by userId and isActive  => get subscription Id
    // find Rem Quota mapp . limit remaining using sId

    const sub = await Subscription.findOne({ userId: userDetails.id, isActive: true});
    // console.log(sub)
    if(sub){
        const subRemMapp = await SubscriptionIdRemQuotaMapping.findOne({ subscriptionId : sub._id, apiName: "search" });
        // console.log(subRemMapp)
        let limitRemaining = subRemMapp.limitRemaining;
        let updateData = {
            limitRemaining: ((limitRemaining*1)-1).toString()
        }
        const filter = { subscriptionId: sub._id, apiName: "search" };
        const update = { $set: updateData };

        const result = await SubscriptionIdRemQuotaMapping.updateMany(filter, update);

        return result;
    } 
    return null;
};
  