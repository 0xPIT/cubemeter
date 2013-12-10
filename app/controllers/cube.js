var cube = require('cube')
  , _ = require('underscore')
  , http = require('http')
  , moment = require('moment');


exports.index = function(req, res) {
  var from = moment((req.param('from')) ? req.param('from') : moment().startOf('month')),
      thru = (req.param('thru')) ? moment(req.param('thru')) : null,
      uri = 'http://localhost:1081/1.0/event/get'
          + '?expression=weather(temperature,humidity,pressure,cloud.coverage,conditions.icon)'
          + ((from) ? '&start=' + from.format('YYYY-MM-DD') : '')
          + ((thru) ? '&stop=' + thru.format('YYYY-MM-DD') : '');

//  console.log(uri);

  http.get(uri, function(response) {
    if (response.statusCode != 200) {
      console.error('Failed to fetch from cube');
      return;
    }
    var rawdata = '';

    response.on('data', function(data) {
      rawdata += data;
    });

    response.on('end', function() {
      var d = JSON.parse(rawdata);
      rawdata = '';
      if (req.param('format') === 'json') {
        res.json(d);
      }
      else {
        res.render('cube/index', {
          title: 'Events',
          events: d
        });
      }
    });

    response.on('error', function(err) {
      console.error('Error: ' + err);
    });
    
  });  
};

/*
refactor for parameter source=energy/weather
+ array with query expression
so that both das sources work with steps
*/

exports.meter = function(req, res) {
  var from = moment((req.param('from')) ? req.param('from') : moment().startOf('month')),
      thru = (req.param('thru')) ? moment(req.param('thru')) : null,
      step = (req.param('step')),
      uri = 'http://localhost:1081/1.0/event/get'
          + '?expression=meter(value,ticks,duration,meter)';
       
  if (step && step !== 'raw') {
    uri = 'http://localhost:1081/1.0/metric?expression=sum(meter(ticks))&step=' + step;
  }

  uri += ((from) ? '&start=' + from.format('YYYY-MM-DD') : '')
       + ((thru) ? '&stop=' + thru.format('YYYY-MM-DD') : '');

  //console.log(uri);

  var rawdata = '';

  http.get(uri, function(response) {
    if (response.statusCode != 200) {
      console.error('Failed to fetch from cube');
      return;
    }

    response.on('data', function(data) {
      rawdata += data;
    });

    response.on('end', function() {
        var d = JSON.parse(rawdata);
        rawdata = '';
        if (req.param('format') === 'json') {
          res.json(d);
        }
        else {
          res.render('cube/meter', {
            title: 'Events',
            events: d
          });
        }
    });

    response.on('error', function(err) {
      console.error('Error: ' + err);
    });

  });  
};
