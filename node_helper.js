/* global Module */

/* node_helper.js
 *
 * Magic Mirror
 * Module: MMM-BackgroundSlideshow
 *
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 *
 * Module MMM-BackgroundSlideshow By Darick Carpenter
 * MIT Licensed.
 */

// call in the required classes
var NodeHelper = require('node_helper');
var http = require('http');
var FileSystemImageSlideshow = require('fs');

// the main module helper create
module.exports = NodeHelper.create({
  // subclass start method, clears the initial config array
  start: function() {
    //this.moduleConfigs = [];
  },

  shuffleArray: function(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  },

  // gathers the image list
  gatherImageList: function(config, callback) {
    var options = {
      hostname: 'random-photo-path',
      port: 9501,
      path: '/api/data.json',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    var that = this;
    
    var req = http.request(options, function(res) {
      var body = "";
      res.setEncoding('utf8');
      res.on('data', function(chunk){
        body += chunk;
      })
      res.on('end', function () {
        var imageList = JSON.parse(body);
        callback(null, that.shuffleArray(data.imageList));
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
      callback(e);
    });

    req.end();
  },

  // subclass socketNotificationReceived, received notification from module
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'BACKGROUNDSLIDESHOW_REGISTER_CONFIG') {
      // this to self
      var self = this;
      // get the image list
      this.gatherImageList(payload, function(err, imageList) {
        if (err) {
          return;
        }
        // build the return payload
        var returnPayload = {
          identifier: payload.identifier,
          imageList: imageList
        };
        // send the image list back
        self.sendSocketNotification(
          'BACKGROUNDSLIDESHOW_FILELIST',
          returnPayload
        );
      });
    }
  }
});

//------------ end -------------
