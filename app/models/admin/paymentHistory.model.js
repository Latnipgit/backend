module.exports = mongoose => {
    var schema = mongoose.Schema({
        paymentId: String,
        invoiceId: String,
        status: String,
        pendingWith: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const PaymentHistory = mongoose.model("paymentHistory", schema);
    return PaymentHistory;
};