$(function() {

  var app = window.app = _.extend(Backbone.Events, {});
  var dev = false;
  app.presentQuestion = null;
  app.activateAPI = "/api/activate";
  app.pollAPI = "/api/results?question=";


  app.utils = {};

  app.init = function () {
    // start with question one
    // app.beginNewQuestion(1);

    // start polling for the api
    app.poller = new Poller({
      'url': app.pollAPI + app.presentQuestion,
      'interval': 2000
    });
  };

  app.beginNewQuestion = function (questionNo) {
    app.presentQuestion = questionNo;
    // send a request to server stating that
    // it should start listening to a new question
    var requestBody = JSON.stringify({
      "question": questionNo + ""
    });
    app.utils.postJSON(app.activateAPI, requestBody, function () {
      app.poller.stop();
      app.poller.changeUrl(app.pollAPI + app.presentQuestion);
      app.trigger('question:new', app.presentQuestion);
    });

    if (dev) {
      (function () {
        app.trigger('question:new', app.presentQuestion);
      })();
    }
  };

  app.setFirstQuestion = function () {
    // what's your name
    app.first = {};
    app.presentQuestionObj = app.first;
    $('#start-message').hide();
    var template = _.template($('script[data-question="1"]').html());
    var appWrapper = $('.app-wrapper');
    var html = template({});
    appWrapper.html(html);
    app.first.previousNames = [];

    app.first.appendNames = function (names) {
      $('.not-listening').hide();

      var previousNames = app.first.previousNames;
      names = names.data;

      var newNames = _.difference(names, previousNames);

      var appendName = function (name) {
        var wrapper = $('<div class="name"/>');
        wrapper.html(name);
        $('.names-wrapper').append(wrapper);
        wrapper.addClass('animated flash');
      };

      if (_.isArray(newNames)) {
        _.each(newNames, function (name, index) {
          appendName(name);
          $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        });
      } else{
        appendName(newNames);
      }

      app.first.previousNames = names;
    };

    app.first.clear = function () {
      if (app.first.visited) {
        app.first.cacheHTML = $('.app-wrapper').html();
        $('.app-wrapper').html('');
        app.poller.stop();
      }
    };

    if (app.presentQuestion === 1) {
      app.poller.start(app.first.appendNames);
    }

    if (app.first.cacheHTML) {
      appWrapper.html(app.first.cacheHTML);
    }

  };

  app.setupSecondQuestion = function () {
    // what's your age
    app.second = {};
    $('#start-message').hide();
    var template = _.template($('script[data-question="2"]').html());
    var html = template({});
    $('.app-wrapper').html(html);
    $('canvas').hide();

    app.second.appendAgeDistribution = function (data) {
      data = data.data;
      var dataset = _.values(data);
      if (!_.has(app.second, 'ageChart')) {
        $('canvas').show();
        var chartData = {
          'labels': ['18-20', '20-22', '22-24'],
          datasets:[{
            data: _.values(data),
            fillColor: "rgba(255, 105, 102,0.5)",
            strokeColor: "rgba(255, 105, 102,0.8)",
            highlightFill: "rgba(255, 105, 102,0.75)",
            highlightStroke: "rgba(255, 105, 102,1)"
          }]
        };
        var ctx = $("#age-chart").get(0).getContext("2d");
        app.second.ageChart = new Chart(ctx).Bar(chartData);
        $('.not-listening').hide();
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
      } else {
        _.each(dataset, function (data, index){
          app.second.ageChart.datasets[0].bars[index].value = data;
          app.second.ageChart.update();
        });
        
      }
    };

    if (app.presentQuestion === 2) {
      app.poller.start(app.second.appendAgeDistribution);
    }
  };

  app.setupThirdQuestion = function () {
    // do you want be entrepreneur
    $('#start-message').hide();
    app.third = {};
    var template = _.template($('script[data-question="3"]').html());
    var html = template({});
    $('.app-wrapper').html(html);
    $('canvas').hide();

    app.third.appendEntrepreneurPie = function (data) {
      data = data.data;
      var yes = data.yes;
      var no = data.no;
      if (!_.has(app.third, 'entrepreneurPie')) {
        $('canvas').show();
        var chartData = [{
          value: yes,
          color:"rgba(255, 105, 102, 0.7)",
          highlight: "rgba(255, 105, 102, 0.8)",
          label: "Yes"
        },
        {
          value: no,
          color: "rgba(52, 73, 94, 0.4)",
          highlight: "rgba(52, 73, 94, 0.6)",
          label: "No"
        }];
        var ctx = $("#entrepreneur-pie").get(0).getContext("2d");
        app.third.entrepreneurPie = new Chart(ctx).Doughnut(chartData, {
          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span class=\"legend-color-label\" style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
        });
        $('.not-listening').hide();
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        var legendHTML = app.third.entrepreneurPie.generateLegend();
        $('canvas').after(legendHTML);
      } else {
        _.each(data, function (value, key){
          if (key === 'yes') {
            app.third.entrepreneurPie.segments[0].value = value;
          } else if (key === 'no') {
            app.third.entrepreneurPie.segments[1].value = value;
          }
          app.third.entrepreneurPie.update();
        });
        
      }
    };

    if (app.presentQuestion === 3) {
      app.poller.start(app.third.appendEntrepreneurPie);
    }
  };

  app.setupFourthQuestion = function () {
    // seek social support
    $('#start-message').hide();
    app.fourth = {};
    var template = _.template($('script[data-question="4"]').html());
    var html = template({});
    $('.app-wrapper').html(html);
    $('canvas').hide();

    app.fourth.appendSocialPie = function (data) {
      data = data.data;
      var yes = data.yes;
      var no = data.no;
      if (!_.has(app.fourth, 'socialPie')) {
        $('canvas').show();
        var chartData = [{
          value: yes,
          color:"rgba(255, 105, 102, 0.7)",
          highlight: "rgba(255, 105, 102, 0.8)",
          label: "Yes"
        },
        {
          value: no,
          color: "rgba(52, 73, 94, 0.4)",
          highlight: "rgba(52, 73, 94, 0.6)",
          label: "No"
        }];
        var ctx = $("#social-pie").get(0).getContext("2d");
        app.fourth.socialPie = new Chart(ctx).Doughnut(chartData, {
          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span class=\"legend-color-label\" style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
        });
        $('.not-listening').hide();
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        var legendHTML = app.fourth.socialPie.generateLegend();
        $('canvas').after(legendHTML);
      } else {
        _.each(data, function (value, key){
          if (key === 'yes') {
            app.fourth.socialPie.segments[0].value = value;
          } else if (key === 'no') {
            app.fourth.socialPie.segments[1].value = value;
          }
          app.fourth.socialPie.update();
        });
        
      }
    };

    if (app.presentQuestion === 4) {
      app.poller.start(app.fourth.appendNames);
    }
  };

  app.utils.postJSON = function (api, data, success) {
    $.post(api, data, function(response) {
        success(response);
    }, 'json');
  };

  app.on('question:new', function (questionNum) {
    app.poller.stop();
    app.poller.changeUrl(app.pollAPI + app.presentQuestion);
    app.routers.navigate('question/' + questionNum, {trigger: true});
  });


  var routers = Backbone.Router.extend({
    routes: {
      '': 'index',
      'question/:num': 'changeQuestion',
    },

    index: function () {
      $('.app-wrapper').html('');
      app.poller.stop();
    },

    changeQuestion: function (number) {
      if (number === "1") {
        app.setFirstQuestion();
      } else if (number === "2"){
        app.setupSecondQuestion();
      } else if (number === "3") {
        app.setupThirdQuestion();
      } else if (number === "4") {
        app.setupFourthQuestion();
      }
    }
  });

  app.init();

  app.routers = new routers();

  Backbone.history.start();

  
});