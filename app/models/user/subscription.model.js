module.exports = mongoose => {
    var schema = mongoose.Schema({
        subscriptionPkgId: String,
        apiName: String,
        quotaLimit: String,
        amtPurchase: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Subscription = mongoose.model("subscription", schema);
    return Subscription;
};