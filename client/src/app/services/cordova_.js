/* Cordova service*/

angular.module('Remente').factory('CordovaSvc', [
  '$window', '$document', '$timeout', '$q', '$rootScope', function($window, $document, $timeout, $q, $rootScope) {
    var d, t, _onReady, _ref;
    d = $q.defer();
    if ((_ref = $window.device) != null ? _ref.available : void 0) {
      d.resolve($window.device);
    } else {
      _onReady = function() {
        return $rootScope.$apply(function() {
          $timeout.cancel(t);
          return d.resolve($window.device);
        });
      };
      t = $timeout(function() {
        $document[0].removeEventListener('deviceready', _onReady);
        return d.reject();
      }, 3000);
      $document[0].addEventListener('deviceready', _onReady, false);
    }
    return d.promise;
  }
]);
