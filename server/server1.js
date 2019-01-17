// npm
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const _ = require("lodash");

// derived
const {
    mongoose
} = require("./db/mongoose");
const {
    Todo
} = require("./models/todo");
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
} = request("./models/xrequest.js");

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
// home
app.get("/", (req, res) => {
    var userObject = null;
    req.session.xcollege = null;
    if (req.session.xuser) {
        userObject = req.session.xuser.user;
    }
    College.find({}).then((colleges) => {
        res.render("index", {
            user: userObject,
            colleges: colleges
        });
    }, (err) => {
        res.status(404).send(e);
    });
});

// home
app.post("/", (req, res) => {
    var userObject = null;
    req.session.xcollege = null;
    if (req.session.xuser) {
        userObject = req.session.xuser.user;
    }
    College.find({
        name: req.body.name
    }).then((colleges) => {
        res.render("index", {
            user: userObject,
            colleges: colleges
        });
    }, (err) => {
        res.status(404).send(e);
    });
});

// signup form
app.get("/signup", (req, res) => {
    if (req.session.xuser) {
        res.status(400).send();
    } else {
        res.render("signup");
    }
});

// signup
app.post("/users", (req, res) => {
    var body = _.pick(req.body, ["email", "password", "name", "kind"]);
    var user = new User(body);
    user.save().then(() => {
        res.redirect("/");
    }).catch((err) => {
        res.status(400).send();
    });
});

// login form
app.get("/login", (req, res) => {
    if (req.session.xuser) {
        res.status(400).send();
    } else {
        res.render("login");
    }
});

// login
app.post("/users/login", (req, res) => {
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

// user profile
app.get("/users/me", authenticate1, (req, res) => {
    res.render("profile", {
        user: req.user
    });
});

//change
// app.get("/users/me/change", authenticate1, (req, res) => {
//     res.render("change", {
//         user: req.user
//     });
// });

// logout
app.get("/logout", authenticate1, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        req.session.xuser = null;
        res.redirect("/");
    }, (err) => {
        res.status(400).send();
    });
});

// new todo form
app.get("/toodos", authenticate1, (req, res) => {
    res.render("toodos");
});

// new todo
app.post("/todos", authenticate1, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.session.xuser.user._id,
        _college: req.session.xcollege.college._id
    });
    todo.save().then((doc) => {
        res.redirect("/college/" + String(req.session.xcollege.college._id));
    }, () => {
        res.status(400).send();
    })
});

// todos
app.get("/todosx", authenticate1, (req, res) => {
    Todo.find({
        // _creator: req.user._id
    }).then((todos) => {
        // res.send({todos});
        // res.render("todos", {
        //     user1: req.session.user1.a,
        //     todos: todos
        // });     
        res.send({
            a: todos,
            b: req.session
        });
    }, (err) => {
        // res.status(400).send(err);
        res.redirect("/");
    });
});

// new collage form---------
app.get("/addCollege", authenticate1, (req, res) => {
    res.render("addCollege");
});

// app.get();

// delete college
app.get("/deleteCollege", authenticate1, (req, res) => {
    res.render("deleteCollege");
});

// new collage---------------
app.post("/addCollege", authenticate1, (req, res) => {
    var college = new College({
        name: req.body.name,
        rating: req.body.rating,
        _creator: req.user._id
    });
    college.save().then((doc) => {
        res.redirect("/");
    }, (err) => {
        res.status(400).send();
    })
});

// delete college
app.post("/deleteCollege", authenticate1, (req, res) => {
    College.findOneAndRemove({
        name: req.body.name
    }).then((college) => {
        if (!college) {
            return res.status(404).send();
        }
        // res.send(todo);
        res.redirect("/");
    }).catch((err) => {
        res.status(400).send();
    });
});

// collages
app.get("/todosx", authenticate1, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        // res.send({todos});
        res.render("todos", {
            user1: req.session.user1.a,
            todos: todos
        });
    }, (err) => {
        // res.status(400).send(err);
        res.redirect("/");
    });
});

//find collage
var cf = function (id) {
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    return College.findOne({
        _id: id
    }).then((college) => {
        if (!college) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            resolve(college);
        });
    });
};

// collage profile
app.get("/college", (req, res) => {
    Todo.find({
        _college: req.session.xcollege.college._id
    }).then((todos) => {
        if (!todos) {
            // return Promise.reject();
            // res.status(404).send();
        } else {
            res.render("college", {
                college: req.session.xcollege.college,
                todos: todos
            });
        }
        // res.send({a:req.session,b:todos});
    }).catch(() => {
        res.status(400).send();
    });
    // res.send(req.session);
});

// collage id selector
app.get("/college/:id", (req, res) => {
    var id = req.params.id;
    cf(id).then((college) => {
        req.session.xcollege = {
            college: college
        }
        // res.send();
        res.redirect("/college");
    }).catch((e) => {
        res.status(400).send();
    });
});

app.get("/y", (req, res) => {
    College.getAllColleges().then((colleges) => {
        req.session.xxx = {
            x: colleges
        }
        res.redirect("/x");
    }).catch((e) => {
        res.status(400).send();
    });
});

// extra
app.get("/x", (req, res) => {
    res.send(req.session);
});

// has to be done
app.get("/todos/:id", authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({
            todo
        });
    }).catch((err) => {
        res.status(400).send();
    });
});

// has to be done
app.delete("/todos/:id", authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send(todo);
    }).catch((err) => {
        res.status(400).send();
    });
});

// has to be done
app.patch("/todos/:id", authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ["text", "completed"]);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if (body.completed && _.isBoolean(body.completed)) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({
            todo
        });
    }).catch((err) => {
        res.status(400).send();
    });

});

// collages
app.get("/todosx", authenticate1, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        // res.send({todos});
        res.render("todos", {
            user1: req.session.user1.a,
            todos: todos
        });
    }, (err) => {
        // res.status(400).send(err);
        res.redirect("/");
    });
});

// port
app.listen(port, () => {
    console.log("listening on port", port);
});