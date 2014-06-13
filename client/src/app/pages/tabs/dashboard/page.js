/* Dashboard page controller*/

angular.module('Remente').config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.dashboard', {
      url: '/dashboard',
      abstract: true,
      views: {
        'dashboard': {
          templateUrl: 'pages/tabs/dashboard/page.tpl'
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.dashboard.wheel', {
      url: '/wheel',
      abstract: true,
      resolve: {
        $wheel: [
          '$resources', '$rootScope', '$stateParams', function($resources, $scope, $params) {
            var _ref, _ref1;
            if ((_ref = $scope.app.user) != null ? _ref.progress : void 0) {
              return $resources.wheels.get({
                id: (_ref1 = $scope.app.user) != null ? _ref1.progress.wheel : void 0
              }).$promise;
            } else {
              return {};
            }
          }
        ],
        $archive: [
          '$resources', '$filter', function($resources, $filter) {
            return $resources.progresses.query({
              wheel: '$exists'
            }).$promise.then(function(archive) {
              var p, _i, _len;
              for (_i = 0, _len = archive.length; _i < _len; _i++) {
                p = archive[_i];
                p.label = $filter('date')(p.created, 'longDate');
              }
              return archive;
            });
          }
        ]
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.dashboard.wheel.period', {
      url: '/:period',
      onEnter: [
        '$state', '$stateParams', function($state, $stateParams) {
          var _ref;
          if (!((_ref = $stateParams.period) === 'current' || _ref === 'archive')) {
            return $state.go('tabs.dashboard.wheel.period', {
              period: 'current'
            });
          }
        }
      ],
      views: {
        'content@tabs.dashboard': {
          templateUrl: 'pages/tabs/dashboard/wheel.tpl',
          controller: [
            '$scope', '$state', '$wheel', '$archive', function($scope, $state, $wheel, $archive) {
              var _ref;
              angular.extend($scope, {
                $tab: $state.params.period,
                $wheel: $wheel,
                $archive: $archive,
                history: {
                  wheel: $state.params.period === 'archive' ? '0' : void 0
                },
                assessment: $state.params.period === 'archive' ? $archive[0].assessment : (_ref = $scope.app.user.progress) != null ? _ref.assessment : void 0
              });
              $scope.$on('$stateChangeSuccess', function(e, ts, tp, fs, fp) {
                return typeof analytics !== "undefined" && analytics !== null ? analytics.track("wheel." + tp.period) : void 0;
              });
              return $scope.$watch('history.wheel', function(i, old) {
                if (!i || i === old) {
                  return;
                }
                return $scope.assessment = $archive[Number(i)].assessment;
              });
            }
          ]
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.dashboard.plan', {
      url: '/plan',
      abstract: true,
      views: {
        'content@tabs.dashboard': {
          templateUrl: 'pages/tabs/dashboard/plan.tpl'
        },
        'intro@tabs': {
          templateUrl: 'pages/tabs/dashboard/intro.tpl',
          controller: [
            '$scope', '$state', function($scope, $state) {
              return angular.extend($scope, {
                step: $scope.app.intro || 0,
                steps: [0, 1, 2, 3, 4, 5, 6],
                next: function() {
                  return $scope.step += 1;
                },
                wheel: function() {
                  $scope.app.intro = $scope.step + 1;
                  return $state.go('goal.wheels');
                },
                addGoal: function() {
                  return $scope.wheel();
                },
                done: function() {
                  $scope.app.intro = $scope.app.user.welcome = null;
                  if (typeof analytics !== "undefined" && analytics !== null) {
                    analytics.track('onboarding');
                  }
                  return $state.reload();
                }
              });
            }
          ]
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.dashboard.plan.period', {
      url: '/:period',
      resolve: {
        $goals: [
          'GoalsSvc', function(GoalsSvc) {
            return GoalsSvc;
          }
        ]
      },
      onEnter: [
        '$state', '$stateParams', function($state, $params) {
          var _ref;
          if (!((_ref = $params.period) === 'daily' || _ref === 'weekly')) {
            return $state.go('tabs.dashboard.plan.period', {
              period: 'daily'
            });
          }
        }
      ],
      templateUrl: 'pages/tabs/dashboard/period.tpl',
      controller: [
        '$scope', '$state', '$resources', '$goals', 'gettext', '$filter', function($scope, $state, $resources, $goals, gettext, $filter) {
          var _today;
          $scope.$tasks = "$" + $state.params.period;
          $scope.complete = function(task) {
            return $resources.tasks.save({
              id: task._id
            }, {
              complete: task.complete
            }, function(res) {
              task.complete = res.complete;
              if (typeof analytics !== "undefined" && analytics !== null) {
                analytics.track("plan." + (task.complete ? '' : 'un') + "complete", {
                  name: task.title
                });
              }
              $goals.values();
              return $scope.$root.$broadcast('remente:task:complete', task);
            });
          };
          $scope.$on('$stateChangeSuccess', function(e, ts, tp, fs, fp) {
            if (ts === fs) {
              return typeof analytics !== "undefined" && analytics !== null ? analytics.track("plan." + tp.period) : void 0;
            }
          });
          if ($scope.app.user.welcome && !$scope.app.intro) {
            _today = new Date().setHours(0, 0, 0, 0);
            return $resources.goals.create({}, {
              name: $filter('translate')(gettext('Set up my first goal')),
              date: _today,
              sector: {
                key: 'setup',
                title: $filter('translate')(gettext('Setup')),
                desc: $filter('translate')(gettext("Make steps necessary to start using Remente app.")),
                icon: '◎',
                color: '#F55748'
              }
            }, function(goal) {
              return $resources.schedules.create({
                gid: goal._id
              }, {
                title: $filter('translate')(gettext('Create your first wheel')),
                date: _today
              }, function(schedule) {
                return $resources.schedules.create({
                  gid: goal._id
                }, {
                  title: $filter('translate')(gettext('Create your first goal')),
                  date: _today
                }, function(schedule) {
                  return $goals.update();
                });
              });
            });
          }
        }
      ]
    });
  }
]);
