module.exports = mongoose => {
    var schema = mongoose.Schema({
        defaulterEntryId: String,
        defaulterEntry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'defaulterEntry'
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
        approvedByCreditor: String,
        isDispute: Boolean
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const PaymentHistory = mongoose.model("paymentHistory", schema);
    return PaymentHistory;
};