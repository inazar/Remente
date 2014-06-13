angular.module('common').factory('$trace', function() {
  return {
    print: printStackTrace || function() {}
  };
}).provider('$exceptionHandler', {
  $get: [
    'exceptionLoggingService', function(exceptionLoggingService) {
      return exceptionLoggingService;
    }
  ]
}).factory('exceptionLoggingService', [
  '$log', '$window', '$baseurl', '$trace', function($log, $window, $baseurl, $trace) {
    return function(exception, cause, type) {
      var e, req;
      $log.error.apply($log, arguments);
      try {
        req = new XMLHttpRequest();
        req.open('POST', "" + $baseurl + "/logger", true);
        req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        return req.send(angular.toJson({
          userAgent: $window.navigator.userAgent,
          url: $window.location.href,
          message: exception.toString(),
          type: type || "exception",
          stack: type ? [] : $trace.print({
            e: exception
          }),
          cause: cause || ""
        }));
      } catch (_error) {
        e = _error;
        $log.warn('server-side logging failed');
        return $log.log(e);
      }
    };
  }
]);
