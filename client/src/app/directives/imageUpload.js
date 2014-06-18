angular.module('Remente').directive('imageUpload', [
  '$document', '$timeout', '$ionicPopup', '$filter', 'gettext', 'Modernizr', '$baseurl', 'ImageUploadSvc', function($document, $timeout, $ionicPopup, $filter, gettext, Modernizr, $baseurl, ImageUploadSvc) {
    return {
      scope: {
        model: '=ngModel',
        field: '@ngField',
        active: '=imageUpload',
        upload: '=',
        remove: '=',
        sizeX: '@',
        sizeY: '@',
        square: '@',
        imgClass: '@'
      },
      restrict: 'A',
      replace: true,
      template: "<div class=\"{{field}}-picker\">\n  <img class=\"{{imgClass}}\" ng-if=\"model[field]\" ng-src=\"" + $baseurl + "/img/{{field}}/{{model[field]}}\" ng-click=\"active&&imageClick($event)\" width=\"100%\">\n  <i class=\"icon ion-image item-image icon-large\" ng-show=\"!spinner&&!model[field]\" ng-click=\"active&&imageClick($event)\"></i>\n  <i class=\"icon ion-ios7-reloading item-image icon-large ng-hide\" ng-show=\"spinner\"></i>\n  <input class=\"ng-hide\" type=\"file\" name=\"upload\" accept=\"image/gif, image/jpeg, image/png\", ng-click=\"$event.stopPropagation()\">\n  <span class=\"badge\" ng-show=\"remove&&active&&model[field]\" ng-click=\"del($event)\"><i class=\"icon ion-ios7-close\"></i></span>\n</div>",
      controller: [
        '$scope', 'ImageUploadSvc', '$q', function($scope, ImageUploadSvc, $q) {
          return $scope.del = function(e) {
            e.stopPropagation();
            if ($scope.remove) {
              return $scope.remove($scope.model, $scope.field);
            }
          };
        }
      ],
      link: function($scope, $element, iAttr) {
        var fileInput;
        fileInput = $element.find('input');
        $scope.imageClick = function(e) {
          if (!$scope.active) {
            return;
          }
          e.stopPropagation();
          return $timeout(function() {
            return fileInput[0].click();
          });
        };
        $scope.fileInput = fileInput[0];
        return fileInput.bind('change', function(e) {
          $timeout(function() {
            return $scope.spinner = true;
          });
          ImageUploadSvc(e.target.files[0], {
            square: $scope.square,
            sizeX: $scope.sizeX,
            sizeY: $scope.sizeY
          }).then(function(data) {
            $scope.spinner = false;
            if ($scope.upload) {
              return $scope.upload(data, $scope.model, $scope.field);
            }
          }, function() {
            $scope.spinner = true;
            return $ionicPopup.alert({
              title: $filter('translate')(gettext('Error')),
              template: $filter('translate')(gettext("Failed to load image")),
              okText: $filter('translate')(gettext('Ok'))
            });
          });
          return $scope.$on('$destroy', function() {
            return fileInput.unbind('change');
          });
        });
      }
    };
  }
]);
