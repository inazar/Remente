angular.module('ionic').directive('ionNavTabs', [
  '$compile', '$animate', function($compile, $animate) {
    return {
      require: '^ionNavBar',
      restrict: 'E',
      priority: -1,
      compile: function($element, $attrs) {
        var content;
        content = $element.contents().remove();
        return function($scope, $element, $attrs, navBarCtrl) {
          var buttons, navElement;
          navBarCtrl.setTitle('');
          navElement = angular.element(navBarCtrl._headerBarView.el.querySelector('.title'));
          buttons = angular.element('<div class="nav-tabs-buttons">').append(content);
          $element.append(buttons);
          $compile(buttons)($scope);
          ionic.requestAnimationFrame(function() {
            return $animate.enter(buttons, navElement);
          });
          $scope.$on('$destroy', function() {
            return $animate.leave(buttons);
          });
          return $element.css('display', 'none');
        };
      }
    };
  }
]);
