var mongoose = require("mongoose");
var _ = require("lodash");
var CollegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        trim: true
    },
    rating: [{
        id: {
            type: mongoose.Schema.Types.ObjectId
        },
        value: {
            type: Number,
            default: 0
        }
    }],
    counter: {
        type: Number,
        default: 0
    },
    about: {
        type: String,
        required: true
    },
    fields: [{
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }],
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _creator_name: {
        type: String,
        required: true
    }
});

CollegeSchema.methods.toJSON = function () {
    var college = this;
    var collegeObject = college.toObject();
    return _.pick(collegeObject, ["_id", "name", "fields", "rating"]);
};

CollegeSchema.statics.getColleges = function (name) {
    var College = this;
    return College.find({
        name
    }).then((colleges) => {
        if (!colleges) {
            return Promise.reject();
        } else {
            return Promise.resolve(colleges);
        }
    });
};

var College = mongoose.model("College", CollegeSchema);


module.exports = {
    College
};