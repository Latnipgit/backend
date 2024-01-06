module.exports = mongoose => {
    var schema = mongoose.Schema({
        paymentId: String,
        invoiceId: String,
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sendBillTransactions'
        },
        amtPaid: String,
        requestor: String,
        paymentDate: String,
        paymentMode: String,
        debtorAttachments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'documents',
        }],
        creditorAttachments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'documents',
        }],
        status: String,
        pendingWith: String,
        approvedByCreditor: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const PaymentHistory = mongoose.model("paymentHistory", schema);
    return PaymentHistory;
};