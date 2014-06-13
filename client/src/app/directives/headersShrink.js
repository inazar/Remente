angular.module('Remente').directive('headersShrink', [
  '$timeout', '$ionicGesture', '$ionicScrollDelegate', 'Modernizr', function($timeout, $ionicGesture, $ionicScrollDelegate, Modernizr) {
    var DURATION, currentAmt, currentDir, duration, shrink, transform, transition;
    transform = Modernizr.prefixed('transform');
    transform = transform.replace(/^[A-Z]/, function(c) {
      return c.toLowerCase();
    });
    transition = Modernizr.prefixed('transition');
    transition = transition.replace(/^[A-Z]/, function(c) {
      return c.toLowerCase();
    });
    duration = Modernizr.prefixed('transitionDuration');
    duration = duration.replace(/^[A-Z]/, function(c) {
      return c.toLowerCase();
    });
    currentAmt = 0;
    currentDir = false;
    DURATION = 500;
    shrink = function(header1, header2, amt, max, content, delay) {
      var fadeAmt, _duration;
      currentAmt = amt = Math.min(max, amt);
      fadeAmt = Math.max(1 - amt / max, 0);
      _duration = amt ? Math.round(DURATION * amt / max) : DURATION;
      if (delay) {
        header1[0].style[duration] = "" + _duration + "ms";
        header2[0].style[duration] = "" + _duration + "ms";
      }
      return ionic.requestAnimationFrame(function() {
        var child, _i, _j, _len, _len1, _ref, _ref1;
        header1[0].style[transform] = 'translate3d(0, -' + amt + 'px, 0)';
        header2[0].style[transform] = 'translate3d(0, -' + amt + 'px, 0)';
        _ref = header1.children();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (delay) {
            child.style[transition] = "opacity " + _duration + "ms";
          }
          angular.element(child).css('opacity', fadeAmt);
        }
        _ref1 = header2.children();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          child = _ref1[_j];
          if (delay) {
            child.style[transition] = "opacity " + _duration + "ms";
          }
          angular.element(child).css('opacity', fadeAmt);
        }
        content[0].style[transition] = '';
        if (amt > 0 && content) {
          content[0].style.top = "" + (max - amt) + "px";
        }
        if (delay) {
          return $timeout(function() {
            var _k, _l, _len2, _len3, _ref2, _ref3;
            header1[0].style[duration] = '';
            header2[0].style[duration] = '';
            _ref2 = header1.children();
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              child = _ref2[_k];
              child.style[transition] = '';
            }
            _ref3 = header2.children();
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              child = _ref3[_l];
              child.style[transition] = '';
            }
            content[0].style[transition] = "top " + DURATION + "ms";
            if (amt <= 0 && content) {
              return content[0].style.top = "" + max + "px";
            }
          }, _duration);
        }
      });
    };
    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
        var $content, $delegate, $view, content, header1, header1Height, header2, header2Height, headerHeight, starty;
        header1 = angular.element($element[0].querySelector('.bar-header'));
        header2 = angular.element($element[0].querySelector('.bar-subheader'));
        content = $element.find('ion-content');
        $content = content.scope();
        if ($content.app.edit) {
          header2.addClass('ng-hide');
          content.removeClass('has-subheader');
          return;
        }
        header1[0].style[transform] = 'translate3d(0, 0, 0)';
        header2[0].style[transform] = 'translate3d(0, 0, 0)';
        headerHeight = 0;
        header1Height = 0;
        header2Height = 0;
        $timeout(function() {
          header1Height = header1[0].offsetHeight;
          header2Height = header2[0].offsetHeight;
          return headerHeight = header1Height + header2Height;
        });
        starty = $scope.$eval($attr.headerShrink) || 0;
        if ($attr.scrollDelegate) {
          $delegate = $ionicScrollDelegate.$getByHandle($attr.scrollDelegate);
          $view = {};
          $timeout(function() {
            return $view = $delegate.getScrollView();
          });
          $content.$_scrollComplete = function() {
            if ($view.__maxScrollTop <= $view.__scrollTop) {
              return shrink(header1, header2, 0, headerHeight, content, true);
            }
          };
          $scope.$on('$destroy', function() {
            return $content.$_scrollComplete = null;
          });
        }
        $ionicGesture.on('dragup', function(e) {
          var shrinkAmt;
          if (currentAmt === headerHeight) {
            return;
          }
          currentDir = true;
          shrinkAmt = Math.max(0, headerHeight - Math.max(0, (starty + headerHeight) - e.gesture.distance));
          shrink(header1, header2, shrinkAmt, headerHeight, content);
        }, $element);
        $ionicGesture.on('dragdown', function(e) {
          var shrinkAmt;
          if (currentAmt === 0) {
            return;
          }
          currentDir = false;
          shrinkAmt = Math.max(0, (starty + headerHeight) - e.gesture.distance);
          shrink(header1, header2, shrinkAmt, headerHeight, content);
        }, $element);
        return $ionicGesture.on('dragend', function(e) {
          if (currentAmt === headerHeight || currentAmt === 0) {
            return;
          }
          if (headerHeight - currentAmt > header2Height / 2 && !currentDir) {
            shrink(header1, header2, 0, headerHeight, content, true);
          } else if (currentAmt > header1Height / 2 && currentDir) {
            shrink(header1, header2, headerHeight, headerHeight, content, true);
          } else if (currentDir) {
            shrink(header1, header2, 0, headerHeight, content, true);
          } else {
            shrink(header1, header2, headerHeight, headerHeight, content, true);
          }
        }, $element);
      }
    };
  }
]);
