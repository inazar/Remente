angular.module('common').directive('fillHeight', [
  '$window', '$timeout', function($window, $timeout) {
    return {
      restrict: 'A',
      priority: -100,
      link: function($scope, $element, $attrs) {
        return $timeout(function() {
          var el, h, parent;
          parent = $element.parent()[0];
          el = $element[0];
          h = parent.getBoundingClientRect().bottom - el.getBoundingClientRect().top - 10;
          return $element.css('height', "" + h + "px");
        });
      }
    };
  }
]);
