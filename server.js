/**
 * Created by bharath on 9/3/2016.
 */

var express = require("express");
var mysql = require("mysql");
var app = express();
var async = require("async");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "bharath",
    database: "toppr_got"
});

connection.connect();

app.get("/list", function (req, res) {
    connection.query("select location from battles", function (err, rows, fields) {
        if (!err) {
            var result = [];
            for (var i = 0; i < rows.length; i++) {
                result.push(rows[i].location);
            }
            res.send(result);
        }
        else {
            console.log(err);
            res.send("failed to make a connection to the server");
        }
    })
})
;
app.get("/count", function (req, res) {
    connection.query("select count(id) from battles", function (err, rows, fields) {
        if (!err) {
            console.log(rows[0]["count(id)"]);
            res.send(rows[0]["count(id)"] + "");
        }
        else {
            console.log(err);
            res.send("failed to make a connection to the server");
        }
    })
});

app.get("/stats", function (req, res) {
    var most_active = {};
    var attacker_outcome = {};
    var battle_type = [];
    var defender_size = {};
    var result = {};
    try{connection.query("select attacker_king,count(attacker_king) from battles where attacker_outcome=\"win\" group by attacker_king order by count(attacker_king) desc limit 1;", function (err, rows, fields) {
        if (!err) {
            most_active.attacker_king = rows[0].attacker_king;
            connection.query("select defender_king,count(defender_king) from battles where attacker_outcome=\"loss\" group by defender_king order by count(defender_king) desc limit 1;", function (err, rows, fields) {
                if (!err) {
                    most_active.defender_king = rows[0].defender_king;
                    connection.query("select region,count(region) from battles group by region order by count(region) desc limit 1;", function (err, rows, fields) {
                        if (!err) {
                            most_active.region = rows[0].region;
                            connection.query("select count(id) from battles where attacker_outcome=\"win\";", function (err, rows, fields) {
                                if (!err) {
                                    attacker_outcome.win = rows[0]["count(id)"];
                                    connection.query("select count(id) from battles where attacker_outcome=\"loss\";", function (err, rows, fields) {
                                        if (!err) {
                                            attacker_outcome.loss = rows[0]["count(id)"];
                                            connection.query("select distinct battle_type from battles;", function (err, rows, fields) {
                                                if (!err) {
                                                    for (var i = 0; i < rows.length; i++) {
                                                        battle_type.push(rows[i].battle_type);
                                                        connection.query("select max(defender_size) from battles;", function (err, rows, fields) {
                                                            if (!err) {
                                                                defender_size.max = rows[0]["max(defender_size)"];
                                                                connection.query("select min(defender_size) from battles where defender_size IS NOT NULL and defender_size<>\"\";", function (err, rows, fields) {
                                                                    if (!err) {
                                                                        defender_size.min = rows[0]["min(defender_size)"];
                                                                        connection.query("select avg(defender_size) from battles;", function (err, rows, fields) {
                                                                            if (!err) {
                                                                                defender_size.average = rows[0]["avg(defender_size)"];
                                                                                result.most_active = most_active;
                                                                                result.attacker_outcome = attacker_outcome;
                                                                                result.battle_type = battle_type;
                                                                                result.defender_size = defender_size;
                                                                                res.send(result);
                                                                            } else {
                                                                                console.log("failed to make connection to the server");
                                                                            }
                                                                        });
                                                                    } else {
                                                                        console.log("failed to make connection to the server");
                                                                    }
                                                                });
                                                            } else {
                                                                console.log("failed to make connection to the server");
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    console.log("failed to make connection to the server");
                                                }
                                            });
                                        } else {
                                            console.log("failed to make connection to the server");
                                        }
                                    });
                                } else {
                                    console.log("failed to make connection to the server");
                                }
                            });
                        } else {
                            console.log("failed to make connection to the server");
                        }
                    });
                } else {
                    console.log("failed to make connection to the server");
                }
            });
        } else {
            console.log("failed to make connection to the server");
        }
    });}catch(exception){
        console.log(exception);
    }
});

app.get("/search", function (req, res) {
    var query = req.query;
    var key = Object.keys(query)[0];
    var result = [];
    var sql = "select * from battles where " + key + "=" + query[key] + ";";
    connection.query(sql, function (err, rows, fields) {
        if (!err) {
            for (var i = 0; i < rows.length; i++) {
                result.push(rows[i]);
            }
            res.send(result);
        } else {
            res.send("failed to make a connection to the server")
        }
    });

})


var server = app.listen(8054, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("server started at %s:%s", host, port);
});