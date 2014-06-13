angular.module('common').factory('$baseurl', [
  '$window', function($window) {
    var baseUrl;
    baseUrl = 'http://remente.herokuapp.com';
    if ($window.location.protocol === 'file:') {
      return baseUrl;
    } else {
      return '';
    }
  }
]);
