var mongoose = require("mongoose");
var _ = require("lodash");
var CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _college: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _creator_name: {
      type: String,
      required: true
    },
    reply: [{
        text: {
            type: String
        },
        id: {
            type: mongoose.Schema.Types.ObjectId
        }
    }],
    counter: {
        like: {
            type: Number,
            default: 0
        },
        dislike: {
            type: Number,
            default: 0
        }
    },
    status: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        likest: {
            type: Number,
            default: 0
        }
    }]
});

CommentSchema.methods.toJSON = function () {
    var comment = this;
    var commentObject = comment.toObject();
    return _.pick(commentObject, ["_id", "text", "reply"]);
};

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = {
    Comment
};
