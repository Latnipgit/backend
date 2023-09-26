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
        role: String,
        passwordChangeNeeded: Boolean,
        status: Boolean,
        token: { type: String },
        companies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company'
        }]
    }, { timestamps: true });

    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const User = mongoose.model("user", schema);
    return User;
};