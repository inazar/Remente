angular.module('Remente').directive('rementeToggle', [
  '$timeout', function($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      scope: {
        icon: '@toggleIcon',
        iconColor: '@toggleIconColor',
        title: '@toggleTitle',
        text: '@toggleText'
      },
      template: "<div>\n  <div class=\"lead\"><span class=\"ss-icon\" ng-show=\"icon\" style=\"color:{{iconColor}};\">{{icon}}&nbsp;</span><span>{{title}}</span>&nbsp;<a class=\"ui-toggle stable-bg\" ng-click=\"toggle()\";\">?</a></div>\n  <blockquote ng-show=\"visible\"><p class=\"ui-toggle-content text-left\">{{text}}</p><span ng-transclude></span></blockquote>\n</div>",
      link: function($scope, $element, $attrs) {
        return $scope.toggle = function() {
          $scope.visible = !$scope.visible;
          return $timeout(function() {
            return $scope.$broadcast('$resize');
          });
        };
      }
    };
  }
]);
