module.exports = mongoose => {
    var schema = mongoose.Schema({
        companyId: String,
        companyName: String,
        gstin: String,
        companyPan: String,
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Company = mongoose.model("company", schema);
    return Company;
};