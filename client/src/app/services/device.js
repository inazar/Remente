/* Device service*/

angular.module('Remente').factory('DeviceSvc', [
  '$window', function($window) {
    var device;
    Detectizr.detect({
      detectPlugins: false
    });
    device = Detectizr.device;
    device.os = Detectizr.os;
    device.standalone = $window.navigator.standalone;
    return device;
  }
]);
