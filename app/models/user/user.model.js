module.exports = mongoose => {
    var schema = mongoose.Schema({
        user: String,
        userName: String,
        name: String,
        aadharCardNo: String,
        emailId: { type: String, unique: true },
        phoneNumber: String,
        joinedOn: Date,
        password: String,
        role: String,
        passwordChangeNeeded: Boolean,
        status: Boolean,
        token: { type: String },
        permissions: [{ type: String}],
        companies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            options: { toJSON: { transform: true } } // This option will invoke toJSON on the populated documents
        }]
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

    const User = mongoose.model("user", schema);
    return User;
};