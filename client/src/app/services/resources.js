/* Resources service*/

angular.module('Remente').factory('ResourcesSvc', [
  '$rootScope', '$resource', '$q', 'ConfigSvc', function($scope, $resource, $q, ConfigSvc) {
    var d, resources;
    d = $q.defer();
    resources = {
      $promise: d.promise,
      $resolved: false
    };
    ConfigSvc.then(function(config) {
      var routes, _fieldMap, _transformGoalResponse, _transformQueryResponse, _transformRequest, _transformResponse, _userId;
      resources.config = config;
      routes = config.routes;
      _userId = function() {
        var _ref;
        return (_ref = $scope.app.user) != null ? _ref._id : void 0;
      };
      _transformRequest = function(dels, flats, timestamps) {
        return function(data, headers) {
          var field, key, val, _i, _j, _k, _len, _len1, _len2, _ref;
          data = angular.extend({}, data);
          for (key in data) {
            val = data[key];
            if (key.charAt(0) === '$') {
              delete data[key];
            }
          }
          if (timestamps != null ? timestamps.length : void 0) {
            for (_i = 0, _len = timestamps.length; _i < _len; _i++) {
              field = timestamps[_i];
              if (data[field]) {
                data[field] = new Date(data[field]).getTime() - $scope._tzOffset(data[field]);
              }
            }
          }
          _ref = ['created', 'updated', '__v'].concat(dels);
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            field = _ref[_j];
            delete data[field];
          }
          for (_k = 0, _len2 = flats.length; _k < _len2; _k++) {
            field = flats[_k];
            if (data[field]) {
              data[field] = data[field].map(function(val) {
                if (val._id) {
                  return val._id;
                } else {
                  return val;
                }
              });
            }
          }
          return JSON.stringify(data);
        };
      };
      _transformQueryResponse = function(name, children, timestamps) {
        return function(res) {
          return res.data.map(function(obj) {
            return _transformResponse(name, children, timestamps)({
              data: obj
            });
          });
        };
      };
      _fieldMap = {
        plans: 'schedules'
      };
      _transformResponse = function(name, children, timestamps) {
        return function(res) {
          var child, childName, field, obj, _i, _j, _len, _len1;
          obj = new resources[name](res.data);
          obj.$$name = name;
          if (timestamps) {
            for (_i = 0, _len = timestamps.length; _i < _len; _i++) {
              field = timestamps[_i];
              if (obj[field]) {
                obj[field] = obj[field] + $scope._tzOffset(obj[field]);
              }
            }
          }
          for (_j = 0, _len1 = children.length; _j < _len1; _j++) {
            child = children[_j];
            childName = _fieldMap[child] || child;
            obj[childName] = obj[childName].map(function(c) {
              var n, _k, _len2;
              n = child === 'children' ? name : child;
              if (timestamps) {
                for (_k = 0, _len2 = timestamps.length; _k < _len2; _k++) {
                  field = timestamps[_k];
                  if (c[field]) {
                    c[field] = c[field] + $scope._tzOffset(c[field]);
                  }
                }
              }
              c = new resources[n](c);
              c.$$name = n;
              return c;
            });
          }
          if (obj.icon) {
            obj.$icon = new resources.icons({
              _id: obj.icon
            });
          }
          if (obj.image) {
            obj.$image = new resources.images({
              _id: obj.image
            });
          }
          return obj;
        };
      };
      resources.icons = $resource("" + routes.api + "/icons/:id.json", {
        id: '@_id'
      }, {
        'save': {
          method: 'PUT'
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.images = $resource("" + routes.api + "/images/:id.json", {
        id: '@_id'
      }, {
        'save': {
          method: 'PUT'
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.categories = $resource("" + routes.api + "/categories/:id.json", {
        id: '@_id'
      }, {
        'get': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('categories', ['courses', 'children'])
          }
        },
        'create': {
          method: 'PUT',
          params: {
            id: 'new'
          },
          interceptor: {
            response: _transformResponse('categories', ['courses', 'children'])
          }
        },
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest([], ['children', 'business', 'courses']),
          interceptor: {
            response: _transformResponse('categories', ['courses', 'children'])
          }
        },
        'query': {
          method: 'GET',
          isArray: true,
          interceptor: {
            response: _transformQueryResponse('categories', ['courses', 'children'])
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.categories.edit = $resource("" + routes.api + "/categories/:id/edit.json", {
        id: '@_id'
      }, {
        'sort': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('categories', ['courses', 'children'])
          }
        }
      });
      resources.categories.courses = $resource("" + routes.api + "/categories/:cid/courses.json", {}, {
        'query': {
          method: 'GET',
          isArray: true,
          interceptor: {
            response: _transformQueryResponse('courses', ['lessons'])
          }
        },
        'create': {
          method: 'POST'
        }
      });
      resources.categories.images = $resource("" + routes.api + "/categories/:cid/images.json", {}, {
        'create': {
          method: 'POST'
        }
      });
      resources.categories.icons = $resource("" + routes.api + "/categories/:cid/icons.json", {}, {
        'create': {
          method: 'POST'
        }
      });
      resources.courses = $resource("" + routes.api + "/courses/:id.json", {
        id: '@_id'
      }, {
        'get': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('courses', ['lessons'])
          }
        },
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest([], ['lessons', 'business', 'tags']),
          interceptor: {
            response: _transformResponse('courses', ['lessons'])
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.courses.edit = $resource("" + routes.api + "/courses/:id/edit.json", {
        id: '@_id'
      }, {
        'sort': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('courses', ['lessons'])
          }
        }
      });
      resources.courses.lessons = $resource("" + routes.api + "/courses/:cid/lessons.json", {}, {
        'query': {
          method: 'GET',
          isArray: true,
          interceptor: {
            response: _transformQueryResponse('lessons', ['goals'])
          }
        },
        'create': {
          method: 'POST',
          interceptor: {
            response: _transformResponse('lessons', ['tpls'])
          }
        }
      });
      resources.courses.tags = $resource("" + routes.api + "/courses/:id/tags.json", {
        tag: '@_id'
      }, {
        'query': {
          method: 'GET',
          isArray: true
        },
        'save': {
          method: 'PUT'
        }
      });
      resources.courses.images = $resource("" + routes.api + "/courses/:cid/images.json", {}, {
        'create': {
          method: 'POST'
        }
      });
      resources.courses.icons = $resource("" + routes.api + "/courses/:cid/icons.json", {}, {
        'create': {
          method: 'POST'
        }
      });
      resources.lessons = $resource("" + routes.api + "/lessons/:id.json", {
        id: '@_id'
      }, {
        'get': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('lessons', ['tpls'])
          }
        },
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest([], ['business']),
          interceptor: {
            response: _transformResponse('lessons', ['tpls'])
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.lessons.edit = $resource("" + routes.api + "/lessons/:id/edit.json", {
        id: '@_id'
      }, {
        'sort': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('lessons', ['tpls'])
          }
        }
      });
      resources.lessons.tpls = $resource("" + routes.api + "/lessons/:lid/goals.json", {}, {
        'create': {
          method: 'POST',
          transformRequest: _transformRequest(['user', 'schedules'], [], []),
          interceptor: {
            response: _transformResponse('tpls', ['schedules'])
          }
        }
      });
      resources.tpls = $resource("" + routes.api + "/goals/:id.json", {
        id: '@_id'
      }, {
        'get': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('tpls', ['plans'])
          }
        },
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest(['user'], ['plans'], []),
          interceptor: {
            response: _transformResponse('tpls', ['plans'])
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.tpls.edit = $resource("" + routes.api + "/goals/:id/edit.json", {
        id: '@_id'
      }, {
        'sort': {
          method: 'GET',
          interceptor: {
            response: _transformResponse('tpls', ['plans'])
          }
        }
      });
      resources.tpls.plans = $resource("" + routes.api + "/goals/:gid/schedules.json", {}, {
        'create': {
          method: 'POST',
          transformRequest: _transformRequest(['user', 'tasks'], [], []),
          interceptor: {
            response: _transformResponse('plans', [])
          }
        }
      });
      resources.plans = $resource("" + routes.api + "/schedules/:id.json", {
        id: '@_id'
      }, {
        'query': {
          method: 'GET',
          isArray: true,
          interceptor: {
            response: _transformResponse('plans', [])
          }
        },
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest(['user', 'tasks'], [], []),
          interceptor: {
            response: _transformResponse('plans', [])
          }
        },
        'create': {
          method: 'POST',
          transformRequest: _transformRequest(['user', 'tasks'], [], []),
          interceptor: {
            response: _transformResponse('plans', [])
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.lessons.icons = $resource("" + routes.api + "/lessons/:lid/icons.json", {}, {
        'create': {
          method: 'POST'
        }
      });
      resources.lessons.images = $resource("" + routes.api + "/lessons/:lid/images.json", {}, {
        'create': {
          method: 'POST'
        }
      });
      resources.tags = $resource("" + routes.api + "/tags/:id.json", {
        id: '@_id'
      }, {
        'create': {
          method: 'PUT',
          params: {
            id: 'new'
          }
        },
        'query': {
          method: 'GET',
          isArray: true
        },
        'remove': {
          method: 'DELETE'
        }
      });
      _transformGoalResponse = function(res) {
        var obj;
        obj = new resources.goals(res.data);
        obj.$$name = 'goals';
        if (obj.date) {
          obj.date = obj.date + $scope._tzOffset(obj.date);
        }
        obj.schedules = obj.schedules.map(function(schedule) {
          if (schedule.date) {
            schedule.date = schedule.date + $scope._tzOffset(schedule.date);
          }
          if (schedule.finish) {
            schedule.finish = schedule.finish + $scope._tzOffset(schedule.finish);
          }
          schedule.tasks = schedule.tasks.map(function(task) {
            var tdate;
            if (task.date) {
              tdate = new Date(new Date(task.date).toISOString().split('T')[0]).getTime();
              task.date = task.date + $scope._tzOffset(tdate);
            }
            return new resources.tasks(task);
          });
          return new resources.schedules(schedule);
        });
        return obj;
      };
      resources.goals = $resource("" + routes.api + "/users/:uid/goals/:id.json", {
        id: '@_id',
        uid: _userId
      }, {
        'get': {
          method: 'GET',
          interceptor: {
            response: _transformGoalResponse
          }
        },
        'create': {
          method: 'PUT',
          params: {
            id: 'new'
          },
          transformRequest: _transformRequest(['user', 'schedules'], [], ['date']),
          interceptor: {
            response: _transformGoalResponse
          }
        },
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest(['user'], ['schedules'], ['date']),
          interceptor: {
            response: _transformGoalResponse
          }
        },
        'query': {
          method: 'GET',
          isArray: true,
          interceptor: {
            response: function(res) {
              return res.data.map(function(obj) {
                return _transformGoalResponse({
                  data: obj
                });
              });
            }
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.schedules = $resource("" + routes.api + "/users/:uid/goals/:gid/schedules/:id.json", {
        id: '@_id',
        uid: _userId
      }, {
        'query': {
          method: 'GET',
          isArray: true,
          interceptor: {
            response: _transformResponse('schedules', ['tasks'], ['date', 'finish'])
          }
        },
        'create': {
          method: 'POST',
          transformRequest: _transformRequest(['user'], [], ['date', 'finish']),
          interceptor: {
            response: _transformResponse('schedules', ['tasks'], ['date', 'finish'])
          }
        }
      });
      resources.tasks = $resource("" + routes.api + "/users/:uid/tasks/:id.json", {
        id: '@_id',
        uid: _userId
      }, {
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest(['title', 'date', 'fullday'], []),
          interceptor: {
            response: _transformResponse('tasks', [], ['date'])
          }
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.wheels = $resource("" + routes.api + "/wheels/:id.json", {
        id: '@_id'
      }, {
        'get': {
          method: 'GET'
        },
        'create': {
          method: 'PUT',
          params: {
            id: 'new'
          }
        },
        'save': {
          method: 'PUT'
        },
        'query': {
          method: 'GET',
          isArray: true
        },
        'remove': {
          method: 'DELETE'
        }
      });
      resources.progress = $resource("" + routes.api + "/users/:uid/progresses/:id.json", {
        id: '@_id',
        uid: _userId
      }, {
        'create': {
          method: 'POST'
        }
      });
      resources.progresses = $resource("" + routes.api + "/users/:uid/progresses/:id.json", {
        id: '@_id',
        uid: _userId
      }, {
        'query': {
          method: 'GET',
          isArray: true,
          transformRequest: function(data, headersGetter) {
            var headers;
            headers = headersGetter();
            headers['range-unit'] = 'progresses';
            headers['range'] = '1-5';
            headers['sort'] = '-created';
            return data;
          }
        }
      });
      resources.users = $resource("" + routes.api + "/users/:id.json", {
        id: '@_id'
      }, {
        'save': {
          method: 'PUT',
          transformRequest: _transformRequest(['progress'], [], ['task', 'plan'])
        }
      });
      resources.$resolved = true;
      d.resolve(resources);
      return config;
    });
    return resources;
  }
]);
