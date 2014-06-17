/* Steps setting page controller*/

angular.module('Remente').config([
  '$stateProvider', 'AccessProvider', function($stateProvider, $access) {
    return $stateProvider.state('steps', {
      url: '/steps',
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
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task', {
      url: '/:goal',
      abstract: true
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task.mode', {
      url: '/:mode',
      abstract: true,
      resolve: {
        $goal: [
          '$goals', '$stateParams', function($goals, $params) {
            return $goals.get($params.goal);
          }
        ]
      },
      views: {
        '@': {
          templateUrl: 'pages/steps/page.tpl',
          controller: [
            '$scope', '$state', '$q', '$goal', '$goals', '$resources', '$ionicPopup', '$ionicListDelegate', '$filter', 'gettext', function($scope, $state, $q, $goal, $goals, $resources, $ionicPopup, $ionicListDelegate, $filter, gettext) {
              $scope.$on('remente:goal:complete', function(e, goal) {
                return $state.go('tabs.goals.current');
              });
              angular.extend($scope, {
                goto: function(page) {
                  return $state.go("^." + page);
                },
                dateNow: new Date().setHours(0, 0, 0, 0),
                steps: 5,
                data: {
                  $goal: $goal
                },
                opts: {
                  complete: function(task) {
                    return $resources.tasks.save({
                      id: task._id
                    }, {
                      complete: task.complete
                    }, function(res) {
                      task.complete = res.complete;
                      if (typeof analytics !== "undefined" && analytics !== null) {
                        analytics.track("task." + (task.complete ? '' : 'un') + "complete", {
                          name: task.title
                        });
                      }
                      return $scope.$root.$broadcast('remente:task:complete', task);
                    });
                  },
                  remove: function(task, i) {
                    var goal;
                    goal = $scope.data.$goal;
                    if (goal.$tasks.length > 1) {
                      return $resources.tasks.remove({
                        id: task._id
                      }, function() {
                        var schedule, t, _i, _j, _len, _len1, _ref, _ref1;
                        _ref = task.$goal.schedules;
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                          schedule = _ref[_i];
                          if (schedule._id === task.$schedule) {
                            _ref1 = schedule.tasks;
                            for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
                              t = _ref1[i];
                              if (task._id === t._id) {
                                schedule.tasks.splice(i, 1);
                                break;
                              }
                            }
                            break;
                          }
                        }
                        if (typeof analytics !== "undefined" && analytics !== null) {
                          analytics.track("task.remove", {
                            name: task.title
                          });
                        }
                        $scope.$root.$broadcast('remente:task:remove', task);
                        return $goals.values();
                      });
                    } else {
                      return $ionicPopup.confirm({
                        title: $filter('translate')(gettext('Remove goal?')),
                        template: goal.name,
                        okText: $filter('translate')(gettext('Ok')),
                        cancelText: $filter('translate')(gettext('Cancel'))
                      }).then(function(agree) {
                        if (agree) {
                          $resources.goals.remove({
                            id: goal._id
                          }, function() {
                            return $goals.update('$current').then(function(goals) {
                              $state.go('tabs.goals.current');
                              return goals;
                            });
                          });
                        } else {
                          $ionicListDelegate.closeOptionButtons();
                        }
                        return agree;
                      });
                    }
                  }
                }
              });
              $scope.data.$goal.$date = new Date($goal.date - $scope._tzOffset($goal.date)).toISOString().split('T')[0];
              return $scope.$watch('data.$goal.$date', function(val, old) {
                var d, _today;
                if (val === old) {
                  return;
                }
                if (!val) {
                  return $scope.data.$goal.$date = old;
                }
                _today = new Date();
                _today.setHours(0, 0, 0, 0);
                _today = _today.getTime();
                val = new Date(val).getTime();
                d = val - $scope._tzOffset(val);
                if (d < _today) {
                  return $scope.data.$goal.$date = old;
                }
                if (d !== $scope.data.$goal.date) {
                  $scope.data.$goal.date = d;
                  return $resources.goals.save({}, {
                    _id: $scope.data.$goal._id,
                    date: d
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
    return $stateProvider.state('steps.task.mode.timeline', {
      url: '/timeline',
      templateUrl: function($params) {
        return "pages/steps/" + $params.mode + "/timeline.tpl";
      },
      controller: [
        '$scope', '$goal', function($scope, $goal) {
          if (typeof analytics !== "undefined" && analytics !== null) {
            analytics.track('goal.open', {
              name: $goal.name
            });
          }
          return $scope.$parent.steps = 3;
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task.mode.add', {
      url: '/add/:wheel/:sector',
      templateUrl: function($params) {
        return "pages/steps/" + $params.mode + "/add.tpl";
      },
      controller: [
        '$scope', '$state', '$ionicScrollDelegate', '$ionicModal', '$ionicPopup', '$ionicActionSheet', '$resources', '$goals', 'gettext', '$filter', function($scope, $state, $ionicScrollDelegate, $ionicModal, $ionicPopup, $ionicActionSheet, $resources, $goals, gettext, $filter) {
          var _dateWatch, _scroll;
          angular.extend($scope, {
            input: {
              $repeat: false,
              $date: ''
            },
            mindate: new Date(Date.now() - $scope._tzOffset(Date.now())).toISOString().split('T')[0],
            maxdate: new Date($scope.data.$goal.date - $scope._tzOffset($scope.data.$goal.date)).toISOString().split('T')[0],
            backToGoal: function() {
              return $goals.get($state.params.goal).then(function(goal) {
                if (goal.$tasks.length || !$state.params.wheel) {
                  return $state.go('steps.task.mode.timeline');
                } else {
                  return goal.$remove(function() {
                    if (typeof analytics !== "undefined" && analytics !== null) {
                      analytics.track('goal.remove', {
                        name: goal.name
                      });
                    }
                    return $goals.update('$current').then(function() {
                      return $state.go('goal.wheel.mode.category.goal.date', {
                        wheel: $state.params.wheel,
                        sector: $state.params.sector,
                        name: goal.name,
                        date: goal.date,
                        mode: $scope.app.user.advanced ? 'advanced' : 'basic'
                      });
                    });
                  });
                }
              });
            },
            $schedule: {
              title: ''
            },
            create: function(state) {
              if ($scope.$schedule.repeat && !$scope.$schedule.finish) {
                $scope.$schedule.finish = $scope.data.$goal.date;
              }
              return $resources.schedules.create({
                gid: $scope.data.$goal._id
              }, $scope.$schedule, function(schedule) {
                if (typeof analytics !== "undefined" && analytics !== null) {
                  analytics.track('step.create', $scope.$schedule);
                }
                $scope.data.$goal.schedules.push(schedule);
                $goals.values();
                $scope.$schedule = {
                  title: ''
                };
                if ($scope.app.user.advanced) {
                  return $state.go(state);
                } else {
                  return $ionicActionSheet.show({
                    titleText: $filter('translate')(gettext('Do you see that you are reaching your goal by adding this step?')),
                    buttons: [
                      {
                        text: $filter('translate')(gettext('No, add steps'))
                      }, {
                        text: $filter('translate')(gettext('Yes, finish'))
                      }
                    ],
                    buttonClicked: function(res) {
                      if (res) {
                        $scope.input.$date = '';
                        $scope.$schedule = {
                          title: ''
                        };
                        $scope.input.$repeat = false;
                        $state.go(state);
                      } else {
                        $scope.input.$date = '';
                        $scope.$schedule = {
                          title: ''
                        };
                        $scope.input.$repeat = false;
                        $state.go('^.name');
                      }
                      return true;
                    }
                  });
                }
              });
            }
          });
          _dateWatch = function(field, scope) {
            return function(val, old) {
              var d, _today;
              if (!val || val === old) {
                return;
              }
              _today = new Date();
              _today.setHours(0, 0, 0, 0);
              _today = _today.getTime();
              d = new Date(val).getTime() + $scope._tzOffset();
              if (d < _today || d > $scope.data.$goal.date) {
                return scope.input["$" + field] = old;
              }
              if (d !== $scope.$schedule[field]) {
                $scope.$schedule[field] = d;
                return typeof analytics !== "undefined" && analytics !== null ? analytics.track("step." + field, $scope.$schedule) : void 0;
              }
            };
          };
          $scope.$watch('input.$date', _dateWatch('date', $scope));
          _scroll = $ionicScrollDelegate.$getByHandle('main');
          return $scope.$watch('input.$repeat', function(repeat) {
            var i;
            $scope.$schedule.repeat = repeat ? {
              weeks: 1,
              days: (function() {
                var _i, _results;
                _results = [];
                for (i = _i = 0; _i <= 6; i = ++_i) {
                  _results.push(false);
                }
                return _results;
              })()
            } : void 0;
            if (repeat) {
              return $ionicModal.fromTemplateUrl('pages/steps/repeat.tpl', {
                scope: $scope.$new(),
                animation: 'slide-in-up'
              }).then(function(modal) {
                modal.scope.input.$finish = $scope.maxdate;
                modal.scope.$watch('input.$finish', _dateWatch('finish', modal.scope));
                modal.scope.$close = function(val) {
                  var d, test, _i, _len, _ref;
                  if (val) {
                    test = false;
                    _ref = $scope.$schedule.repeat.days;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                      d = _ref[_i];
                      test = d || test;
                    }
                    if (!test) {
                      $scope.input.$repeat = false;
                    }
                  } else {
                    $scope.input.$repeat = false;
                  }
                  if ($scope.$repeat) {
                    if (typeof analytics !== "undefined" && analytics !== null) {
                      analytics.track('step.repeat', $scope.$schedule);
                    }
                  }
                  return modal.remove();
                };
                return modal.show();
              });
            }
          });
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task.mode.add.name', {
      url: '/name',
      templateUrl: function($params) {
        return "pages/steps/" + $params.mode + "/name.tpl";
      },
      controller: [
        '$scope', '$state', function($scope, $state) {
          $scope.next = function() {
            if (typeof analytics !== "undefined" && analytics !== null) {
              analytics.track('step.name', {
                name: $scope.$schedule.title
              });
            }
            return $state.go('^.date');
          };
          return $scope.$parent.step = $scope.steps === 3 ? 1 : 3;
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task.mode.add.date', {
      url: '/date',
      templateUrl: function($params) {
        return "pages/steps/" + $params.mode + "/date.tpl";
      },
      controller: [
        '$scope', '$state', function($scope, $state) {
          if (!$scope.$schedule.title) {
            $state.go('^.name');
          }
          return $scope.$parent.step = $scope.steps === 3 ? 2 : 4;
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task.mode.add.finish', {
      url: '/finish',
      templateUrl: function($params) {
        return "pages/steps/" + $params.mode + "/finish.tpl";
      },
      controller: [
        '$scope', function($scope) {
          return $scope.$parent.step = $scope.steps === 3 ? 3 : 5;
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('steps.task.mode.finish', {
      url: '/finish',
      templateUrl: function($params) {
        return "pages/steps/" + $params.mode + "/finish.tpl";
      }
    });
  }
]);
