/* Goals page controller*/

angular.module('Remente').config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.goals', {
      url: '/goals',
      abstract: true,
      resolve: {
        $goals: [
          'GoalsSvc', function(GoalsSvc) {
            return GoalsSvc;
          }
        ]
      },
      views: {
        'goals': {
          templateUrl: 'pages/tabs/goals/page.tpl'
        }
      }
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.goals.current', {
      url: '/current',
      templateUrl: 'pages/tabs/goals/current.tpl',
      controller: [
        '$scope', '$goals', function($scope, $goals) {
          return angular.extend($scope, {
            $type: '$current',
            mode: function() {
              if ($scope.app.user.advanced) {
                return 'advanced';
              } else {
                return 'basic';
              }
            },
            removeGoal: function(i) {
              return $scope.$goals.$current.data[i].$remove(function() {
                $scope.$goals.$current.data.splice(i, 1);
                return $goals.values();
              });
            },
            completeGoal: function(goal) {
              goal.complete = true;
              return goal.$save(function() {
                return $goals.update();
              });
            }
          });
        }
      ]
    });
  }
]).config([
  '$stateProvider', function($stateProvider) {
    return $stateProvider.state('tabs.goals.complete', {
      url: '/complete',
      templateUrl: 'pages/tabs/goals/complete.tpl',
      controller: [
        '$scope', '$goals', function($scope, $goals) {
          $scope.$type = '$complete';
          return $scope.removeGoal = function(i) {
            return $scope.$goals.$complete.data[i].$remove(function() {
              $scope.$goals.$complete.data.splice(i, 1);
              return $goals.values();
            });
          };
        }
      ]
    });
  }
]);
