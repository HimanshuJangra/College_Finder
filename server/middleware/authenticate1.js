var {User} = require("./../models/user");
var authenticate1 = (req, res, next) => {
    var token;
    if(req.session.xuser) {
        token = req.session.xuser.token;
    }
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};
module.exports = {authenticate1}