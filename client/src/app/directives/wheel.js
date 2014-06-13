var Arc, Sector, Wheel;

Arc = (function() {
  function Arc(x, y, r, start, finish, width, gap) {
    var fx1, fx2, fy1, fy2, sx1, sx2, sy1, sy2;
    this.x = x;
    this.y = y;
    this.rotate1 = start;
    this.rotate2 = finish;
    start = start * Math.PI / 180 + gap / (2 * r);
    this.start = [Math.cos(start), Math.sin(start)];
    finish = finish * Math.PI / 180 - gap / (2 * r);
    this.finish = [Math.cos(finish), Math.sin(finish)];
    this.ir = r;
    this.or = r + width;
    sx1 = this.x + this.ir * this.start[0];
    sy1 = this.y + this.ir * this.start[1];
    fx1 = this.x + this.ir * this.finish[0];
    fy1 = this.y + this.ir * this.finish[1];
    sx2 = this.x + this.or * this.finish[0];
    sy2 = this.y + this.or * this.finish[1];
    fx2 = this.x + this.or * this.start[0];
    fy2 = this.y + this.or * this.start[1];
    this.line = "M" + sx1 + "," + sy1 + "A" + this.ir + "," + this.ir + " " + this.rotate1 + " 0,1 " + fx1 + "," + fy1 + "L" + sx2 + "," + sy2 + "A" + this.or + "," + this.or + " " + this.rotate2 + " 0,0 " + fx2 + "," + fy2 + " z";
  }

  Arc.prototype.draw = function(paper, color) {
    return paper.path(this.line).attr('fill', color).attr({
      'stroke-width': 0
    });
  };

  return Arc;

})();

Sector = (function() {
  function Sector(index, sector, config) {
    var arc, iconAngle;
    this.index = index;
    this.sector = sector;
    this.color = config.color;
    arc = 360 / config.sectors.length;
    this.start = -90 + (this.index * arc);
    this.finish = this.start + arc;
    iconAngle = Math.PI * (this.start + arc / 2) / 180;
    this.angles = [Math.cos(iconAngle), Math.sin(iconAngle)];
    this._dimensions(config);
    this.sector.value = 0;
  }

  Sector.prototype._dimensions = function(config) {
    var i, _i, _ref, _results;
    this.x = config.x;
    this.y = config.y;
    this.iconX = this.x + (config.radius * 1.1) * this.angles[0];
    this.iconY = this.y + (config.radius * 1.1) * this.angles[1];
    this.iconSize = config.radius * 0.15;
    this.arcs = [];
    _results = [];
    for (i = _i = 0, _ref = config.steps - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      _results.push(this.arcs.push(new Arc(this.x, this.y, config.innerR + i * config.stripe, this.start, this.finish, config.stripe - config.arcGap, config.sectorGap)));
    }
    return _results;
  };

  Sector.prototype.resize = function(config) {
    return this._dimensions(config);
  };

  Sector.prototype.draw = function(paper) {
    var arc, i, _i, _len, _ref;
    if (this.element) {
      this.element.remove();
    }
    paper.setStart();
    _ref = this.arcs;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      arc = _ref[i];
      arc.draw(paper, (i < this.sector.value ? this.sector.color : this.color));
    }
    paper.text(this.iconX, this.iconY, this.sector.icon).attr('font-family', "SSSymbolicons").attr('font-size', "" + this.iconSize + "px").attr('fill', "" + this.sector.color);
    return this.element = paper.setFinish();
  };

  return Sector;

})();

