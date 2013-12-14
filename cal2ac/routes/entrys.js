var https = require('https');
var net = require('net');
var url = require('url');
var util = require('util');
var _ = require('underscore')._;
var config = require('../config')

exports.get = function(callback){
  collectFeed(callback);
};

function buildArray(data) {
  calendar = JSON.parse(data);
  entrys = _.reduce(calendar.feed.entry, function(memo, entry){ memo.push(shiftTime(entry.gd$when.shift())); return memo;}, [])
  filteredStartedEntrys = _.reduce(entrys, function(memo, entry){ if(hasEntryStarted(entry)) {memo.push(entry)};return memo;}, []);
  return filteredStartedEntrys;
}

function shiftTime(startEndTime) {
  var shiftedTime = new Object();
  _.each(_.keys(startEndTime), function(key) {
    var date = new Date(startEndTime[key])
    date.setHours(date.getHours()-1);
    shiftedTime[key] = date;
  });
  return shiftedTime;
}

function hasEntryStarted(entry) {
  var now = new Date();
  var startTime = new Date(entry.startTime);
  if (startTime < now) { return false }
  return true;
}

function collectFeed(callback) {
  var url = config.calendarUrl;
  https.get(url, function(response) {
    var data = [];
    response.on('data', function (chunk) {data.push(chunk);});
    response.on('end',  function () {callback(buildArray(data.join('')))});
  }).on('error', function(e) {
  console.log("Got error: " + e.message);
  });
}
