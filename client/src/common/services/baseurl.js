angular.module('common').factory('$baseurl', [
  '$window', function($window) {
    var baseUrl;
    baseUrl = 'http://remente.herokuapp.com';
    if ($window.location.protocol.substr(0, 4) === 'file') {
      return baseUrl;
    } else {
      return $window.location.origin;
    }
  }
]);
