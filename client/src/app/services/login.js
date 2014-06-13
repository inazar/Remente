/* User login service*/

angular.module('Remente').service('LoginSvc', [
  '$rootScope', '$window', '$http', '$q', '$ionicPopup', '$filter', 'gettext', 'ConfigSvc', 'PushSvc', 'exceptionLoggingService', function($scope, $window, $http, $q, $ionicPopup, $filter, gettext, ConfigSvc, PushSvc, exceptionLoggingService) {
    var _this = this;
    return angular.extend(this, {
      user: null,
      set: function(user, e) {
        var d,
          _this = this;
        d = $q.defer();
        if (user) {
          user.task += $scope._tzOffset(user.task);
          user.plan += $scope._tzOffset(user.plan);
          if (user["native"]) {
            PushSvc.register().then(function() {
              return d.resolve(this.user = user);
            }, function(err) {
              exceptionLoggingService(err, 'push service register', 'warning');
              user["native"] = false;
              return $ionicPopup.alert({
                title: $filter('translate')(gettext('Notifications')),
                template: $filter('translate')(gettext('Cannot enable notifications. Please, check your device settings')),
                okText: $filter('translate')(gettext('Ok'))
              }).then(function() {
                return d.resolve(_this.user = user);
              });
            });
          } else {
            PushSvc.unregister().then(function() {
              return d.resolve(this.user = user);
            }, function(err) {
              exceptionLoggingService(err, 'push service unregister', 'warning');
              return d.resolve(_this.user = user);
            });
          }
          if (typeof analytics !== "undefined" && analytics !== null) {
            analytics.identify(user._id, {
              name: user.name || '',
              email: user.email
            });
          }
          if (typeof analytics !== "undefined" && analytics !== null) {
            analytics.track(e);
          }
        } else {
          PushSvc.unregister().then(function() {
            return d.resolve(this.user = null);
          }, function(err) {
            exceptionLoggingService(err, 'push service unregister', 'warning');
            return d.resolve(_this.user = null);
          });
          if (typeof analytics !== "undefined" && analytics !== null) {
            analytics.track(e);
          }
        }
        return d.promise;
      },
      register: function(user) {
        var d,
          _this = this;
        d = $q.defer();
        ConfigSvc.then(function(config) {
          var routes;
          routes = config.routes;
          $http({
            method: 'POST',
            url: "" + routes.user + routes.signup,
            data: user,
            silent: true
          }).success(function(res) {
            return _this.set(res.user, 'register').then(d.resolve, d.reject);
          }).error(function(err) {
            return d.reject(err);
          });
          return config;
        });
        return d.promise;
      },
      login: function(user) {
        var d;
        d = $q.defer();
        ConfigSvc.then(function(config) {
          var routes;
          routes = config.routes;
          $http({
            method: 'POST',
            url: "" + routes.user + routes.login,
            data: user,
            silent: true
          }).success(function(res) {
            return _this.set(res.user, 'login').then(d.resolve, d.reject);
          }).error(function(err) {
            return d.reject(err);
          });
          return config;
        });
        return d.promise;
      },
      logout: function() {
        var d,
          _this = this;
        d = $q.defer();
        ConfigSvc.then(function(config) {
          var routes;
          routes = config.routes;
          $http({
            method: 'POST',
            url: "" + routes.user + routes.logout
          }).success(function(res) {
            return _this.set(null, 'logout').then(d.resolve, d.reject);
          });
          return config;
        });
        return d.promise;
      },
      forgot: function(user) {
        var d;
        d = $q.defer();
        ConfigSvc.then(function(config) {
          var routes;
          routes = config.routes;
          $http({
            method: 'POST',
            url: "" + routes.user + routes.forgot,
            data: user,
            silent: true
          }).success(function(res) {
            return d.resolve();
          }).error(function(err) {
            return d.reject(err);
          });
          return config;
        });
        return d.promise;
      },
      recover: function(code) {
        var d,
          _this = this;
        d = $q.defer();
        ConfigSvc.then(function(config) {
          var routes;
          routes = config.routes;
          $http({
            method: 'POST',
            url: "" + routes.user + routes.recover,
            data: {
              code: code
            }
          }).success(function(res) {
            return _this.set(res.user, 'recover').then(d.resolve, d.reject);
          }).error(function(err) {
            return d.reject(err);
          });
          return config;
        });
        return d.promise;
      }
    });
  }
]);
