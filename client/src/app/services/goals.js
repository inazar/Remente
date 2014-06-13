/* Goals service*/

var Complete, Goals;

angular.module('Remente').service('GoalsSvc', [
  'ResourcesSvc', '$q', '$window', function(ResourcesSvc, $q, $window) {
    var d;
    d = $q.defer();
    ResourcesSvc.$promise.then(function($resources) {
      return d.resolve(new Goals($resources.goals, $q, $window, {
        $current: false,
        $complete: true
      }));
    }, d.reject);
    return d.promise;
  }
]);

Goals = (function() {
  var _q, _win;

  _q = null;

  _win = null;

  function Goals(resource, $q, $window, map) {
    var complete, key;
    _q = $q;
    _win = $window;
    this.updated = false;
    this.keys = Object.keys(map);
    for (key in map) {
      complete = map[key];
      this[key] = new Complete(complete, resource);
    }
  }

  Goals.prototype.update = function(key) {
    var _this = this;
    return _q.all(key ? [this[key].update()] : (function() {
      var _i, _len, _ref, _results;
      _ref = this.keys;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(this[key].update());
      }
      return _results;
    }).call(this)).then(function(res) {
      _this.updated = true;
      _this.values();
      return res;
    });
  };

  Goals.prototype.values = function() {
    var dfinish, dstart, goal, schedule, task, tdate, wfinish, wstart, _badge, _complete, _daily, _dcomplete, _dcurrent, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _sort, _tasks, _today, _total, _wcomplete, _wcurrent, _weekly;
    _sort = function(a, b) {
      if (a.date < b.date) {
        return -1;
      } else {
        return 1;
      }
    };
    _today = new Date();
    _today.setHours(0, 0, 0, 0);
    dstart = _today.getTime();
    _today.setDate(_today.getDate() + 1);
    dfinish = _today.getTime();
    _today.setDate(_today.getDate() - 1);
    _today.setDate(_today.getDate() - ((_today.getDay() + 6) % 7));
    wstart = _today.getTime();
    _today.setDate(_today.getDate() + 7);
    wfinish = _today.getTime();
    _daily = [];
    _dcurrent = [];
    _dcomplete = [];
    _weekly = [];
    _wcurrent = [];
    _wcomplete = [];
    _badge = 0;
    _ref = this.$current.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      goal = _ref[_i];
      _tasks = [];
      _total = 0;
      _complete = 0;
      _ref1 = goal.schedules;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        schedule = _ref1[_j];
        _ref2 = schedule.tasks;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          task = _ref2[_k];
          _total += 1;
          if (task.complete) {
            _complete += 1;
          }
          task.$goal = goal;
          task.$schedule = schedule._id;
          task.title = schedule.title;
          tdate = task.date;
          if ((dstart <= tdate && tdate < dfinish)) {
            _daily.push(task);
            if (task.complete) {
              _dcomplete.push(task);
            } else {
              _badge += 1;
              _dcurrent.push(task);
            }
          }
          if ((wstart <= tdate && tdate < wfinish)) {
            if (task.complete) {
              _wcomplete.push(task);
            } else {
              _wcurrent.push(task);
            }
            _weekly.push(task);
          }
          _tasks.push(task);
        }
      }
      goal.$tasks = _tasks.sort(_sort);
      goal.progress = !(_complete || _total) ? 100 : Math.round(100 * _complete / (_total || 1));
      goal.$complete = _complete === _total;
    }
    this.$count = {
      task: _badge,
      goal: this.$current.data.length
    };
    if (((_ref3 = _win.cordova) != null ? (_ref4 = _ref3.device) != null ? _ref4.platform : void 0 : void 0) === 'iOS') {
      if ((_ref5 = _win.plugins.pushNotification) != null) {
        if (typeof _ref5.setApplicationIconBadgeNumber === "function") {
          _ref5.setApplicationIconBadgeNumber(angular.noop, angular.noop, _badge);
        }
      }
    }
    this.$daily = _daily.sort(_sort);
    this.$daily.current = _dcurrent.sort(_sort);
    this.$daily.complete = _dcomplete.sort(_sort);
    this.$weekly = _weekly.sort(_sort);
    this.$weekly.current = _wcurrent.sort(_sort);
    this.$weekly.complete = _wcomplete.sort(_sort);
    return this;
  };

  Goals.prototype.clear = function() {
    var key, _i, _len, _ref, _ref1, _ref2, _ref3;
    this.updated = false;
    _ref = this.keys;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if ((_ref1 = this[key].data) != null) {
        _ref1.length = 0;
      }
    }
    this.$count = {
      task: 0,
      goal: 0
    };
    if ((_ref2 = this.$daily) != null) {
      _ref2.length = 0;
    }
    if ((_ref3 = this.$weekly) != null) {
      _ref3.length = 0;
    }
    return this;
  };

  Goals.prototype.get = function(id) {
    var d, _find,
      _this = this;
    _find = function(arr, id) {
      var obj, _i, _len;
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        obj = arr[_i];
        if (obj._id === id) {
          return obj;
        }
      }
    };
    d = _q.defer();
    if (this.updated) {
      d.resolve(_find(this.$current.data, id));
    } else {
      this.update().then(function(res) {
        d.resolve(_find(_this.$current.data, id));
        return res;
      });
    }
    return d.promise;
  };

  Goals.prototype.complete = function(task) {
    var schedule, t, _badge, _complete, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _total;
    _badge = 0;
    _ref = this.$daily;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (!t.complete) {
        _badge += 1;
      }
    }
    this.$count.task = _badge;
    _total = 0;
    _complete = 0;
    _ref1 = task.$goal.schedules;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      schedule = _ref1[_j];
      _ref2 = schedule.tasks;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        t = _ref2[_k];
        _total += 1;
        if (t.complete) {
          _complete += 1;
        }
      }
    }
    task.$goal.progress = !(_complete || _total) ? 100 : Math.round(100 * _complete / (_total || 1));
    if (task.$goal.$complete = _complete === _total) {
      return task.$goal;
    }
  };

  return Goals;

})();

Complete = (function() {
  function Complete(complete, resource) {
    this.complete = complete;
    this.resource = resource;
  }

  Complete.prototype.update = function() {
    var _this = this;
    return this.resource.query({
      complete: this.complete
    }, function(goals) {
      return _this.data = goals;
    }).$promise;
  };

  return Complete;

})();
