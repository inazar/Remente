/* Home page controller*/

angular.module('Remente').config([
  '$stateProvider', 'AccessProvider', function($stateProvider, $access) {
    return $stateProvider.state('home', {
      url: '/',
      data: {
        rule: $access.loggedIn('tabs.dashboard.plan.period')
      },
      templateUrl: 'pages/home/page.tpl',
      controller: 'homeCtrl'
    });
  }
]).controller('homeCtrl', [
  '$scope', '$state', '$ionicModal', '$q', 'md5', 'gettext', '$filter', 'LoginSvc', function($scope, $state, $ionicModal, $q, md5, gettext, $filter, LoginSvc) {
    var _modal;
    _modal = function(template, scope) {
      return $ionicModal.fromTemplateUrl(template, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        var d;
        d = $q.defer();
        angular.extend($scope, {
          user: {},
          raw: {},
          $modal: modal,
          $dismiss: function() {
            modal.hide();
            modal.remove();
            return d.reject();
          },
          $close: function(res) {
            modal.hide();
            modal.remove();
            return d.resolve(res);
          }
        });
        return {
          open: function() {
            modal.show();
            return modal;
          },
          $promise: d.promise,
          $scope: $scope,
          $dismiss: $scope.$dismiss,
          $close: $scope.$close
        };
      });
    };
    angular.extend($scope, {
      raw: {},
      user: {},
      login: function(form) {
        return _modal('pages/home/login.tpl', $scope.$new(true)).then(function(modal) {
          modal.$scope._submit = function() {
            return console.log('submit');
          };
          modal.$scope._login = function(form) {
            if (modal.$scope.working) {
              return;
            }
            modal.$scope.error = $scope.message = null;
            if (!form.$valid) {
              return;
            }
            modal.$scope.working = true;
            return LoginSvc.login($scope.user).then(function(user) {
              modal.$scope.working = false;
              $scope.app.user = user;
              modal.$close();
              return user;
            }, function(err) {
              modal.$scope.working = false;
              return modal.$scope.error = err.message;
            });
          };
          modal.$scope._forgot = function(emailField) {
            if (modal.$scope.working) {
              return;
            }
            modal.$scope.error = modal.$scope.message = null;
            if (emailField.$valid) {
              modal.$scope.working = true;
              return LoginSvc.forgot($scope.user).then(function() {
                modal.$scope.working = false;
                return modal.$scope.message = $filter('translate')(gettext('Please, check your inbox'));
              }, function(err) {
                modal.$scope.working = false;
                return $scope.error = err.message;
              });
            } else {
              return emailField.$setViewValue($scope.user.email);
            }
          };
          modal.open();
          return modal.$promise.then(function() {
            return $state.go('tabs.dashboard.plan.period');
          });
        });
      },
      register: function() {
        return _modal('pages/home/register.tpl', $scope.$new(true)).then(function(modal) {
          modal.$scope._register = function(form) {
            if (modal.$scope.working) {
              return;
            }
            modal.$scope.error = null;
            if (!form.$valid) {
              return;
            }
            modal.$scope.working = true;
            return LoginSvc.register($scope.user).then(function(user) {
              modal.$scope.working = false;
              $scope.app.user = user;
              modal.$close();
              return user;
            }, function(err) {
              $scope.working = false;
              return $scope.error = err.message;
            });
          };
          modal.open();
          return modal.$promise.then(function() {
            return $state.go('tabs.dashboard.plan.period');
          });
        });
      }
    });
    $scope.$watch('raw.password', function(val) {
      return $scope.user.passwd = md5.createHash($scope.raw.password || '');
    });
    return $scope.$watch('raw.confirm', function(val) {
      return $scope.user.confirm = md5.createHash($scope.raw.confirm || '');
    });
  }
]);
