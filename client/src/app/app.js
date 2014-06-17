var _app, _error, _localStorage, _locale, _retry;

_localStorage = null;

_locale = null;

_error = null;

_retry = null;

_app = {};

angular.module('Remente', ['ng', 'ionic', 'ngCookies', 'ngTouch', 'ngResource', 'ngMd5', 'ui.utils', 'textAngular', 'gettext', 'templates-app', 'templates-common', 'common']).value('AppConfigSvc', {
  name: 'Remente',
  user: false,
  edit: false,
  category: 'root'
}).service('ErrorSvc', [
  '$state', '$q', '$ionicPopup', 'ConfigSvc', '$filter', 'gettext', function($state, $q, $ionicPopup, ConfigSvc, $filter, gettext) {
    return angular.extend(this, {
      report: function(err) {
        return ConfigSvc.then(function(config) {
          $ionicPopup.alert({
            title: config.errors[err.status] || 'Unknown error',
            template: err.data.message || err.data,
            okType: 'button-assertive',
            okText: $filter('translate')(gettext('Ok'))
          });
          return config;
        });
      }
    });
  }
]).service('RetrySvc', [
  '$rootScope', '$http', '$ionicPopup', '$filter', 'gettext', function($scope, $http, $ionicPopup, $filter, gettext) {
    return angular.extend(this, {
      report: function(config) {
        return $ionicPopup.alert({
          title: $filter('translate')(gettext('Network')),
          template: $filter('translate')(gettext('Connection not available or our server experice technical issues')),
          okText: $filter('translate')(gettext('Retry'))
        }).then(function() {
          return $http(config).then(function(res) {
            $scope.app.hideSplash = true;
            return res;
          });
        });
      }
    });
  }
]).service('StorageSvc', [
  '$window', 'CordovaSvc', function($window, CordovaSvc) {
    return CordovaSvc.then(function(device) {
      _localStorage = $window.localStorage;
      return device;
    });
  }
]).config([
  '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;
    return $httpProvider.interceptors.push([
      '$window', '$q', '$rootScope', '$timeout', '$baseurl', function($window, $q, $rootScope, $timeout, $baseurl) {
        return {
          'request': function(config) {
            var cookies, locale;
            $rootScope.showLoading();
            if (!/\.tpl$/.test(config.url)) {
              config.url = "" + $baseurl + "/" + config.url;
            }
            config.silent = !!/\/(config)$/.test(config.url);
            if (_localStorage && !config.headers['Cookie'] && (cookies = _localStorage.getItem('session'))) {
              config.headers['Cookie'] = cookies;
            }
            config.headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();
            if (locale = _locale.get()) {
              config.headers['X-Locale'] = locale;
            }
            return config;
          },
          'response': function(res) {
            var cookies;
            $rootScope.hideLoading();
            if (_localStorage && (cookies = res.headers('set-cookie'))) {
              _localStorage.setItem('session', cookies);
            }
            return res;
          },
          'responseError': function(err) {
            var config, field, _i, _len, _ref, _ref1;
            $rootScope.hideLoading();
            if (err.status === 0) {
              $rootScope.app.hideSplash = false;
              if ((_ref = $window.navigator.splashscreen) != null) {
                _ref.hide();
              }
              config = angular.extend({}, err.config, {
                data: err.config.data,
                url: err.config.url.substr($baseurl.length + 1)
              });
              _ref1 = ['headers', 'transformRequest'];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                field = _ref1[_i];
                delete config.field;
              }
              return _retry.report(config);
            } else {
              if (err.config && !err.config.silent) {
                return _error.report(err).then(function() {
                  return $q.reject(err);
                });
              } else {
                return $q.reject(err);
              }
            }
          }
        };
      }
    ]);
  }
]).config([
  '$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(file|https?|tel|mailto):/);
    return $compileProvider.imgSrcSanitizationWhitelist(/.*\/img\/(icon|image)\/.+/);
  }
]).config([
  '$sceDelegateProvider', function($sceDelegateProvider) {
    return $sceDelegateProvider.resourceUrlWhitelist(['self', '**/img/icon/*', '**/img/image/*']);
  }
]).config([
  '$urlRouterProvider', function($urlRouterProvider) {
    return $urlRouterProvider.otherwise('/');
  }
]).config([
  'LocaleProvider', function(LocaleProvider) {
    return LocaleProvider.useStorage('$localStore');
  }
]).provider('Access', function() {
  var _started;
  _started = false;
  this.loggedIn = function(state, params) {
    if (state == null) {
      state = 'dashboard';
    }
    if (params == null) {
      params = {};
    }
    return function(user) {
      if (user) {
        return {
          to: state,
          params: params
        };
      }
    };
  };
  this.user = function(state, params) {
    if (state == null) {
      state = 'home';
    }
    if (params == null) {
      params = {};
    }
    return function(user) {
      if (!user) {
        return {
          to: state,
          params: params
        };
      }
    };
  };
  this.admin = function(state, params) {
    if (state == null) {
      state = 'home';
    }
    if (params == null) {
      params = {};
    }
    return function(user) {
      if (!(user != null ? user.admin : void 0)) {
        return {
          to: state,
          params: params
        };
      }
    };
  };
  this.root = function(state, params) {
    if (state == null) {
      state = 'home';
    }
    if (params == null) {
      params = {};
    }
    return function(user) {
      if (!(user != null ? user.root : void 0)) {
        return {
          to: state,
          params: params
        };
      }
    };
  };
  this.$get = [
    '$rootScope', '$state', '$timeout', 'ConfigSvc', 'CordovaSvc', function($scope, $state, $timeout, ConfigSvc, CordovaSvc) {
      $scope.$on('$stateChangeStart', function(e, ts, tp) {
        if (_started) {
          return;
        }
        e.preventDefault();
        return $timeout(function() {
          return $state.go(ts.name, tp);
        }, 10);
      });
      return ConfigSvc.then(function(config) {
        CordovaSvc["finally"](function() {
          _started = true;
          return $scope.$on('$stateChangeStart', function(e, to) {
            var result, _ref, _ref1;
            if (!angular.isFunction((_ref = to.data) != null ? _ref.rule : void 0)) {
              return;
            }
            result = to.data.rule((_ref1 = $scope.app) != null ? _ref1.user : void 0);
            if (result && result.to) {
              e.preventDefault();
              return $state.go(result.to, result.params);
            }
          });
        });
        return config;
      });
    }
  ];
  return this;
}).value('Modernizr', Modernizr).controller('rementeAppCtrl', [
  '$scope', '$state', '$ionicPopup', 'LoginSvc', 'GoalsSvc', 'Locale', 'gettext', '$filter', function($scope, $state, $ionicPopup, LoginSvc, GoalsSvc, LocaleSvc, gettext, $filter) {
    angular.extend($scope, {
      setLocale: function(locale) {
        return LocaleSvc.set(locale);
      },
      logout: function() {
        return LoginSvc.logout().then(function() {
          $scope.app.user = null;
          return $state.go('home');
        });
      }
    });
    return GoalsSvc.then(function($goals) {
      var _goalCompletion;
      $scope.$on('remente:user', function(e, user) {
        if (user) {
          return $goals.update();
        } else {
          return $goals.clear();
        }
      });
      _goalCompletion = function(e, task) {
        var goal;
        if (goal = $goals.complete(task)) {
          return $ionicPopup.confirm({
            title: $filter('translate')(gettext('Mark the goal complete?')),
            template: $filter('format')($filter('translate')(gettext("You have accomplished all tasks for goal '$0'")), goal.name),
            okText: $filter('translate')(gettext('Ok')),
            cancelText: $filter('translate')(gettext('Cancel'))
          }).then(function(mark) {
            if (mark) {
              goal.complete = true;
              return goal.$save(function(goal) {
                $scope.$root.$broadcast('remente:goal:complete', goal);
                return $goals.update();
              });
            }
          });
        }
      };
      $scope.$on('remente:task:complete', _goalCompletion);
      $scope.$on('remente:task:remove', _goalCompletion);
      return $scope.$on('remente:goal:complete', function(e, goal) {
        return typeof analytics !== "undefined" && analytics !== null ? analytics.track('goal.complete', {
          name: goal.name
        }) : void 0;
      });
    });
  }
]).run([
  '$rootScope', '$state', '$window', '$document', '$timeout', '$cookieStore', '$sce', '$q', '$ionicModal', '$ionicSideMenuDelegate', '$ionicLoading', 'AppConfigSvc', 'ConfigSvc', 'ErrorSvc', 'RetrySvc', 'DeviceSvc', 'StorageSvc', 'ResourcesSvc', 'LoginSvc', 'CordovaSvc', 'PushSvc', 'Locale', 'Access', 'gettext', 'gettextCatalog', 'exceptionLoggingService', function($scope, $state, $window, $document, $timeout, $cookieStore, $sce, $q, $ionicModal, $ionicSideMenuDelegate, $ionicLoading, AppConfigSvc, ConfigSvc, ErrorSvc, RetrySvc, DeviceSvc, StorageSvc, ResourcesSvc, LoginSvc, CordovaSvc, PushSvc, LocaleSvc, AccessSvc, gettext, gettextCatalog, exceptionLoggingService) {
    var _leadZero, _resizing;
    _leadZero = function(num) {
      if (num < 10) {
        return "0" + num;
      } else {
        return "" + num;
      }
    };
    _error = ErrorSvc;
    _locale = LocaleSvc;
    _retry = RetrySvc;
    angular.extend($scope, {
      _tzOffset: function(date) {
        return (date ? new Date(date) : new Date()).getTimezoneOffset() * 60 * 1000;
      },
      app: AppConfigSvc,
      device: DeviceSvc,
      getContentHtml: function(obj) {
        return $sce.trustAsHtml((obj != null ? obj.content : void 0) || '');
      },
      prevent: function(e) {
        e.preventDefault();
        return e.stopPropagation();
      },
      go: function() {
        $state.go.apply($state, arguments);
        return $ionicSideMenuDelegate.toggleRight(false);
      },
      showLoading: function(delay) {
        return $ionicLoading.show({
          template: '<i class="icon icon-large ion-loading-c"></i>',
          delay: delay || 50
        });
      },
      hideLoading: function() {
        return $ionicLoading.hide();
      },
      settings: function() {
        $ionicModal.fromTemplateUrl('pages/settings.tpl', {
          scope: $scope.$new(),
          animation: 'slide-in-up'
        }).then(function(modal) {
          var _ref, _userSetting;
          angular.extend(modal.scope, {
            $close: function() {
              return modal.remove();
            },
            name: (_ref = $scope.app.user) != null ? _ref.name : void 0,
            locale: $scope.app.locale,
            advanced: $scope.app.user.advanced === 'advanced',
            gettext: function(txt) {
              return gettextCatalog.getString(txt);
            }
          });
          _userSetting = function(user) {
            if (user) {
              $scope.app.user = user;
            }
            return angular.extend(modal.scope, {
              notify: {
                "native": $scope.app.user["native"],
                mail: $scope.app.user.mail,
                task: "" + $scope.app.user.task,
                plan: "" + $scope.app.user.plan
              }
            });
          };
          _userSetting();
          return ConfigSvc.then(function(config) {
            ResourcesSvc.$promise.then(function($resources) {
              var hour, p, period, time, times, _i, _j, _len, _ref1, _saveUser, _watchTime, _watchType;
              times = {};
              for (hour = _i = 6; _i <= 23; hour = ++_i) {
                _ref1 = (function() {
                  var _k, _ref1, _results;
                  _results = [];
                  for (p = _k = 0, _ref1 = Math.floor(60 / config.period) - 1; 0 <= _ref1 ? _k <= _ref1 : _k >= _ref1; p = 0 <= _ref1 ? ++_k : --_k) {
                    _results.push(p);
                  }
                  return _results;
                })();
                for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
                  period = _ref1[_j];
                  time = (hour * 60 + period * config.period) * 60 * 1000;
                  times["" + (time + $scope._tzOffset(time))] = "" + (_leadZero(hour)) + ":" + (_leadZero(period * config.period));
                }
              }
              modal.scope.times = times;
              _saveUser = function(data) {
                return $resources.users.save({
                  id: $scope.app.user._id
                }, data).$promise.then(function(user) {
                  return LoginSvc.set(user).then(_userSetting);
                });
              };
              _watchTime = function(type) {
                return function(val, old) {
                  var obj;
                  if (val === old) {
                    return;
                  }
                  obj = {};
                  obj[type] = Number(val);
                  return _saveUser(obj);
                };
              };
              _watchType = function(type) {
                return function(val, old) {
                  var obj;
                  if (val === old) {
                    return;
                  }
                  obj = {};
                  obj[type] = val;
                  return _saveUser(obj);
                };
              };
              modal.scope.$watch('notify.task', _watchTime('task'));
              modal.scope.$watch('notify.plan', _watchTime('plan'));
              modal.scope.$watch('notify.native', _watchType('native'));
              modal.scope.$watch('notify.mail', _watchType('mail'));
              modal.scope.$watch('name', function(val, old) {
                if (val !== old) {
                  return _saveUser({
                    name: val
                  });
                }
              });
              modal.scope.$watch('advanced', function(advanced) {
                return $scope.app.user.advanced = advanced ? 'advanced' : 'basic';
              });
              modal.scope.$watch('locale', function(locale, old) {
                if (locale && locale !== old) {
                  return LocaleSvc.set(locale);
                }
              });
              modal.show();
              return $resources;
            });
            return config;
          });
        });
        return $ionicSideMenuDelegate.toggleRight(false);
      },
      feedback: function() {
        return $ionicSideMenuDelegate.toggleRight(false);
      }
    });
    $scope.$watch('app.edit', function(edit) {
      return $ionicSideMenuDelegate.toggleRight(false);
    });
    $scope.$watch('app.tab', function(tab) {
      return $timeout(function() {
        if (tab && $state.includes('tabs')) {
          return typeof analytics !== "undefined" && analytics !== null ? analytics.track("tab." + tab) : void 0;
        }
      });
    });
    ConfigSvc.then(function(config) {
      var user;
      if (config.mode === 'development') {
        $window.onerror = function(msg, url, line, col, err) {
          if (msg.indexOf('Script error.') < 0) {
            exceptionLoggingService(err || new Error("" + msg + " at '" + url + "', line: " + line + ", col: " + col));
          }
          return false;
        };
      }
      if (config.segment) {
        if (typeof analytics !== "undefined" && analytics !== null) {
          analytics.load(config.segment);
        }
        if (typeof analytics !== "undefined" && analytics !== null) {
          analytics.page();
        }
      } else {
        $window.analytics = void 0;
      }
      $scope.app.user = config.user;
      LoginSvc.set(config.user).then(function(user) {
        return $scope.app.user = user;
      });
      if ((user = config.user)) {
        if (typeof analytics !== "undefined" && analytics !== null) {
          analytics.identify(user._id, {
            name: user.name || '',
            email: user.email
          });
        }
        if (typeof analytics !== "undefined" && analytics !== null) {
          analytics.track('open');
        }
      }
      LocaleSvc.set(config.locale || 'en');
      $scope.app.locales = config.locales;
      $scope.app.feedback = {};
      $scope.app.feedback.subject = encodeURIComponent(config.feedback.subject);
      $scope.app.feedback.address = config.feedback.address instanceof Array ? config.feedback.address.join(',') : config.feedback.address;
      CordovaSvc.then(function(device) {
        return $scope.app.cordova = device;
      })["finally"](function() {
        var _ref;
        $scope.app.hideSplash = true;
        return (_ref = $window.navigator.splashscreen) != null ? _ref.hide() : void 0;
      });
      return config;
    });
    $scope.dateInputType = 'date';
    CordovaSvc.then(function(device) {
      $scope.dateInputType = !cordova || device.platform === 'iOS' ? 'date' : 'text';
      if (device.platform !== 'iOS' && cordova && $window.datePicker) {
        return $scope.datePicker = function(e, obj, field, minDate, maxDate) {
          var options;
          options = {
            date: obj[field] ? new Date(obj[field]) : new Date(),
            mode: 'date'
          };
          if (minDate) {
            options[minDate] = minDate;
          }
          if (maxDate) {
            options[maxDate] = maxDate;
          }
          datePicker.show(options, function(date) {
            return $timeout(function() {
              e.target.blur();
              if (!date || isNaN(date.getTime())) {
                return;
              }
              obj[field] = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().split('T')[0];
              return $scope.$apply();
            });
          });
          return device;
        };
      }
    });
    $scope.$on('$localeChangeSuccess', function(e, id) {
      if (id !== $scope.app.locale) {
        $scope.app.locale = id;
        return typeof analytics !== "undefined" && analytics !== null ? analytics.track('locale', {
          locale: id
        }) : void 0;
      }
    });
    $scope.$on('$stateChangeError', function(e, ts, tp, fs, fp, err) {
      return console.error('$state:', err);
    });
    _resizing = null;
    angular.element($window).bind('resize', function() {
      if (_resizing) {
        $timeout.cancel(_resizing);
      }
      return _resizing = $timeout(function() {
        $scope.$broadcast('$resize');
        if (!$scope.$root.$$phase) {
          return $scope.$apply();
        }
      }, 300);
    });
    $scope.$watch('app.user', function(user) {
      return $scope.$root.$broadcast('remente:user', user);
    });
    $scope.$on('$destroy', function() {
      return angular.element($window).unbind('resize');
    });
  }
]);
