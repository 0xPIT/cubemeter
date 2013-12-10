var from = moment(),
    thru = moment().add('days', 1),
    step = '6e4',
    isofmt = 'YYYY-MM-DD',
    url,
    dateRangeElement = null;

function weekendMarker(axes) {
  "use strict";

  var markings = [],
      d = new Date(axes.xaxis.min);

  // go to the first Saturday
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7))
  d.setSeconds(0); d.setMinutes(0); d.setHours(0);

  // without yaxis, the rectangle automatically
  // extends to infinity upwards and downwards
  var i = d.getTime();
  do {
    markings.push({ xaxis: { from: i, to: i + 2 * 24 * 60 * 60 * 1000 } });
    i += 7 * 24 * 60 * 60 * 1000;
  } while (i < axes.xaxis.max);

  return markings;
}

function simpleAxisFormatter(unit) {
  "use strict";

  return function(v, axis) {
    return '' + Math.round(v.toFixed(axis.tickDecimals) * 10) / 10 + unit;
  };
}

function initializeDateRangePicker(targetElement, updateCallback) {
  "use strict";

  dateRangeElement = targetElement;
  $(dateRangeElement).daterangepicker(
    {
      startDate: from,
      endDate: thru,
      minDate: '2013-01-01',
      maxDate: moment().add('month', 1).endOf('month').format(isofmt),
      dateLimit: { days: 60 },
      showDropdowns: true,
      showWeekNumbers: false,
      timePicker: false,
      timePickerIncrement: 1,
      timePicker12Hour: true,
      ranges: {
        'Today': [moment(), moment().add('days', 1)],
        'Yesterday': [moment().subtract('days', 1), moment()],
        'Last 7 Days': [moment().subtract('days', 6), moment()],
        'Last 30 Days': [moment().subtract('days', 29), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
      },
      opens: 'left',
      buttonClasses: ['btn btn-default'],
      applyClass: 'btn-small btn-primary',
      cancelClass: 'btn-small',
      format: isofmt,
      separator: ' to ',
      locale: {
        applyLabel: 'Submit',
        fromLabel: 'From',
        toLabel: 'To',
        customRangeLabel: 'Custom Range...',
        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        firstDay: 1
      }
    },
    updateCallback
  );
}

var Graph = {
  HumidityCloudcoverage: {
    id: '#chart-1',
    plot: null,
    data: null,
    options: {
      xaxis: {
        mode: 'time',
        timezone: 'browser'
      },
      yaxes: [{
        min: 0,
        tickFormatter: simpleAxisFormatter('%')
      }],
      legend: { position: 'sw' },
      series: {
        lines: { show: true },
        curvedLines: { active: true }
      },
      crosshair: { mode: 'x' },
      grid: {
        hoverable: true,
        autoHighlight: false,
        markings: weekendMarker
      },
      selection: {  mode: 'x' }
    }
  },
  TemperaturePressure: {
    id: '#chart-2',
    plot: null,
    data: null,
    options: {
      xaxis: {
        mode: 'time',
        timezone: 'browser'
      },
      yaxes: [{
        tickFormatter: simpleAxisFormatter(' °C')
      }, {
        position: 'right',
        alignTicksWithAxis: 1, //position == "right" ? 1 : null,
        tickFormatter: simpleAxisFormatter(' hPa')
      }],
      legend: { position: 'sw' },
      series: {
        lines: { show: true },
        curvedLines: { active: true }
      },
      crosshair: { mode: 'x'  },
      grid: {
        hoverable: true,
        autoHighlight: false,
        markings: weekendMarker
      },
      selection: {  mode: 'x' }
    }
  },
  Energy: {
    id: '#chart-3',
    plot: null,
    data: { values: null, ticks: null },
    options: {
      xaxis: {
        mode: 'time',
            timezone: 'browser'
      },
      yaxes: [{
        min: 0,
        tickFormatter: simpleAxisFormatter(' kW')
      }],
          legend: { position: 'sw' },
      series: {
        lines: { show: true },
        curvedLines: { active: true }
      },
      crosshair: {  mode: 'x'  },
      grid: {
        hoverable: true,
            autoHighlight: false,
            markings: weekendMarker
      },
      selection: { mode: 'x' }
    }
  }
};

function loadMask(elem, on) {
  "use strict";

  if (on) {
    elem.addClass('fadedGraph')
        .parent().children('.loading').show();
  }
  else {
    elem.removeClass('fadedGraph')
        .parent().children('.loading').hide();
  }
}

function fetchData() {  
  "use strict";

  function onDataReceived(data) {
    var Humidity = [], Temperature = [], Pressure = [], CloudCoverage = [];

    $.each(data, function(key, v) {
      var ts = new Date(v.time).getTime();
      Humidity.push([ts, v.data.humidity ]);
      Temperature.push([ts, v.data.temperature ]);
      Pressure.push([ts, v.data.pressure ]);
      CloudCoverage.push([ts, v.data.cloud.coverage ]);
    });

    Graph.TemperaturePressure.plot = $.plot(Graph.TemperaturePressure.id, [
      { data: Temperature,   label : 'Temperature', color: 0,           curvedLines: {apply: true} },
      { data: Pressure,      label : 'Pressure'   , color: 1, yaxis: 2, curvedLines: {apply: true} }
    ], Graph.TemperaturePressure.options);

    Graph.HumidityCloudcoverage.plot = $.plot(Graph.HumidityCloudcoverage.id, [
      { data: CloudCoverage, label : 'Cloud Coverage', color: 2,           curvedLines: {apply: true} },
      { data: Humidity,      label : 'Humidity',       color: 3, yaxis: 1, curvedLines: {apply: true} }
    ], Graph.HumidityCloudcoverage.options);

    loadMask($(Graph.TemperaturePressure.id), false);
    loadMask($(Graph.HumidityCloudcoverage.id), false);
  }

  $.ajax({
    url: '/cube?format=json&from=' + from.format(isofmt) + "&thru=" + thru.format(isofmt),
    type: "GET",
    dataType: "json",
    cache: false,
    success: onDataReceived
  });
}

function fetchMeter() {
  "use strict";

  function onDataReceived(data) {
    Graph.Energy.data.values = [];
    Graph.Energy.data.ticks = [];

    $.each(data, function(key, v) {
      var ts = new Date(v.time).getTime();
      if (step === 'raw') {
        Graph.Energy.data.values.push([ ts, v.data.value ]);
        Graph.Energy.data.ticks.push([ ts, v.data.ticks ]);
      }
      else {
        // resample
        //    (ticksCounted / this.sampleTime)                 / (this.ticksPerUnit / this.timePerUnit)
        // -> (ticksCounted * this.sampleTime / newSampleTime) / (this.ticksPerUnit / this.timePerUnit)
        var val = (v.value * 60 / (parseFloat(step) / 1000)) / (1000 / 60);
        if (Math.abs(val) > 0) {
          Graph.Energy.data.values.push([ ts, val ]);
          Graph.Energy.data.ticks.push([ ts, v.value ]);
        }
      }
    });

    Graph.Energy.plot = $.plot(Graph.Energy.id,
      [
        { 
          data: Graph.Energy.data.values,
          label : 'Energy', 
          color: 2, 
          curvedLines: { 
            apply: true 
          } 
        },
      ], Graph.Energy.options
    );

    loadMask($(Graph.Energy.id), false);
  }

  $.ajax({
    url: '/meter?format=json&step=' + step + '&from=' + from.format(isofmt) + "&thru=" + thru.format(isofmt),
    type: "GET",
    dataType: "json",
    cache: false,
    success: onDataReceived
    //error: function(jqXHR, textStatus, errorThrown) { console.log(''); }
  });
}

function averageRange(graph, range) {
  "use strict";

  var memo = 0,
      rangeData = _.filter(Graph.Energy.data.ticks, function(d) {
        return d[0] >= range.xaxis.from && d[0] <= range.xaxis.to;
      }),
      minT = _.min(rangeData, function(d) { return d[0]; }),
      maxT = _.max(rangeData, function(d) { return d[0]; }),
      sum = _.reduce(rangeData, function(memo, d){ return memo + d[1]; }, 0);

  /*console.log('min: ' + moment(minT[0]).format('HH:mm')
    + ' max: ' + moment(maxT[0]).format('HH:mm')
    + ' ticks: ' + sum
    + ' avg: ' + sum / rangeData.length
    + ' kw/h: ' + (sum / 1000).toFixed(2)
    + ' €: ' + (sum / 1000 * 0.22).toFixed(2)
  );*/

  $("#debug").text('' + moment(minT[0]).format('HH:mm') + ' - ' + moment(maxT[0]).format('HH:mm') 
                 + ': ' + (sum / 1000).toFixed(2)
                 + ' kW/h = ' + (sum / 1000 * 0.22).toFixed(2) + '€'
  );
}

function update(start, end) {
  "use strict";

  if (start) {
    from = start;
  }

  if (end) {
    thru = end;
  }

  $(dateRangeElement + ' span').html(from.format('MMMM D, YYYY') + ' - ' + thru.format('MMMM D, YYYY'));

  fetchData();
  fetchMeter();
}

function updateWithMask(start, end) {
  "use strict";

  _.each(Graph, function(graph) {
    loadMask($(graph.id), true);
  });

  update(start, end);
}

function synchronizedCrosshairs() {
  "use strict";
  _.each(Graph, function(graph) {
    $(graph.id).bind('plothover',  function (event, pos, item) {
      _.each(Graph, function(g) {
        if (g.id !== graph.id) {
          g.plot.setCrosshair(pos);
        }
      });
    });
  });
}

// FIXME: make legend generic
var updateLegendTimeout = null,
    latestPosition = null;

function updateLegend() {
  "use strict";

  var i, j, dataset,
      pos = latestPosition,
      axes = Graph.Energy.plot.getAxes();

  updateLegendTimeout = null;

  if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
    return;
  }

  dataset = Graph.Energy.plot.getData();

  for (i = 0; i < dataset.length; ++i) {
    var series = dataset[i];

    // Find nearest points, x-wise
    for (j = 0; j < series.data.length; ++j) {
      if (series.data[j][0] > pos.x) {
        break;
      }
    }

    // interpolate
    var y,
        p1 = series.data[j - 1],
        p2 = series.data[j];

    if (p1 == null) {
      y = p2[1];
    }
    else if (p2 == null) {
      y = p1[1];
    }
    else {
      y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
    }

    //console.log(y);
    //window.legends.eq(i).text(series.label.replace(/=.*/, "= " + y.toFixed(2)));
    $("#chart-3 .legendLabel").text(dataset[0].label + ' ' + y.toFixed(2));
  }
}

$(document).ready(function() {
  "use strict";

  moment.lang(navigator.language.substr(0, 2));

  synchronizedCrosshairs();

  // data granularity control
  $('button[data-step]').bind('click', function (event) {
    $('button[data-step]').removeClass('btn-primary').removeClass('active'); 
    $(this).addClass('btn-primary').addClass('active');
    step = $(this).attr('data-step');
    loadMask($(Graph.Energy.id), true);
    fetchMeter();
  });

  initializeDateRangePicker('#reportrange', updateWithMask);

  $(Graph.Energy.id).bind("plothover",  function (event, pos, item) {
    latestPosition = pos;
    if (!updateLegendTimeout) {
      updateLegendTimeout = setTimeout(updateLegend, 50);
    }
  });

  $(Graph.Energy.id).bind("plotselected", function (event, ranges) {
    averageRange(Graph.Energy.plot, ranges);
  });

  updateWithMask(from, thru);

  setInterval(update, 30 * 1000);
});
