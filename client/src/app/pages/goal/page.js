/* Goal setting page controller*/

angular.module('Remente').config([
  '$stateProvider', 'AccessProvider', function($stateProvider, $access) {
    return $stateProvider.state('goal', {
      url: '/goal',
      abstract: true,
      resolve: {
        $resources: [
          'ResourcesSvc', function(ResourcesSvc) {
            return ResourcesSvc.$promise;
          }
        ],
        $goals: [
          'GoalsSvc', function(GoalsSvc) {
            return GoalsSvc;
          }
        ],
        $wheels: [
          '$resources', function($resources) {
            return $resources.wheels.query().$promise;
          }
        ]
      },
      data: {
        rule: $access.user()
      },
      onEnter: [
        '$ionicSideMenuDelegate', function($ionicSideMenuDelegate) {
          return $ionicSideMenuDelegate.canDragContent(false);
        }
      ],
      onExit: [
        '$ionicSideMenuDelegate', function($ionicSideMenuDelegate) {
          return $ionicSideMenuDelegate.canDragContent(true);
        }
      ],
      templateUrl: 'pages/goal/page.tpl',
      controller: [
        '$scope', '$state', '$wheels', function($scope, $state, $wheels) {
          $scope.$wheels = $wheels;
          if ($state.is('goal.wheels') && $wheels.length === 1) {
            $state.go('goal.wheel.intro', {
              wheel: $wheels[0]._id
            });
          }
          $scope.$on('$stateChangeSuccess', function(e, to) {
            if (to.name === 'goal.wheels' && $wheels.length === 1) {
              return $state.go('goal.wheel.intro', {
                wheel: $wheels[0]._id
              });
            }
          });
          return $scope.close = function() {
            if ($scope.app.user.progress) {
              return $state.go('tabs.dashboard.wheel.period', {
                period: 'current'
              });
            } else {
              return $state.go('tabs.dashboard.plan.period', {
                period: 'daily'
              });
            }
          };
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheels', {
      url: '/wheels',
      views: {
        'content': {
          templateUrl: 'pages/goal/wheels.tpl'
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheel', {
      url: '/wheel/:wheel',
      resolve: {
        $wheel: [
          '$resources', '$stateParams', function($resources, $params) {
            return $resources.wheels.get({
              id: $params.wheel
            }).$promise;
          }
        ]
      },
      views: {
        'content': {
          templateUrl: 'pages/goal/assess.tpl',
          controller: [
            '$scope', '$state', '$wheel', '$resources', '$timeout', 'gettext', function($scope, $state, $wheel, $resources, $timeout, gettext) {
              var _finish, _len, _ref;
              if (typeof analytics !== "undefined" && analytics !== null) {
                analytics.track('wheel.start', {
                  name: $wheel.name
                });
              }
              _finish = {};
              _len = $wheel.sectors.length;
              angular.extend($scope, {
                $visible: false,
                $wheel: $wheel,
                $progress: (_ref = $scope.app.user) != null ? _ref.progress : void 0,
                progress: function() {
                  return Math.round((Object.keys(_finish).length + 1) / (_len + 2) * 100);
                },
                titleLabel: function() {
                  return "" + (Object.keys(_finish).length + 1) + "/" + (_len + 2);
                },
                next: function() {
                  var a;
                  _finish[$wheel.sectors[$scope.active].key] = true;
                  if (Object.keys(_finish).length === _len) {
                    a = $scope.wheel.getValues();
                    return $resources.progress.create({
                      wheel: $wheel._id,
                      assessment: a
                    }).$promise.then(function(progress) {
                      _finish = {};
                      $scope.app.user.progress = progress;
                      if (typeof analytics !== "undefined" && analytics !== null) {
                        analytics.track('wheel.assess', {
                          name: $wheel.name
                        });
                      }
                      return $state.go('.finish', {
                        wheel: $wheel._id
                      });
                    });
                  } else {
                    return $scope.active = ($scope.active + 1) % $wheel.sectors.length;
                  }
                }
              });
              return $scope.$watch('wheel', function(wheel) {
                var assessment, key, val, _ref1;
                if (!wheel) {
                  return;
                }
                if (assessment = (_ref1 = $scope.$progress) != null ? _ref1.assessment : void 0) {
                  for (key in assessment) {
                    val = assessment[key];
                    wheel.setValueKey(key, val);
                  }
                }
                $scope.$watch('active', function(active) {
                  wheel.setActive(active);
                  $scope.cat = wheel.getSector(active);
                  return $scope.level = wheel.getValue(active) || 0;
                });
                $scope.active = 0;
                return $timeout(function() {
                  return $scope.$watch('level', function(level) {
                    return wheel.setValue($scope.active, level);
                  });
                });
              });
            }
          ]
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheel.intro', {
      url: '/intro',
      views: {
        'content@goal': {
          templateUrl: 'pages/goal/intro.tpl',
          controller: [
            '$scope', '$wheel', function($scope, $wheel) {
              var _ref;
              return angular.extend($scope, {
                $wheel: $wheel,
                $progress: (_ref = $scope.app.user) != null ? _ref.progress : void 0
              });
            }
          ]
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheel.finish', {
      url: '/finish',
      views: {
        'content@goal': {
          templateUrl: 'pages/goal/finish.tpl',
          controller: [
            '$scope', '$state', '$wheel', function($scope, $state, $wheel) {
              return angular.extend($scope, {
                progress: function() {
                  return 100;
                },
                setGoal: function() {
                  if (typeof analytics !== "undefined" && analytics !== null) {
                    analytics.track('goal.set');
                  }
                  return $state.go('goal.wheel.mode.category', {
                    wheel: $wheel._id,
                    mode: $scope.app.user.advanced ? 'advanced' : 'basic'
                  });
                },
                goCourses: function() {
                  if (typeof analytics !== "undefined" && analytics !== null) {
                    analytics.track('goal.courses');
                  }
                  $scope.app.intro = $scope.app.user.welcome = null;
                  return $state.go('tabs.courses', {
                    category: 'root'
                  });
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
    return $stateProvider.state('goal.wheel.mode', {
      url: '/:mode',
      abstract: true
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheel.mode.category', {
      url: '/category',
      views: {
        'content@goal': {
          templateUrl: function($params) {
            return "pages/goal/" + $params.mode + "/category.tpl";
          },
          controller: [
            '$scope', '$wheel', function($scope, $wheel) {
              var _ref;
              return angular.extend($scope, {
                $visible: false,
                $wheel: $wheel,
                $progress: (_ref = $scope.app.user) != null ? _ref.progress : void 0
              });
            }
          ]
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheel.mode.category.goal', {
      url: '/:sector',
      onEnter: [
        '$rootScope', '$state', function($scope, $state) {
          var _ref;
          if (!((_ref = $scope.app.user.progress) != null ? _ref.assessment : void 0)) {
            return $state.go('goal');
          }
        }
      ],
      views: {
        'content@goal': {
          templateUrl: function($params) {
            return "pages/goal/" + $params.mode + "/goal.tpl";
          },
          controller: [
            '$scope', '$state', '$wheel', '$resources', '$goals', 'gettext', '$filter', function($scope, $state, $wheel, $resources, $goals, gettext, $filter) {
              var sector, value;
              sector = $wheel.sectors[$state.params.sector];
              value = Number($scope.app.user.progress.assessment[sector.key]);
              angular.extend($scope, {
                step: 0,
                $sector: sector,
                $values: [value, value === 10 ? $filter('translate')(gettext("perfect")) : value + 1],
                data: {
                  $date: ''
                },
                mindate: new Date(Date.now() - $scope._tzOffset(Date.now())).toISOString().split('T')[0],
                $goal: {
                  name: '',
                  date: ''
                },
                create: function(state) {
                  var goal;
                  goal = angular.copy($scope.$goal);
                  sector = angular.copy($scope.$sector);
                  delete sector.$$hashKey;
                  delete sector._id;
                  delete sector.desc;
                  delete sector.hints;
                  goal.sector = sector;
                  return $resources.goals.create({}, {
                    name: $scope.$goal.name,
                    date: $scope.$goal.date,
                    sector: sector
                  }, function(goal) {
                    if (typeof analytics !== "undefined" && analytics !== null) {
                      analytics.track('goal.create', {
                        name: goal.name
                      });
                    }
                    return $goals.update('$current').then(function(goals) {
                      $state.go(state, {
                        goal: goal._id,
                        mode: $state.params.mode,
                        wheel: $wheel._id,
                        sector: $state.params.sector
                      });
                      return goals;
                    });
                  });
                }
              });
              return $scope.$watch('data.$date', function(val, old) {
                var d, _today;
                if (val === old) {
                  return;
                }
                _today = new Date();
                _today.setHours(0, 0, 0, 0);
                _today = _today.getTime();
                d = new Date(val).getTime() + $scope._tzOffset();
                if (!val || d < _today) {
                  return $scope.data.$date = old;
                } else {
                  if (typeof analytics !== "undefined" && analytics !== null) {
                    analytics.track('goal.date', {
                      name: $scope.$goal.name
                    });
                  }
                  return $scope.$goal.date = d;
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
    return $stateProvider.state('goal.wheel.mode.category.goal.name', {
      url: '/name',
      templateUrl: function($params) {
        return "pages/goal/" + $params.mode + "/name.tpl";
      },
      controller: [
        '$scope', '$state', function($scope, $state) {
          $scope.next = function() {
            if (typeof analytics !== "undefined" && analytics !== null) {
              analytics.track("goal.name." + ($scope.data.$hint ? 'hint' : 'personal'), {
                name: $scope.$goal.name
              });
            }
            return $state.go('^.date');
          };
          return $scope.$parent.step = 1;
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('goal.wheel.mode.category.goal.date', {
      url: '/date?name&date',
      templateUrl: function($params) {
        return "pages/goal/" + $params.mode + "/date.tpl";
      },
      controller: [
        '$scope', '$state', function($scope, $state) {
          if ($state.params.name) {
            $scope.$goal.name = $state.params.name;
          }
          if ($state.params.date) {
            $scope.data.$date = new Date($scope.$goal.date = Number($state.params.date)).toISOString().split('T')[0];
          }
          $scope.data.$hint = null;
          $state.params.name = $state.params.date = void 0;
          if (!$scope.$goal.name) {
            $state.go('^.name');
          }
          return $scope.$parent.step = 2;
        }
      ]
    });
  }
]);
