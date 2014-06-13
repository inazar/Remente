angular.module('Remente').service('PushSvc', [
  '$window', '$rootScope', '$q', '$http', '$timeout', '$state', 'ConfigSvc', 'CordovaSvc', 'DeviceSvc', function($window, $scope, $q, $http, $timeout, $state, ConfigSvc, CordovaSvc, DeviceSvc) {
    $window.handleOpenURL = function(url) {
      return console.log(url);
    };
    return angular.extend(this, {
      registered: false,
      register: function() {
        var d,
          _this = this;
        d = $q.defer();
        if (DeviceSvc.os && $window.cordova) {
          CordovaSvc.then(function(device) {
            var pushNotification, _ref;
            if (pushNotification = (_ref = $window.plugins) != null ? _ref.pushNotification : void 0) {
              switch (DeviceSvc.os.name) {
                case 'ios':
                  $window._onNotifiationAPN = function(e) {
                    if (e.badge !== void 0) {
                      return _this.setBadge(e.badge);
                    }
                  };
                  pushNotification.register(function(token) {
                    return $http.post('token', {
                      token: token,
                      uuid: device.uuid,
                      type: 'APN'
                    }).then(function() {
                      _this.registered = true;
                      return d.resolve(token);
                    }, d.reject);
                  }, function(err) {
                    return d.reject(err);
                  }, {
                    badge: true,
                    sound: true,
                    alert: true,
                    ecb: '_onNotifiationAPN'
                  });
                  break;
                case 'android':
                  $window.onNotification = function(e) {
                    var _ref1;
                    console.log("event " + e.event);
                    switch (e.event) {
                      case 'registered':
                        if (((_ref1 = e.regid) != null ? _ref1.length : void 0) > 0) {
                          console.log("regid: " + e.regid);
                          return $http.post('token', {
                            token: e.regid,
                            uuid: device.uuid,
                            type: 'GCM'
                          }).then(function() {
                            _this.registered = true;
                            return d.resolve(e.regid);
                          }, d.reject);
                        }
                        break;
                      case 'message':
                        if (e.foreground) {
                          return console.log("message: " + e.alert);
                        } else {
                          if (e.coldstart) {
                            return console.log("start on: " + e.alert);
                          } else {
                            return console.log("background: " + e.alert);
                          }
                        }
                        break;
                      case 'error':
                        throw new Error(e.msg);
                    }
                  };
                  ConfigSvc.then(function(config) {
                    pushNotification.register(function(a, b, c) {
                      console.log(a, b, c);
                      return d.resolve();
                    }, function(err) {
                      return d.reject(err);
                    }, {
                      senderID: "" + config.senderID,
                      ecb: 'onNotification'
                    });
                    return config;
                  }, d.reject);
                  break;
                default:
                  d.resolve();
              }
            } else {
              d.resolve();
            }
            return device;
          }, function() {
            return d.resolve();
          });
        } else {
          d.resolve();
        }
        return d.promise;
      },
      unregister: function() {
        var d, _ref, _ref1,
          _this = this;
        d = $q.defer();
        if ((_ref = (_ref1 = DeviceSvc.os) != null ? _ref1.name : void 0) === 'ios' || _ref === 'android') {
          CordovaSvc.then(function(device) {
            var pushNotification, _ref2;
            if (pushNotification = (_ref2 = $window.plugins) != null ? _ref2.pushNotification : void 0) {
              pushNotification.unregister(function() {
                _this.registered = false;
                return $scope.$apply(function() {
                  return d.resolve();
                });
              }, function(err) {
                return $scope.$apply(function() {
                  return d.reject(err);
                });
              });
            } else {
              d.resolve();
            }
            return device;
          }, function() {
            return d.resolve();
          });
        } else {
          d.resolve();
        }
        return d.promise;
      },
      setBadge: function(num) {
        return CordovaSvc.then(function(device) {
          if (device.platform === "iOS") {
            $window.plugins.pushNotification.setApplicationIconBadgeNumber(angular.noop, angular.noop, num);
          } else {
            console.log(device.platform);
          }
          return device;
        });
      }
    });
  }
]);
