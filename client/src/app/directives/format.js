angular.module('Remente').directive('rementeFormat', [
  '$filter', '$interpolate', function($filter, $interpolate) {
    return {
      transclude: 'element',
      priority: 100,
      compile: function(element, attrs, transclude) {
        return function($scope, $element) {
          return transclude($scope, function(clone) {
            $element.replaceWith(clone);
            return $scope.$watch(function() {
              var interpolated, text;
              text = clone.html();
              interpolated = $interpolate($filter('format')(text, $scope.$eval(attrs.rementeFormat)))($scope);
              clone.html(interpolated);
              return clone;
            });
          });
        };
      }
    };
  }
]);
