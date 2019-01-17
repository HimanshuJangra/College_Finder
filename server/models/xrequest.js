var mongoose = require("mongoose");
var _ = require("lodash");
var XrequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

XrequestSchema.methods.toJSON = function () {
    var xrequest = this;
    var xrequestObject = request.toObject();
    return _.pick(requestObject, ["_id", "name", "rating"]);
};

var Xrequest = mongoose.model("Xrequest", XrequestSchema);


module.exports = {
    Xrequest
};