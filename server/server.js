// npm
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

// derived
const {
    mongoose
} = require("./db/mongoose");
const {
    Comment
} = require("./models/comment");
const {
    User
} = require("./models/user");
const {
    College
} = require("./models/college");
const {
    ObjectID
} = require("mongodb");
const {
    Xrequest
} = require("./models/xrequest");

// custom functions

// env var
const port = process.env.PORT || 3000;

// app
var app = new express();

// view
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// defined middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, "public")));

// custom middlewares
const {
    authenticate
} = require("./middleware/authenticate");
const {
    authenticate1
} = require("./middleware/authenticate1");

//routes
// home page
app.get("/", (req, res) => {
    var user = null;
    if (req.session.xuser) {
        user = req.session.xuser.user;
    }
    res.render("index", {
        user: user
    });
});

// colleges page
app.post("/colleges", (req, res) => {
    College.getColleges(req.body.name).then((colleges) => {
        var user = null;
        if (req.session.xuser) {
            user = req.session.xuser.user;
        }
        res.render("colleges", {
            user,
            colleges
        })
    }).catch((e) => {
        res.status(400).send();
    });
});

// collage page
app.get("/college/:id", (req, res) => {
    College.findById(req.params.id).then((college) => {
        var user = null;
        if (req.session.xuser) {
            user = req.session.xuser.user;
        }
        Comment.find({
            _college: college._id
        }).then((comments) => {
            res.render("college", {
                user,
                college,
                comments
            });
        }).catch((err) => {
            res.redirect("/");
        });
    });
});

// /signup
app.get("/signup", (req, res) => {
    if (req.session.xuser) {
        res.redirect("/");
    } else {
        res.render("signup", {
            user: null
        });
    }
});

// /signup
app.post("/signup", (req, res) => {
    var body = _.pick(req.body, ["email", "password", "name", "kind", "city", "state", "zip"]);
    var user = new User(body);
    user.save().then(() => {
        res.redirect("/");
    }).catch((err) => {
        res.status(400).send();
    });
});

// /login
app.get("/login", (req, res) => {
    if (req.session.xuser) {
        res.redirect("/");
    } else {
        res.render("login", {
            user: null
        });
    }
});

// /login
app.post("/login", (req, res) => {
    var body = _.pick(req.body, ["email", "password"]);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            req.session.xuser = {
                user: user, //id email
                token: token
            }
            res.redirect("/");
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.get("/me/update", authenticate1, (req, res) => {
    res.render("update", {
        user: req.user
    });
});

app.post("/me/update/bio", authenticate1, (req, res) => {
    var body = _.pick(req.body, ["name"]);
    User.updateOne({
        _id: req.user
    }, {
        $set: body
    }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        res.redirect("/logout");
    }).catch((err) => {
        res.redirect("/me")
    });
});

app.post("/me/update/password", authenticate1, (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        var password = req.body.password;
        bcrypt.hash(password, salt, (err, hash) => {
            User.updateOne({
                _id: req.user
            }, {
                $set: {
                    password: hash
                }
            }).then((user) => {
                if (!user) {
                    return Promise.reject();
                }
                res.redirect("/logout");
            }).catch((err) => {
                res.redirect("/me")
            });
        });
    });
});

// /me
app.get("/me", authenticate1, (req, res) => {
    res.render("profile", {
        user: req.user
    });
});

// logout
app.get("/logout", authenticate1, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        req.session.xuser = null;
        res.redirect("/");
    }, (err) => {
        res.status(400).send();
    });
});

// /request/add/college
app.get("/request/college/add", authenticate1, (req, res) => {
    res.render("addCollege", {
        user: req.session.xuser.user
    });
});

// new collage---------------
app.post("/request/college/add", authenticate1, (req, res) => {
    var body = _.pick(req.body, ["name", "fields"]);
    body._creator = req.session.xuser.user._id;
    var college = new College(body);
    college.save().then((doc) => {
        res.redirect("/");
    }, (err) => {
        res.status(400).send();
    });
});

// app.get("/requests", (req, res) => {
//     res.send();
// });

// app.post("/request/college/add", authenticate1, (req, res) => {
//     var body = _.pick(req.body, ["name", "rating"]);
//     body._creator = req.session.xuser.user._id;
//     var xrequest = new Xrequest(body);
//     xrequest.save().then((doc) => {
//         res.redirect("/");
//     }, (err) => {
//         res.status(400).send();
//     });
// });

app.post("/newComment/:id", (req, res) => {
    var comment = new Comment({
        text: req.body.text,
        _creator: req.session.xuser.user._id,
        _college: req.params.id
    });
    comment.save().then((doc) => {
        res.redirect("/college/" + req.params.id);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.post("/newReply/:id1/:id2", (req, res) => {
    Comment.findById(req.params.id2).then((comment) => {
        var body = comment.reply;
        body.push({
            text: req.body.text
        });
        Comment.findByIdAndUpdate({
            _id: comment._id
        }, {
            $set: {
                reply: body
            }
        }, {
            new: true
        }).then((comment) => {
            res.redirect("/college/" + req.params.id1);
        });
    }).catch((err) => {
        res.status(400).send(err);
    });

});

app.get("/reset", (req, res) => {
    req.session.xuser = null;
    res.redirect("/");
});

app.post("/xxxxx", (req, res) => {
    res.send(req.body);
});

app.get("/rater/:id", (req, res) => {
    College.findOneAndUpdate({
        _id: req.params.id,
    }, {
        $inc: {rating: 1}
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        var xx = todo.rating;
        //res.redirect("/college/" + req.params.id);
    }).catch((err) => {
        res.status(400).send();
    });
});

// port
app.listen(port, () => {
    console.log("listening on port", port);
});