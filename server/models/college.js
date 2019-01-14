var mongoose = require("mongoose");
var College = mongoose.model("College", {
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

module.exports = {
    College
};