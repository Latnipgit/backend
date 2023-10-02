module.exports = mongoose => {
    var schema = mongoose.Schema({
        subscriptionId: String,
        apiName: String,
        limitRemaining: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const SubscriptionIdRemQuotaMapping = mongoose.model("subscriptionIdRemQuotaMapping", schema);
    return SubscriptionIdRemQuotaMapping;
};