module.exports = mongoose => {
    var schema = mongoose.Schema({
        invoiceId: String,
        debtor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'debtor'
        },
        invoices: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sendBillTransactions'
        }],
        status: String,
        totalAmount: String
    },
    {
        timestamps: true
    }
    );

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const DefaulterEntry = mongoose.model("defaulterEntry", schema);
    return DefaulterEntry;
};