/* Config service*/

angular.module('Remente').factory('ConfigSvc', [
  '$resource', '$timeout', '$http', '$q', function($resource, $timeout, $http, $q) {
    var config, d, _tryConfig;
    config = $resource('config', {}, {
      'get': {
        method: 'GET',
        timeout: 3000
      }
    });
    d = $q.defer();
    _tryConfig = function() {
      return config.get({}, function(config) {
        return d.resolve(config);
      }, function(err) {
        console.log('Failed to load config. Retry in 5 sec');
        return $timeout(_tryConfig, 3000, false);
      });
    };
    _tryConfig();
    return d.promise;
  }
]);
