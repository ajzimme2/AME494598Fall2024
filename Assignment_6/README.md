# graphHistorical Code
<code>
    <html>
    <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.6.8/c3.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.6.8/c3.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
        
        <script src='asyncReq.js'></script>
        
        <script>
        var chart;
        var lastAddedTS = 0;
        var duration = 10;  // Default duration (in minutes)

        function getDataFromServer(startTime, duration) {
        var url = "./getData?start=" + startTime + "&duration=" + duration;
        console.log("Fetching data with URL:", url);
        var callback = function(data) {
            console.log("Data received from server:", data);
            var obj = JSON.parse(data);
            var columns = [["x"], ["Temperature"], ["Humidity"]];
            var firstTimestamp = null;

            // Check if data exists
            if (obj.length === 0) {
                console.log("No new data available from server.");
                return;
            }

            for (var i = 0; i < obj.length; i++) {
                var timestamp = parseInt(obj[i].time);
                if (firstTimestamp === null) {
                    firstTimestamp = timestamp;
                }
                columns[0].push(getTSInFormat(timestamp));
                columns[1].push(obj[i].t || 0);
                columns[2].push(obj[i].h || 0);
                lastAddedTS = timestamp;
            }

            // Debugging logs
            console.log("First Timestamp:", firstTimestamp);
            console.log("Last Timestamp:", lastAddedTS);

            // Ensure chart updates even if no new data is available
            chart.load({
                columns: columns,
                unload: false // Prevent unloading old data
            });
        };
        loadFile(url, callback);}

        function getTSInFormat(t) {
        var x = new Date(t);
        return x.getFullYear() + "-" + (x.getMonth() + 1).toString().padStart(2, '0') + "-" + x.getDate().toString().padStart(2, '0') + "T" +
            x.getHours().toString().padStart(2, '0') + ":" +
            x.getMinutes().toString().padStart(2, '0') + ":" +
            x.getSeconds().toString().padStart(2, '0');
        }

        function start() {
            flatpickr("#datetimeSelect", { enableTime: true, dateFormat: "Y-m-d H:i" });

            var url = "./getLatest";
            var callback = function(data) {
                var obj = JSON.parse(data);
                var columns = [["x"],["Temperature"],["Humidity"]];
                for (var i = 0; i < obj.length; i++) {
                    var timestamp = parseInt(obj[i].time);
                    columns[0].push(getTSInFormat(timestamp));
                    columns[1].push(obj[i].t || 0);
                    columns[2].push(obj[i].h || 0);
                    lastAddedTS = timestamp;
                }
                chart = c3.generate({
                    bindto: '#data',
                    data: {
                        x: 'x',
                        xFormat: '%Y-%m-%dT%H:%M:%S',
                        columns: columns
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                format: '%H:%M:%S, %Y-%m-%d',
                            }
                        }
                    }
                });
            };

            loadFile(url, callback);
            setInterval(function() {
                getDataFromServer(lastAddedTS, duration); 
            }, 6000);
        }

        // Listen for changes to the dropdown and update the duration
        document.addEventListener("DOMContentLoaded", function() {
            var durationSelect = document.getElementById("duration");
            durationSelect.addEventListener("change", function() {
                duration = parseInt(this.value); 
                console.log("Selected Duration:", duration);  // Debugging log

                const selectedStartTime = document.getElementById("datetimeSelect")._flatpickr.selectedDates[0];
                if (selectedStartTime) {
                    const startTime = selectedStartTime.getTime() / 1000;  // Convert to seconds
                    console.log("Converted Start Time (in seconds):", startTime);  // Debugging log
                    getDataFromServer(startTime, duration);  
                }
            });

            document.getElementById("data").addEventListener("click", function() {
                // Get the selected start time and duration
                const selectedStartTime = document.getElementById("datetimeSelect")._flatpickr.selectedDates[0];  
                duration = parseInt(document.getElementById("duration").value);  
                if (selectedStartTime && duration) {
                    const startTime = selectedStartTime.getTime() / 1000;  // Convert to seconds
                    console.log("Selected Start Time:", startTime);  // Debugging log
                    getDataFromServer(startTime, duration);  
                }
            });
        });

        </script>
    </head>

    <body style='text-align:center; font-family:Helvetica' onload='start()'>
        <h1> Weather Historical Data </h1>

        <input id='datetimeSelect' type='text'>
        <select id='duration'>
            <option value='10'> last 10 mins </option>
            <option value='30'> last 30 mins </option>
            <option value='60'> last hour </option>
        </select>
        <div id='data'></div>

    </body>
    </html>
</code>

#Server.js code
<code>
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
  var from = parseInt(req.query.start);
  var duration = parseInt(req.query.duration);
  var to = from + duration * 60 * 1000;
  console.log(`Fetching data from ${from} to ${to}`);  // Log start and end time for debugging
  // Fetch data from MongoDB
  
  (async function() {
      let client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
      let db = client.db('sensorData');
      try {
          let result = await db.collection("data").find({ time: { $gt: from, $lt: to } }).sort({ time: -1 }).toArray();
  
          if (result.length < (duration * 60)) {
              res.status(400).send("Not enough data available for the requested duration.");
              return;
          }
  
          res.send(JSON.stringify(result));
      } finally {
          client.close();
      }
  })().catch(err => {
      console.error(err);
      res.status(500).send("Internal server error");
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
</code>