var express = require('express')
  , calendar = require('./routes/calendar')
  , http = require('http')
  , path = require('path')
  , schedule = require('node-schedule')
  , sha1 = require('sha1')
  , entrys = require('./routes/entrys')
  , _ = require('underscore')._
  , sys = require('sys')
  , exec = require('child_process').exec;
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', calendar.show);
function eachEntry(entrys) {
  _.each(entrys, scheduleEntry)
}
function scheduleEntry(entry) {
  var startId = sha1(entry.startTime)
  var on = schedule.scheduleJob(startId,new Date(entry.startTime), function(){
       runCommand("tdtool -n 1"); 
  });
  var endId = sha1(entry.endTime)
  var off = schedule.scheduleJob(endId,new Date(entry.endTime), function(){
       runCommand("tdtool -f 1"); 
  });
}
function runCommand(command) {
  function puts(error, stdout, stderr) { }
  exec(command, puts);
}
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  var rule = new schedule.RecurrenceRule();
  rule.minute = [0, new schedule.Range(1, 59)];
  //rule.second = [0, new schedule.Range(1, 59)];
  //rule.minute = 55;
    var j = schedule.scheduleJob("pollLoop",rule, function() {
    entrys.get(eachEntry);
  });
});

