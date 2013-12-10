var os = require('os')
  , _ = require('underscore')
  , Meters = []
  , Emitter = null
  , isLinux = os.platform() === 'linux'
  , Gpio = (isLinux) ? require('onoff').Gpio : null;


function fakeMeter(min, max) {
  return Math.round(Math.floor(Math.random() * (max - min + 1) + min) * 10) / 10;
}


function collectMeterTicks(meter) {
  var now = Date.now(),
      sampleTime = now - meter.sampleStart;
  
  if (typeof meter.port === 'number') { // no hardware -> fake it
    meter.tickCounter = fakeMeter(0, 200);
  }

  var sample = {
    type: 'meter',
    time: now,
    id: now,
    data: {
      meter: meter.name,
      duration: Math.round((sampleTime / 1000) * 100) / 100,
      ticks: meter.tickCounter,
      value: meter.valuePerSample(meter.tickCounter)
    }
  };
  console.log('Meter Event, "' + meter.name + '": ' + JSON.stringify(sample));
  Emitter.send(sample);

  meter.tickCounter = 0;
  meter.sampleStart = Date.now();
}


function MeterService(options) {
  if (options) {
    this.options = options;
  }
}


MeterService.prototype.setup = function (emitter, config)
{
  Emitter = emitter;

  _.each(config.meters, function(meter) {
    console.log('Setup Meter "' + meter.name + '"');
    _.extend(meter, {
        port: (isLinux) ? new Gpio(meter.gpio, 'in', 'falling', {persistentWatch: true}) :  meter.gpio,
        tickCounter: 0,
        sampleStart: Date.now()
      }
    );

    Meters.push(meter);

    // setup interrupt callback
    if (typeof meter.port === 'object') {
        meter.port.watch(function(err, value) {
        if (err) {
          console.error('Something is very wrong');
          exit();
        }
        meter.tickCounter = meter.tickCounter + 1;
        console.log(meter.tickCounter);
      });
    }

    // setup data collection timer
    if (meter.sampleTime > 1) {
      meter.samplingTimer = setInterval(collectMeterTicks, meter.sampleTime * 1000, meter);
    }
  });
}


MeterService.prototype.shutdown = function () {
  _.each(Meters, function(meter) {
    console.log('MeterService: Shutdown ' + meter.name);
    if (typeof meter.port !== 'number') {
      meter.port.unexport(); 
    }
  });
}


exports = module.exports = new MeterService();
exports.MeterService = MeterService;
exports.ServiceName = 'MeterService';
