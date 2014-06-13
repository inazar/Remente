angular.module('common').factory('$localStore', [
  '$window', '$cookieStore', function($window, $cookieStore) {
    var localStorage;
    if (localStorage = $window.localStorage) {
      return {
        get: function(key) {
          var value;
          if (value = localStorage.getItem(key)) {
            return angular.fromJson(value);
          } else {
            return value;
          }
        },
        put: function(key, value) {
          return localStorage.setItem(key, angular.toJson(value));
        },
        remove: function(key) {
          return localStorage.removeItem(key);
        }
      };
    } else {
      return $cookieStore;
    }
  }
]);
