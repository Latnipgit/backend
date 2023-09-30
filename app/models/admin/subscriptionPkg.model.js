module.exports = mongoose => {
    var schema = mongoose.Schema({
        subscriptionPkgId: String,
        subscriptionPkgName: String,
        monthlyAmt: String,
        yearlyAmt: String,
        monthlyDiscount: String,
        yearlylyDiscount: String 
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const SubscriptionPkg = mongoose.model("subscriptionPkg", schema);
    return SubscriptionPkg;
};