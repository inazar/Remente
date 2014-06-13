/* Trainings page controller*/

angular.module('Remente').config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.courses', {
      url: '/courses/:category',
      resolve: {
        $resources: [
          'ResourcesSvc', function(ResourcesSvc) {
            return ResourcesSvc.$promise;
          }
        ],
        $data: [
          '$rootScope', '$resources', '$stateParams', '$q', function($scope, $resources, $stateParams, $q) {
            var d;
            d = $q.defer();
            if (!$stateParams.category) {
              $stateParams.category = $scope.app.category;
            }
            if ($stateParams.category === 'root') {
              $resources.categories.query({}, function(categories) {
                $scope.app.category = 'root';
                return d.resolve({
                  categories: categories
                });
              });
            } else {
              $resources.categories.get({
                id: $stateParams.category
              }, function(category) {
                $scope.app.category = category._id;
                return d.resolve({
                  category: category,
                  categories: category.children
                });
              });
            }
            return d.promise;
          }
        ],
        $course: function() {}
      },
      views: {
        'courses': {
          templateUrl: 'pages/tabs/courses/page.tpl',
          controller: 'coursesCtrl'
        }
      }
    }).state('history', {
      url: '/history',
      resolve: {
        $data: [
          '$resources', '$stateParams', '$q', function($resources, $stateParams, $q) {
            var d;
            d = $q.defer();
            d.resolve({});
            return d.promise;
          }
        ]
      },
      views: {
        'page@': {
          templateUrl: 'pages/tabs/courses/page.tpl',
          controller: 'coursesCtrl'
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.courses.course', {
      url: '/:course',
      resolve: {
        $course: [
          '$resources', '$stateParams', function($resources, $stateParams) {
            return $resources.courses.get({
              id: $stateParams.course
            }).$promise;
          }
        ]
      },
      views: {
        'courses@tabs': {
          templateUrl: 'pages/tabs/courses/course.tpl',
          controller: 'coursesCtrl'
        }
      }
    });
  }
]).controller('coursesCtrl', [
  '$scope', '$state', '$q', '$window', '$timeout', '$data', '$course', '$resources', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate', '$ionicSlideBoxDelegate', '$ionicListDelegate', '$filter', 'gettext', '$baseurl', 'GoalsSvc', function($scope, $state, $q, $window, $timeout, $data, $course, $resources, $ionicModal, $ionicPopup, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicListDelegate, $filter, gettext, $baseurl, GoalsSvc) {
    $scope.data.category = $data.category;
    $scope.data.categories = $data.categories;
    $scope.data.course = $course;
    $scope.$on('$destroy', function() {
      return $scope.data.category = $scope.data.categories = $scope.data.course = void 0;
    });
    $timeout(function() {
      return $scope.$on('$localeChangeSuccess', function(e, id) {
        $scope.app.category = 'root';
        return $timeout(function() {
          return $state.go('tabs.courses', {
            category: 'root'
          }, {
            reload: true
          });
        });
      });
    }, 500);
    $scope.$watch('app.edit', function(edit) {
      $scope.edit["delete"] = false;
      $scope.edit.reorder = false;
      return $scope.edit.open = false;
    });
    $scope.$on('$stateChangeStart', function(e) {
      if ($scope.edit.open) {
        return e.preventDefault();
      }
    });
    return angular.extend($scope, {
      edit: {},
      delMode: function() {
        if ($scope.edit.open) {
          return;
        }
        $scope.edit["delete"] = !$scope.edit["delete"];
        return $scope.edit.reorder = false;
      },
      sortMode: function() {
        if ($scope.edit.open) {
          return;
        }
        $scope.edit.reorder = !$scope.edit.reorder;
        return $scope.edit["delete"] = false;
      },
      editMode: function(obj, field) {
        $ionicListDelegate.$getByHandle(obj.$$name).closeOptionButtons();
        obj["$" + field] = true;
        obj.$open = true;
        $scope.edit["delete"] = false;
        $scope.edit.reorder = false;
        $scope.edit.open = true;
        return $scope.edit.original = obj[field];
      },
      cancel: function(e, obj, field) {
        e.stopPropagation();
        obj[field] = $scope.edit.original;
        $scope.edit.open = false;
        $scope.edit.original = void 0;
        obj["$" + field] = false;
        return obj.$open = false;
      },
      lessonChange: function(i) {
        var scroll;
        scroll = $ionicScrollDelegate.$getByHandle('main');
        scroll.scrollTop();
        return scroll.resize();
      },
      showCategory: function(i) {
        if ($scope.edit.open) {
          return;
        }
        return $state.go('tabs.courses', {
          category: $scope.data.categories[i]._id
        });
      },
      showCourse: function(i) {
        if ($scope.edit.open) {
          return;
        }
        return $state.go('tabs.courses.course', {
          category: $scope.data.category._id,
          course: $scope.data.category.courses[i]._id
        });
      },
      showLesson: function(i) {
        var course, d, lesson;
        if ($scope.edit.open) {
          return;
        }
        course = $scope.data.course;
        lesson = course.lessons[i];
        d = $q.defer();
        if (lesson.tpls.length) {
          $resources.lessons.get({
            id: lesson._id
          }, d.resolve, d.reject);
        } else {
          d.resolve(lesson);
        }
        return d.promise.then(function(lesson) {
          var scope;
          lesson.$$name = 'lessons';
          course.lessons[i] = lesson;
          scope = $scope.$new();
          angular.extend(scope, {
            $lesson: lesson,
            $lessons: course.lessons,
            $i: i
          });
          return $ionicModal.fromTemplateUrl('pages/tabs/courses/lesson.tpl', {
            scope: scope,
            animation: 'slide-left-right'
          }).then(function(modal) {
            var _content;
            _content = $scope.data.course.lessons[i].content;
            scope.$close = function(save) {
              if (save && $scope.app.edit && $scope.device.type === 'desktop') {
                scope.$lesson.$save();
              } else {
                scope.$lesson.content = _content;
              }
              $scope.edit["delete"] = false;
              $scope.edit.reorder = false;
              $scope.edit.open = false;
              return modal.remove();
            };
            return modal.show();
          });
        });
      },
      showContent: function(obj) {
        var scope;
        if ($scope.edit.open) {
          return;
        }
        scope = $scope.$new();
        scope.$obj = obj;
        return $ionicModal.fromTemplateUrl('pages/tabs/courses/content.tpl', {
          scope: scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          var _content;
          _content = obj.content;
          scope.$close = function(save) {
            if (save && $scope.app.edit && $scope.device.type === 'desktop') {
              obj.$save();
            } else {
              obj.content = _content;
            }
            return modal.remove();
          };
          return modal.show();
        });
      },
      icon: function(id) {
        if (id) {
          return "" + $baseurl + "/img/icon/" + id;
        } else {
          return '';
        }
      },
      image: function(id) {
        if (id) {
          return "" + $baseurl + "/img/image/" + id;
        } else {
          return '';
        }
      },
      updateImage: function(icon, obj, field) {
        var image;
        if (image = obj["$" + field]) {
          image.data = icon;
          return image.$save(function() {
            return $ionicScrollDelegate.$getByHandle('main').resize();
          });
        } else {
          return $resources[obj.$$name]["" + field + "s"].create({
            cid: obj._id
          }, {
            data: icon
          }, function(img) {
            obj[field] = img._id;
            obj["$" + field] = new $resources["" + field + "s"](img);
            return $timeout(function() {
              return $ionicScrollDelegate.$getByHandle('main').resize();
            });
          });
        }
      },
      removeImage: function(obj, field) {
        var id;
        if (!obj[field]) {
          return;
        }
        id = obj[field];
        obj["$" + field] = void 0;
        obj[field] = '';
        return obj.$save(function() {
          return $ionicScrollDelegate.$getByHandle('main').resize();
        });
      },
      createCategory: function() {
        var _ref;
        return $resources.categories.create({
          title: 'New Training',
          parent: ((_ref = $scope.data.category) != null ? _ref._id : void 0) || void 0
        }, function(res) {
          return $scope.data.categories.unshift(res);
        });
      },
      createCourse: function(category) {
        return $resources.categories.courses.create({
          cid: category._id
        }, {
          title: 'New Course'
        }, function(course) {
          return category.courses.push(course);
        });
      },
      createLesson: function(course) {
        return $resources.courses.lessons.create({
          cid: course._id
        }, {
          title: 'New Lesson'
        }, function(lesson) {
          return course.lessons.push(lesson);
        });
      },
      createTpl: function(lesson) {
        return $resources.lessons.tpls.create({
          lid: lesson._id
        }, {
          name: 'New Template',
          system: true
        }, function(goal) {
          return lesson.tpls.push(goal);
        });
      },
      createPlan: function(tpl) {
        return $resources.tpls.plans.create({
          gid: tpl._id
        }, {
          title: 'New Plan',
          date: 1,
          system: true
        }, function(plan) {
          return tpl.schedules.push(plan);
        });
      },
      createGoal: function(tpl) {
        var d;
        if ($scope.edit.open) {
          return;
        }
        d = $q.defer();
        if (tpl.schedules.length) {
          $resources.tpls.get({
            id: tpl._id
          }).$promise.then(d.resolve, d.reject);
        } else {
          d.resolve(tpl);
        }
        return d.promise.then(function(tpl) {
          if ($scope.app.edit) {
            return $ionicModal.fromTemplateUrl('pages/tabs/courses/template.tpl', {
              scope: $scope.$new(),
              animation: 'slide-in-up'
            }).then(function(modal) {
              angular.extend(modal.scope, {
                $tpl: tpl,
                setPlan: function(plan, _index) {
                  var key, _plan;
                  if ($scope.edit.open) {
                    return;
                  }
                  _plan = angular.copy(plan);
                  for (key in plan) {
                    if (key.charAt(0) === '$') {
                      delete _plan[key];
                    }
                  }
                  return $ionicModal.fromTemplateUrl('pages/tabs/courses/plan.tpl', {
                    scope: $scope.$new(),
                    animation: 'slide-in-up'
                  }).then(function(modal) {
                    angular.extend(modal.scope, {
                      $plan: plan,
                      input: {
                        $repeat: plan.repeat != null
                      },
                      $close: function(save) {
                        if (save) {
                          return plan.$save(function() {
                            return modal.remove();
                          });
                        } else {
                          tpl.schedules[_index] = new $resources.plans(_plan);
                          return modal.remove();
                        }
                      }
                    });
                    modal.scope.$watch('input.$repeat', function(repeat, old) {
                      var i;
                      if (repeat === void 0 || repeat === old) {
                        return;
                      }
                      modal.scope.$plan.repeat = repeat ? {
                        weeks: 1,
                        days: (function() {
                          var _i, _results;
                          _results = [];
                          for (i = _i = 0; _i <= 6; i = ++_i) {
                            _results.push(false);
                          }
                          return _results;
                        })()
                      } : '';
                      if (!repeat) {
                        return modal.scope.$plan.finish = '';
                      }
                    });
                    return modal.show();
                  });
                }
              });
              modal.scope.$close = function(val) {
                $scope.edit["delete"] = false;
                $scope.edit.reorder = false;
                $scope.edit.open = false;
                return modal.remove();
              };
              return modal.show();
            });
          } else {
            return $ionicPopup.confirm({
              template: tpl.name,
              title: $filter('translate')(gettext('Add new goal?')),
              okText: $filter('translate')(gettext('Ok')),
              cancelText: $filter('translate')(gettext('Cancel'))
            }).then(function(agree) {
              var goal, _toDate;
              if (!agree) {
                return;
              }
              _toDate = function(days) {
                return new Date().setHours(0, 0, 0, 0) + days * 24 * 60 * 60 * 1000;
              };
              goal = angular.copy(tpl);
              goal._id = void 0;
              goal.date = _toDate(Math.max.apply(null, tpl.schedules.map(function(s) {
                if (s.repeat) {
                  return s.finish;
                } else {
                  return s.date;
                }
              })));
              return $resources.goals.create({}, goal, function(goal) {
                var ds, plan, _fn, _i, _len, _ref;
                ds = [];
                _ref = tpl.schedules;
                _fn = function(plan) {
                  var schedule;
                  d = $q.defer();
                  ds.push(d.promise);
                  schedule = angular.copy(plan);
                  schedule._id = void 0;
                  schedule.date = _toDate(schedule.date);
                  if (schedule.repeat) {
                    schedule.finish = _toDate(schedule.finish);
                  }
                  return $resources.schedules.create({
                    gid: goal._id
                  }, schedule, d.resolve, d.reject);
                };
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  plan = _ref[_i];
                  _fn(plan);
                }
                return $q.all(ds).then(function() {
                  GoalsSvc.then(function($goals) {
                    return $goals.update();
                  });
                  return $ionicPopup.alert({
                    template: tpl.name,
                    title: $filter('translate')(gettext('New goal created')),
                    okText: $filter('translate')(gettext('Ok'))
                  });
                }, function() {
                  if (goal != null ? goal._id : void 0) {
                    return goal.$remove();
                  }
                });
              });
            });
          }
        });
      },
      update: function(e, obj, field) {
        e.stopPropagation();
        obj["$" + field] = false;
        obj.$open = false;
        $scope.edit.open = false;
        $scope.edit.original = void 0;
        return obj.$save(function() {
          return $ionicScrollDelegate.$getByHandle('main').resize();
        });
      },
      remove: function(e, obj, i, array) {
        e.stopPropagation();
        return $ionicPopup.confirm({
          template: "" + ($filter('translate')(gettext('Remove'))) + " '" + (obj.title || obj.name) + "'",
          title: $filter('translate')(gettext('Are you sure?')),
          okText: $filter('translate')(gettext('Ok')),
          cancelText: $filter('translate')(gettext('Cancel'))
        }).then(function(agree) {
          if (!agree) {
            return;
          }
          return obj.$remove(function(res) {
            $scope.edit["delete"] = false;
            array.splice(i, 1);
            return $timeout(function() {
              return $ionicScrollDelegate.$getByHandle('main').resize();
            });
          });
        });
      },
      moveItem: function(parent, array, from, to) {
        return $resources[parent.$$name].edit.sort({
          id: parent._id,
          array: array,
          from: from,
          to: to
        }, function(obj) {
          return parent[array] = obj[array];
        }, function() {
          return $state.reload();
        });
      }
    });
  }
]);
