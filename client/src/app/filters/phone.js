/* Format phone number*/

angular.module('Remente').filter('phone', function() {
  return function(tel) {
    var city, country, number, value;
    if (!tel) {
      return '';
    }
    value = tel.toString().trim().replace(/[\+()\-\s\.]+/g, '');
    if (value.match(/[^0-9]/)) {
      return tel;
    }
    switch (value.length) {
      case 10:
        country = '';
        city = value.slice(0, 3);
        number = value.slice(3);
        break;
      case 11:
        country = value[0] === '1' ? '' : value[0];
        city = value.slice(1, 4);
        number = value.slice(4);
        break;
      case 12:
        country = value.slice(0, 3);
        city = value.slice(3, 5);
        number = value.slice(5);
        break;
      default:
        return tel;
    }
    number = number.slice(0, 3) + '-' + number.slice(3);
    return (country + " (" + city + ") " + number).trim();
  };
}).filter('phoneLink', function() {
  return function(tel) {
    var value;
    if (!tel) {
      return '';
    }
    value = tel.toString().trim().replace(/[\+()\-\s\.]+/g, '');
    if (value.match(/[^0-9]/)) {
      return tel;
    }
    return 'tel:' + value;
  };
});
