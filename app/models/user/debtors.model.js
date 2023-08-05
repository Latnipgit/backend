module.exports = mongoose => {
    var schema = mongoose.Schema({
        debtorId: String,
        ownerName: String,
        ownerMobile: String,
        companyName: String,
        gstin: String,
        companyPan: String,
        creditorCompanyId: String
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Debtor = mongoose.model("debtor", schema);
    return Debtor;
};