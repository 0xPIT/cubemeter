var http = require('http'),
    _ = require('underscore'),
    Emitter,
    weather,
    weatherCollectorTimer;

function Weather(options) {
  var self = this;

  self.options = options || {};
  self.locality = self.options.locality || null;
  if (!self.locality) throw new Error('Weather: No Locality provided.');

  self.weatherServiceAPIKey = self.options.weatherServiceAPIKey || self.options.apiKey || self.options.apikey;
  if (!self.weatherServiceAPIKey) throw new Error('Weather: No API key provided.');

  self.language = self.options.language || self.options.lang || (process.env.hasOwnProperty('LANG')) ? process.env.LANG.substr(0,2) : 'de';
  self.units = options.units || 'metric';

  self.weatherServiceUri = 'http://api.openweathermap.org/data/2.5';
  self.weatherConditionIconBaseUrl = 'http://openweathermap.org/img/w/';

  self.absZero = 273.15;
  self.lastWeatherStatusTimestamp = 0;
}

Weather.prototype.kelvinToCelsius = function(k) {
  return Math.round((k - absZero) * 10) / 10;
}

Weather.prototype.kelvinToFahrenheit = function(k) {
  return Math.round((((k - absZero) * 1.8) + 32) * 10) / 10;
}

Weather.prototype.conditionIconUrls = function(c) {
  var result = [];

  if (c && typeof c === 'object' && c.hasOwnProperty('weather') && typeof c.weather === 'object' && c.weather.length > 0) {
    for(var w = 0; w < c.weather.length; w++) {
      if (c.weather[w].hasOwnProperty('icon')) {
        result.push(this.weatherConditionIconBaseUrl + c.weather[w].icon + '.png');
      }
    }
  }

  return result;
}

Weather.prototype.isSameAsLastResponse = function(response) {
  return (response.hasOwnProperty('dt')) ? this.lastWeatherStatusTimestamp === response.dt : false;
}

Weather.prototype.getWeather = function(callback) {
  var uri = this.weatherServiceUri
      + '/weather?q=' + this.locality
      + '&units='  + this.units
      + '&lang=' + this.language
      + '&APPID='  + this.weatherServiceAPIKey;
  self = this;

  http.get(uri, function(res) {
    if (res.statusCode != 200) {
      callback('Failed to fetch weather data, http status: ' + res.statusCode);
      return;
    }

    res.on('data', function(data) {
      var W = JSON.parse(data);

      // preprocess data
      self.lastWeatherStatusTimestamp = W.dt;
      delete W.cod;
      delete W.id;
      W.ts = W.dt;
      W.dt = new Date(W.dt * 1000);
      W.sys.sunrise = new Date(W.sys.sunrise * 1000);
      W.sys.sunset = new Date(W.sys.sunset * 1000);

      callback(null, W);
      return;
    });
  }).on('error', function(e) {
        console.error('Error: ' + e);
        callback(e);
        return;
      }).on('end', function(e) {
        console.error('End:' + e);
        callback(e);
        return;
      });

  callback('wtf');
}


function updateWeather() {
  weather.getWeather(function(err, w) {
    if (!err) {
      var t = {
        type: "weather",
        time: w.dt,
        id: w.ts,
        data: {
          temperature: w.main.temp,
          pressure: w.main.pressure,
          humidity: w.main.humidity,

          wind: {
            speed: w.wind.speed,
            direction: w.wind.deg
          },
          
          cloud : {
            coverage: w.clouds.all
          },
          
          sun: {
            rise: w.sys.sunrise, 
            set: w.sys.sunset
          },
          
          conditions: w.weather
        }
      };
      console.log('Weather Event: ' + JSON.stringify(t));
      Emitter.send(t);
    }
  });
}

function WeatherService(options) {

}

WeatherService.prototype.setup = function (emitter, config)
{
  Emitter = emitter;
  weather = new Weather(config.weather);

  updateWeather();
  weatherCollectorTimer = setInterval(updateWeather, config.weather.updateInterval * 1000);
}

WeatherService.prototype.shutdown = function() {
  if (weatherCollectorTimer) {
    clearInterval(weatherCollectorTimer);
  }
}

exports = module.exports = new WeatherService();
exports.WeatherService = WeatherService;
exports.ServiceName = 'WeatherService';

