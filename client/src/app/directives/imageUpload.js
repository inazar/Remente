angular.module('Remente').directive('imageUpload', [
  '$document', '$timeout', '$ionicPopup', '$filter', 'gettext', 'Modernizr', '$baseurl', function($document, $timeout, $ionicPopup, $filter, gettext, Modernizr, $baseurl) {
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
      template: "<div class=\"{{field}}-picker\">\n  <img class=\"{{imgClass}}\" ng-if=\"model[field]\" ng-src=\"" + $baseurl + "/img/{{field}}/{{model[field]}}\" ng-click=\"active&&imageClick($event)\" width=\"100%\">\n  <i class=\"icon ion-image item-image icon-large\" ng-show=\"!spinner&&!model[field]\" ng-click=\"active&&imageClick($event)\"></i>\n  <i class=\"icon ion-ios7-reloading item-image icon-large\" ng-show=\"spinner\"></i>\n  <input class=\"ng-hide\" type=\"file\" name=\"upload\" accept=\"image/gif, image/jpeg, image/png\", ng-click=\"$event.stopPropagation()\">\n  <span class=\"badge\" ng-show=\"remove&&active&&model[field]\" ng-click=\"del($event)\"><i class=\"icon ion-ios7-close\"></i></span>\n</div>",
      controller: [
        '$scope', 'Modernizr', '$q', function($scope, Modernizr, $q) {
          var d;
          d = $q.defer();
          $scope.loaded = d.promise;
          Modernizr.load({
            load: 'assets/blueimp-load-image/js/load-image.min.js',
            complete: function() {
              return $timeout(function() {
                return d.resolve();
              });
            }
          });
          return $scope.del = function(e) {
            e.stopPropagation();
            if ($scope.remove) {
              return $scope.remove($scope.model, $scope.field);
            }
          };
        }
      ],
      link: function($scope, $element, iAttr) {
        var _rotateExif;
        _rotateExif = function(canvas, orientation) {
          var ctx, dest, height, width;
          if (!orientation) {
            return;
          }
          dest = document.createElement('canvas');
          if (orientation > 4) {
            width = dest.width = canvas.height;
            height = dest.height = canvas.width;
          } else {
            width = dest.width = canvas.width;
            height = dest.height = canvas.width;
          }
          ctx = dest.getContext('2d');
          ctx.save();
          ctx.translate(width / 2, height / 2);
          switch (orientation) {
            case 2:
              ctx.scale(-1, 1);
              break;
            case 3:
              ctx.rotate(Math.PI);
              break;
            case 4:
              ctx.scale(1, -1);
              break;
            case 5:
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6:
              ctx.rotate(0.5 * Math.PI);
              break;
            case 7:
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(-1, 1);
              break;
            case 8:
              ctx.rotate(-0.5 * Math.PI);
          }
          ctx.drawImage(canvas, -canvas.width / 2, -canvas.width / 2);
          ctx.restore();
          return dest;
        };
        return $scope.loaded.then(function() {
          var fileInput, iconSizeX, iconSizeY;
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
          if ($scope.square) {
            iconSizeX = $scope.square || 80;
            iconSizeY = $scope.square || 80;
          } else {
            iconSizeX = $scope.sizeX || 256;
          }
          fileInput.bind('change', function(e) {
            $timeout(function() {
              return $scope.spinner = true;
            });
            return loadImage.parseMetaData(e.target.files[0], function(data) {
              var orientation, _ref;
              orientation = (_ref = data.exif) != null ? _ref[0x0112] : void 0;
              return loadImage(e.target.files[0], function(img) {
                var canvas, h, sizeY, sx, sy, w;
                if (img.type === 'error') {
                  $ionicPopup.alert({
                    title: $filter('translate')(gettext('Error')),
                    template: $filter('translate')(gettext("Failed to load image")),
                    okText: $filter('translate')(gettext('Ok'))
                  });
                  return;
                }
                w = img.width;
                h = img.height;
                if ($scope.square) {
                  sx = (w > h ? Math.floor((w - h) / 2) : 0);
                  sy = (w <= h ? Math.floor((h - w) / 2) : 0);
                  w = h = Math.min(w, h);
                } else {
                  sx = sy = 0;
                  iconSizeY = h * iconSizeX / w;
                  $scope.sizeY;
                  if ($scope.sizeY && (sizeY = Number($scope.sizeY)) && sizeY < iconSizeY) {
                    h = sizeY * h / iconSizeY;
                    iconSizeY = sizeY;
                  }
                }
                canvas = $document[0].createElement('canvas');
                canvas.width = iconSizeX;
                canvas.height = iconSizeY;
                loadImage.renderImageToCanvas(canvas, img, sx, sy, w, h, 0, 0, iconSizeX, iconSizeY);
                return $timeout(function() {
                  $scope.spinner = false;
                  if ($scope.upload) {
                    return $scope.upload(canvas.toDataURL(), $scope.model, $scope.field);
                  }
                });
              });
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
