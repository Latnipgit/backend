module.exports = mongoose => {
    var schema = mongoose.Schema({
        companyId: String,
        companyName: String,
        gstin: {type: String, unique: true},
        companyPan: String,
        city: String,
        state: String,
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                const { __v, _id, ...object } = ret.toObject();
                object.id = _id;
                return object;
            }
        }    
    }
    );

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Company = mongoose.model("company", schema);
    return Company;
};