Wheel = (function() {
  function Wheel(config) {
    var i, s, _i, _len, _ref;
    this.paper = config.paper, this.steps = config.steps, this.color = config.color, this.active = config.active, this.sectorGap = config.sectorGap, this.arcGap = config.arcGap, this.sectors = config.sectors;
    this._dimensions();
    this._sectors = [];
    _ref = this.sectors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      s = _ref[i];
      this._sectors.push(new Sector(i, s, this));
    }
  }

  Wheel.prototype._dimensions = function() {
    var size;
    size = Math.min(this.paper.width, this.paper.height);
    this.x = this.y = size / 2;
    this.innerR = 0.1 * size / 2;
    this.outerR = 0.8 * size / 2;
    this.stripe = (this.outerR - this.innerR) / this.steps;
    return this.radius = this.outerR + this.stripe;
  };

  Wheel.prototype.resize = function(width, height) {
    var sector, _i, _len, _ref, _results;
    this.paper.setSize(width, height || width);
    this._dimensions();
    _ref = this._sectors;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sector = _ref[_i];
      _results.push(sector.resize(this));
    }
    return _results;
  };

  Wheel.prototype.setActive = function(i) {
    if (this._active !== void 0) {
      this._sectors[this._active].color = this.color;
      this._sectors[this._active].draw(this.paper);
    }
    this._sectors[i].color = this.active;
    this._sectors[i].draw(this.paper);
    return this._active = i;
  };

  Wheel.prototype.setValue = function(i, value) {
    this._sectors[i].sector.value = value;
    return this._sectors[i].draw(this.paper);
  };

  Wheel.prototype.setValueKey = function(key, value) {
    var i, s, _i, _len, _ref;
    _ref = this._sectors;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      s = _ref[i];
      if (s.sector.key === key) {
        this.setValue(i, value);
        break;
      }
    }
  };

  Wheel.prototype.getValues = function() {
    var res, s, _i, _len, _ref;
    res = {};
    _ref = this._sectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      res[s.sector.key] = s.sector.value;
    }
    return res;
  };

  Wheel.prototype.getValue = function(i) {
    var _ref;
    return (_ref = this._sectors[i]) != null ? _ref.sector.value : void 0;
  };

  Wheel.prototype.getValueKey = function(key) {
    var s, _i, _len, _ref;
    _ref = this._sectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s.sector.key === key) {
        return s.sector.value;
      }
    }
  };

  Wheel.prototype.getSector = function(i) {
    return this.sectors[i];
  };

  Wheel.prototype.draw = function(paper) {
    var sector, _i, _len, _ref;
    this.paper.clear();
    _ref = this._sectors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sector = _ref[_i];
      sector.draw(this.paper);
    }
  };

  return Wheel;

})();

angular.module('Remente').directive('rementeWheel', [
  function() {
    return {
      scope: {
        sectors: '&rementeWheel',
        getValues: '=wheelGetValues',
        getValue: '=wheelGetValue',
        getValueKey: '=wheelGetValueKey',
        setValue: '=wheelSetValue',
        setValueKey: '=wheelSetValueKey',
        setActive: '=wheelSetActive',
        getActive: '=wheelGetActive',
        getSector: '=wheelGetSector',
        object: '=wheelObject',
        values: '=wheelValues',
        active: '=wheelActive'
      },
      restrict: 'EA',
      link: function($scope, $element, $attrs) {
        return $scope.$watch('sectors', function(sectors) {
          var active, width;
          if (!sectors || $scope.wheel) {
            return;
          }
          $element.attr('style', 'width=100%;');
          width = $element[0].clientWidth;
          $scope.wheel = new Wheel({
            paper: Raphael($element[0], width, width),
            width: width,
            height: width,
            steps: 10,
            color: 'lightgray',
            active: 'gray',
            sectorGap: 2,
            arcGap: 2,
            sectors: sectors()
          });
          if ($attrs.wheelObject) {
            $scope.object = $scope.wheel;
          }
          if ($attrs.wheelSetActive) {
            $scope.setActive = angular.bind($scope.wheel, $scope.wheel.setActive);
          }
          if ($attrs.wheelSetValue) {
            $scope.setValue = angular.bind($scope.wheel, $scope.wheel.setValue);
          }
          if ($attrs.wheelSetValueKey) {
            $scope.setValueKey = angular.bind($scope.wheel, $scope.wheel.setValueKey);
          }
          if ($attrs.wheelGetValues) {
            $scope.getValues = angular.bind($scope.wheel, $scope.wheel.getValues);
          }
          if ($attrs.wheelGetValue) {
            $scope.getValue = angular.bind($scope.wheel, $scope.wheel.getValue);
          }
          if ($attrs.wheelGetValueKey) {
            $scope.getValueKey = angular.bind($scope.wheel, $scope.wheel.getValueKey);
          }
          if ($attrs.wheelGetSector) {
            $scope.getSector = angular.bind($scope.wheel, $scope.wheel.getSector);
          }
          $scope.wheel.draw();
          if ($attrs.wheelValues) {
            $scope.$watch('values', function(vals) {
              var key, val;
              for (key in vals) {
                val = vals[key];
                $scope.wheel.setValueKey(key, val);
              }
            });
          }
          if ($attrs.wheelActive) {
            active = $scope.$eval($attrs.wheelActive);
            if (!isNaN(Number(active))) {
              $scope.wheel.setActive(Number(active));
            }
          }
          return $scope.$on('$resize', function() {
            width = $element[0].clientWidth;
            $scope.wheel.resize(width);
            return $scope.wheel.draw();
          });
        });
      }
    };
  }
]);
