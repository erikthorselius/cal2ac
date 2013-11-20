var https = require('https');
var net = require('net');
var url = require('url');
var util = require('util');
var crypto = require('crypto');
var _ = require('underscore')._;
var config = require('../config')
var response;
exports.show = function(req, res){
  response = res;
  collectFeed(buildArray);
};

function buildArray(data) {
  calendar = JSON.parse(data);
  entrys = _.reduce(calendar.feed.entry, function(memo, entry){ memo.push(createSlimEntry(entry)); return memo;}, [])
  response.send(200,entrys);
}

function createSlimEntry(entry) {
  var hash = crypto.createHash('md5').update(entry.id.$t).digest('hex');
  return _.extend({id:hash}, shiftTime(entry.gd$when.shift()));
}

function shiftTime(startEndTime) {
  var shiftedTime = new Object();
  _.each(_.keys(startEndTime), function(key) {
    var date = new Date(startEndTime[key])
    date.setHours(date.getHours()-1);
    shiftedTime[key] = date;
  });
  return shiftedTime 
}

function collectFeed(callback) {
    var url = config.calendarUrl;
    https.get(url, function(response) {
     var data = [];
     response.on('data', function (chunk) {data.push(chunk);});
     response.on('end',  function () {callback(data.join(''))});
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}
