const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/CollegeDB";
mongoose.Promise = global.Promise;
mongoose.connect(url, {
    useNewUrlParser: true
});

module.exports = {
    mongoose
}