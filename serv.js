const bodyParser = require("body-parser");
const express = require("express");
const app = new express();
const port = 3000;
app.use(bodyParser.json());

app.get("/", (req, res) => {
    var x = {
        name: "Himanshu",
        age: 22
    }
    res.send(JSON.stringify(x));
});

app.listen(port, (err) => {
    if(err) {
        console.log("There is a problem with port " + port + "\nit is giving a error" + err);
    } else {
        console.log("Server is on port " + port);
    }
});