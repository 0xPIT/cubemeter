
require.config({
  baseUrl: 'app',
  // urlArgs: 'r=@REV@',
  paths: {
//    config:                   '../config',
//    settings:                 'components/settings',
//    kbn:                      'components/kbn',

//    css:                      '../vendor/require/css',
//    text:                     '../vendor/require/text',
    moment:                   '../vendor/moment',

//    timepicker:               '../vendor/angular/timepicker',
//    datepicker:               '../vendor/angular/datepicker',

    underscore:               'components/underscore.extended',
//    'underscore-src':         '../vendor/underscore',
//    bootstrap:                '../vendor/bootstrap/bootstrap',

    jquery:                   '../vendor/jquery/jquery-1.8.0',
    'jquery-ui':              '../vendor/jquery/jquery-ui-1.10.3',

//    'extend-jquery':          'components/extend-jquery',

    'jquery.flot':            '../vendor/jquery/jquery.flot',
    'jquery.flot.pie':        '../vendor/jquery/jquery.flot.pie',
    'jquery.flot.events':     '../vendor/jquery/jquery.flot.events',
    'jquery.flot.selection':  '../vendor/jquery/jquery.flot.selection',
    'jquery.flot.stack':      '../vendor/jquery/jquery.flot.stack',
    'jquery.flot.stackpercent':'../vendor/jquery/jquery.flot.stackpercent',
    'jquery.flot.time':       '../vendor/jquery/jquery.flot.time',
    'jquery.flot.byte':       '../vendor/jquery/jquery.flot.byte',

  },
  shim: {
    underscore: {
      exports: '_'
    },

    bootstrap: {
      deps: ['jquery']
    },

    jquery: {
      exports: 'jQuery'
    },

    'jquery-ui':            ['jquery'],
    'jquery.flot':          ['jquery'],
    'jquery.flot.byte':     ['jquery', 'jquery.flot'],
    'jquery.flot.pie':      ['jquery', 'jquery.flot'],
    'jquery.flot.events':   ['jquery', 'jquery.flot'],
    'jquery.flot.selection':['jquery', 'jquery.flot'],
    'jquery.flot.stack':    ['jquery', 'jquery.flot'],
    'jquery.flot.stackpercent':['jquery', 'jquery.flot'],
    'jquery.flot.time':     ['jquery', 'jquery.flot'],

    timepicker:             ['jquery', 'bootstrap'],
    datepicker:             ['jquery', 'bootstrap'],

    elasticjs:              ['angular', '../vendor/elasticjs/elastic']
  },
  waitSeconds: 60,
});
