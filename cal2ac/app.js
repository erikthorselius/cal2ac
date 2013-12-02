var express = require('express')
  , calendar = require('./routes/calendar')
  , http = require('http')
  , path = require('path')
  , schedule = require('node-schedule')
  , entrys = require('./routes/entrys');
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
function scheduleEntry(entry) {
  console.log(entry[0].startTime.getMonth())
  var j = schedule.scheduleJob({hour: 21, minute: 1}, function() {
    console.log(entry);
  });
}
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  var rule = new schedule.RecurrenceRule();
  rule.second = [0, new schedule.Range(1, 59)];
  //rule.minute = 55;
    var j = schedule.scheduleJob(rule, function() {
    entrys.get(scheduleEntry);
  });
});

