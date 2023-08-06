module.exports = mongoose => {
    var schema = mongoose.Schema({
        user: String,
        userName: String,
        name: String,
        companyName: String,
        aadharCardNo: String,
        emailId: { type: String, unique: true },
        phoneNumber: String,
        joinedOn: Date,
        password: String,
        status: Boolean,
        token: { type: String }
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const User = mongoose.model("user", schema);
    return User;
};