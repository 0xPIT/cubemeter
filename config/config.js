var _ = require('underscore'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    templatePath = path.normalize(__dirname + '/../app/mailer/templates');

module.exports = {
  development: {
    db: 'mongodb://localhost/noobjs_dev',
    
    root: rootPath,

    app: {
      name: 'cube sm demo'
    },

    cube: {
      db: {
        'mongo-host': '127.0.0.1',
        'mongo-port': 27017,
        'mongo-database': 'cube_development',
        'mongo-username': null,
        'mongo-password': null
      },

      collector: _.extend({
          'http-port': 1080,
          'udp-port': 1180
        },
        this.db
      ),

      evaluator: _.extend({
        'http-port': 1081
        }, 
        this.db
      )
    },

    weather: {
      locality: 'Munich,DE',
      apiKey: '210219f39514b0dbf28006e736d48a7f',
      updateInterval: 60
    },

    meters: [ 
      {
        name: 'Energy M8',
        gpio: 17,
        unit: 'kW/h',
        ticksPerUnit: 1000,
        timePerUnit:  3600,
        sampleTime: 60,
        valuePerSample: function(ticksCounted) {
          return Math.round(((ticksCounted / this.sampleTime) / (this.ticksPerUnit / this.timePerUnit)) * 100) / 100;
        }
      }
    ],
  
    auth: {
      facebook: {
        enable: true,
        options: {
          clientID: '463688167073480',
          clientSecret: '659c2c3096579803ce0d830e2242160e'
        }
      },
      twitter: {
        enable: true,
        options: {
          consumerKey: 'dqps2exOpeaWpVH3bFxA',
          consumerSecret: 'D8xzTtcuSe9q0eQ1XJsNDJ2rr0MTe9mtsRRCj5AIE'
        }
      },
      github: {
        enable: true,
        options: {
          clientID: '00d902ad15e8a34f3200',
          clientSecret: 'd5382aa91da301e3c07208fafeb1493cb6097eb8'
        }
      },
      google: {
        enable: true,
        options: {
          clientID: '325677237390-0tp3kvcumlo7a44vjuubi065sce1gbto.apps.googleusercontent.com',
          clientSecret: 'N6SZjRw234HoUOvPuaKBffzY'
        }
      },
      linkedin: {
        enable: true,
        options: {
          consumerKey: '77u4yy8ka5nzae',
          consumerSecret: 'QisfL9wkZ2XsIP5o',
          profileFields: ['id', 'first-name', 'last-name', 'email-address']
        }
      },
      xing: {
        enable: true,
        options: {
          consumerKey: 'cd76bf0762a51aeaaed5',
          consumerSecret: '32cce60ab6cdda572f83c694067c4bafea261bd5',
          profileFields: ['id', 'first_name', 'last_name', 'active_email']
        }
      }
    }
  },

  test: {
    db: 'mongodb://localhost/cube_test',

    root: rootPath,

    app: {
      name: 'cube sm demo'
    },

    auth: {
      facebook: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
      },
      twitter: {
        clientID: 'dqps2exOpeaWpVH3bFxA',
        clientSecret: 'D8xzTtcuSe9q0eQ1XJsNDJ2rr0MTe9mtsRRCj5AIE',
        callbackURL: 'http://localhost:3000/auth/twitter/callback'
      },
      github: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/github/callback'
      },
      google: {
        clientID: '325677237390-0tp3kvcumlo7a44vjuubi065sce1gbto.apps.googleusercontent.com',
        clientSecret: 'N6SZjRw234HoUOvPuaKBffzY',
        callbackURL: 'http://localhost:3000/auth/google/callback'
      },
      linkedin: {
        clientID: 'CONSUMER_KEY',
        clientSecret: 'CONSUMER_SECRET',
        callbackURL: 'http://localhost:3000/auth/linkedin/callback'
      }
    }
  },

  production: {

  }
};
