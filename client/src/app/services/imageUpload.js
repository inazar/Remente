/* Image upload service*/

angular.module('Remente').service('ImageUploadSvc', [
  'Modernizr', '$q', '$document', '$window', '$timeout', function(Modernizr, $q, $document, $window, $timeout) {
    var load, _loaded, _rotateExif;
    load = $q.defer();
    _loaded = load.promise;
    Modernizr.load({
      load: 'assets/blueimp-load-image/js/load-image.min.js',
      complete: function() {
        return $timeout(function() {
          if ($window.loadImage) {
            return load.resolve(loadImage);
          } else {
            return load.reject();
          }
        });
      }
    });
    _rotateExif = function(canvas, orientation) {
      var ctx, dest, height, width;
      if (!orientation) {
        return;
      }
      dest = $document[0].createElement('canvas');
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
    return function(file, _arg) {
      var d, iconSizeX, iconSizeY, sizeX, sizeY, square;
      square = _arg.square, sizeX = _arg.sizeX, sizeY = _arg.sizeY;
      if (square) {
        iconSizeX = square || 80;
        iconSizeY = square || 80;
      } else {
        iconSizeX = sizeX || 256;
      }
      d = $q.defer();
      _loaded.then(function(loadImage) {
        loadImage.parseMetaData(file, function(data) {
          var orientation, _ref;
          orientation = (_ref = data.exif) != null ? _ref[0x0112] : void 0;
          return loadImage(file, function(img) {
            var canvas, h, sx, sy, w, _sizeY;
            if (img.type === 'error') {
              return $timeout(function() {
                return d.reject();
              });
            }
            w = img.width;
            h = img.height;
            if (square) {
              sx = (w > h ? Math.floor((w - h) / 2) : 0);
              sy = (w <= h ? Math.floor((h - w) / 2) : 0);
              w = h = Math.min(w, h);
            } else {
              sx = sy = 0;
              iconSizeY = h * iconSizeX / w;
              if (sizeY && (_sizeY = Number(sizeY)) && _sizeY < iconSizeY) {
                h = _sizeY * h / iconSizeY;
                iconSizeY = _sizeY;
              }
            }
            canvas = $document[0].createElement('canvas');
            canvas.width = iconSizeX;
            canvas.height = iconSizeY;
            loadImage.renderImageToCanvas(canvas, img, sx, sy, w, h, 0, 0, iconSizeX, iconSizeY);
            return $timeout(function() {
              return d.resolve(canvas.toDataURL());
            });
          });
        });
        return loadImage;
      });
      return d.promise;
    };
  }
]);
