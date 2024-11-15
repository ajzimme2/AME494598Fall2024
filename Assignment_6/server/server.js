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

app.get("/", function (req, res) {
    res.redirect("/index.html");
});

app.get("/getAverage", function (req, res) {
  var from = parseInt(req.query.from);
  var to = parseInt(req.query.to);
  db.collection("dataWeather").find({time:{$gt:from, $lt:to}}).toArray(function(err, result){
    console.log(err);
    console.log(result);
    var tempSum = 0;
    var humSum = 0;
    for(var i=0; i< result.length; i++){
      tempSum += result[i].t || 0;
      humSum += result[i].t || 0;
    }
    var tAvg = tempSum/result.length;
    var hAvg = humSum/result.length;
    res.send(tAvg + " "+  hAvg);
  });
});

app.get("/getLatest", function (req, res) {
  (async function() {
    let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      let result = await db.collection("data").find().sort({time:-1}).limit(10).toArray();
      res.send(JSON.stringify(result));
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});

app.get("/getData", function (req, res) {
  // Get start time and duration from query parameters
  var from = parseInt(req.query.start);
  var duration = parseInt(req.query.duration);  // duration in minutes

  if (isNaN(from) || isNaN(duration)) {
      return res.status(400).send('Invalid start time or duration');
  }

  // Calculate the end time (in milliseconds)
  var to = from + duration * 60 * 1000; // Convert duration from minutes to milliseconds

  console.log(`Fetching data from ${from} to ${to}`);  // Log start and end time for debugging

  // Fetch data from MongoDB where time is between `from` and `to`
  (async function() {
      let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
      let db = client.db('sensorData');
      try {
          let result = await db.collection("data").find({time:{$gt:from, $lt:to}}).sort({time: -1}).toArray();
          console.log("Data sent to frontend:", result);  // Log result for debugging
          res.send(JSON.stringify(result));
      }
      finally {
          client.close();
      }
  })().catch(err => {
      console.error(err);
      res.status(500).send('Internal server error');
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
  }
  res.send(VALUEtime.toString());
  (async function() {
    let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    let db = client.db('sensorData');
    try {
      result = await db.collection("data").insertOne(dataObj);
      if(result.insertedId) {
        result = result.insertedId.toString();
        console.log(result);
      }
    }
    finally {
      client.close();
    }
  })().catch(err => console.error(err));
});

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler());

console.log("Simple static server listening at http://" + hostname + ":" + port);
app.listen(port);
