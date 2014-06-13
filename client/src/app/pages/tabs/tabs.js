/* Dashboard page controller*/

angular.module('Remente').config([
  '$stateProvider', 'AccessProvider', function($stateProvider, $access) {
    return $stateProvider.state('tabs', {
      abstract: true,
      url: '/tabs',
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
      templateUrl: 'pages/tabs/tabs.tpl',
      controller: [
        '$scope', '$state', '$goals', '$ionicModal', '$filter', 'gettext', function($scope, $state, $goals, $ionicModal, $filter, gettext) {
          return angular.extend($scope, {
            data: {},
            $goals: $goals,
            addGoal: function(from) {
              var progress, _ref;
              if (typeof analytics !== "undefined" && analytics !== null) {
                analytics.track("" + from + ".new");
              }
              if ((progress = (_ref = $scope.app.user) != null ? _ref.progress : void 0) && progress.wheel) {
                if (progress.assessment) {
                  return $state.go('goal.wheel.mode.category', {
                    wheel: progress.wheel,
                    mode: $scope.app.user.advanced || 'basic'
                  });
                } else {
                  return $state.go('goal.wheel', {
                    wheel: progress.wheel
                  });
                }
              } else {
                return $ionicModal.fromTemplateUrl('pages/tabs/goals/intro.tpl', {
                  animation: 'slide-in-up'
                }).then(function(modal) {
                  modal.scope.$close = function() {
                    modal.remove();
                    return $state.go('goal.wheels');
                  };
                  return modal.show();
                });
              }
            }
          });
        }
      ]
    });
  }
]);
