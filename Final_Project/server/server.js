var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var hostname = process.env.HOSTNAME || 'localhost';
var port = 8080;
var VALUEt = 0;
var VALUEh = 0;
var VALUEtime = 0;

let MongoClient = require('mongodb').MongoClient;
const connectionString = 'mongodb://localhost:27017';

const WebSocket = require('ws'); // WebSocket library

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

// Serve static files (e.g., index.html)
app.get("/", function (req, res) {
    res.redirect("/index.html");
});

// Initialize WebSocket server
const server = app.listen(port, () => {
    console.log("Server running at http://" + hostname + ":" + port);
});

const wss = new WebSocket.Server({ server });

// Simulate sending real-time data (replace this with actual data logic)
wss.on('connection', (ws) => {
    console.log("WebSocket connection established");

    // Send periodic updates
    const interval = setInterval(() => {
        const movementData = {
            w: Math.random(),
            x: Math.random() * 10 - 5,
            y: Math.random() * 10 - 5,
            z: Math.random() * 10 - 5
        };
        ws.send(JSON.stringify(movementData));
    }, 1000); // Send data every second

    ws.on('close', () => {
        clearInterval(interval);
        console.log("WebSocket connection closed");
    });
});

// MongoDB-related routes remain unchanged
app.get("/getAverage", function (req, res) {
    var from = parseInt(req.query.from);
    var to = parseInt(req.query.to);
    db.collection("dataWeather").find({ time: { $gt: from, $lt: to } }).toArray(function (err, result) {
        console.log(err);
        console.log(result);
        var tempSum = 0;
        var humSum = 0;
        for (var i = 0; i < result.length; i++) {
            tempSum += result[i].t || 0;
            humSum += result[i].t || 0;
        }
        var tAvg = tempSum / result.length;
        var hAvg = humSum / result.length;
        res.send(tAvg + " " + hAvg);
    });
});

app.get("/getValue", function (req, res) {
    res.send(VALUEt.toString() + " " + VALUEh + " " + VALUEtime + "\r");
});

app.get("/setValue", function (req, res) {
    VALUEt = parseFloat(req.query.t);
    VALUEh = parseFloat(req.query.h);
    VALUEtime = new Date().getTime();
    var dataObj = {
        t: VALUEt,
        h: VALUEh,
        time: VALUEtime
    };
    res.send(VALUEtime.toString());
    (async function () {
        let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
        let db = client.db('sensorData');
        try {
            let result = await db.collection("data").insertOne(dataObj);
            if (result.insertedId) {
                console.log(result.insertedId.toString());
            }
        } finally {
            client.close();
        }
    })().catch(err => console.error(err));
});
