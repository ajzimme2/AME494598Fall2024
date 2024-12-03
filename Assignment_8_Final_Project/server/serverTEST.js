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
    res.redirect("/PROJ.html");
});

// Initialize WebSocket server
const server = app.listen(port, () => {
    console.log("Server running at http://" + hostname + ":" + port);
});

app.post('/saveData', (req, res) => {
  const { w, x, y, z } = req.body;
  console.log('Quaternion Data:', { w, x, y, z });

  // Save to database or log for now
  res.status(200).send('Data received');
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
