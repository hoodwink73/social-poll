var Poller = function (options) {
  var url, interval, once;
  if ( !_.has(options, 'url') ) {
    throw new Error("You must pass a url to instantiate a polling object");
  } else {
    this.url = options.url;
  }

  // this interval refers to the polling interval, like hitting 
  // the server every minute, don't confuse it with 'interval'
  // query in the API which fetches data calculated over a day,
  // week, or month
  this.interval = options.interval || 5000;

  this.successCb = options.successCb;

  // invocation of this private method fires
  // the AJAX call
  this._wrapperFn = function () {
    return $.ajax({
      type: 'GET',
       url: this.url,
       contentType: 'application/json'
    });
  };
};

Poller.prototype.start = function (successCb, once) {
  // the success callback can be passed in dynamically
  // or the initial success callback passed with options
  // during the instantiation of the poller object 
  // will be fired by default
  if ( typeof successCb === 'undefined' ) {
    if ( this.successCb ) {
      successCb = this.successCb;
    }
  }
  // if the start method of the poller object was invoked
  // before a private property is assigned the returned
  // value of the setInterval
  // we check this private property before polling 
  // to avoid adding redundant polling events in the 
  // global event queue
  var intervalObj = this._intervalObj;

  // wrapper function over ajax request method
  // invoked every interval
  var doItAgain = function () {
    var jqxhr = this._wrapperFn();
    jqxhr.done(successCb);
    return jqxhr;
  };

  // bind the function with the Poller object
  doItAgain = _.bind(doItAgain, this);
  // check for an existing polling event at every interval
  if (!intervalObj) {
    var jqxhr = doItAgain();
    successCb = this.successCb || successCb;
    if ( once ) {
      return ;
    }
    this._intervalObj = window.setInterval(doItAgain, this.interval);
    return jqxhr;
  }
};

Poller.prototype.stop = function (afterStopCb) {
  if ( this._intervalObj ) {
    window.clearInterval(this._intervalObj);
    this._intervalObj = void(0);
    if ( afterStopCb ) {
      afterStopCb();
    }
  }
};

Poller.prototype.changeUrl = function (url) {
  this.url = url;
  return url;
};