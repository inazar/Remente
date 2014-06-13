angular.module('common').provider('Locale', function() {
  var defaultLocale, loadLocale, loadScript, localeLocationPattern, storage, storageFactory, storeKey;
  defaultLocale = '';
  storage = null;
  localeLocationPattern = '/lang/{{locale}}.js';
  storageFactory = 'LocaleStorageCache';
  storeKey = 'lang';
  loadScript = function(url, callback) {
    var body, script;
    body = document.body;
    script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          return callback();
        }
      };
    } else {
      script.onload = callback;
    }
    script.src = url;
    script.async = false;
    return body.appendChild(script);
  };
  loadLocale = function(localeUrl, $locale, $gettext, localeId, $rootScope, $q, localeCache) {
    var applyLocale, cachedLocale, deferred, overrideValues;
    overrideValues = function(oldObject, newObject) {
      return angular.forEach(newObject, function(value, key) {
        if (angular.isArray(newObject[key]) || angular.isObject(newObject[key])) {
          return overrideValues(oldObject[key], newObject[key]);
        } else {
          return oldObject[key] = newObject[key];
        }
      });
    };
    cachedLocale = localeCache.get(localeId);
    deferred = $q.defer();
    applyLocale = function() {
      storage.put(storeKey, localeId);
      $rootScope.$broadcast('$localeChangeSuccess', localeId, $locale);
      return deferred.resolve($locale);
    };
    if (cachedLocale) {
      $rootScope.$evalAsync(function() {
        overrideValues($locale, cachedLocale);
        $gettext.currentLanguage = localeId;
        return applyLocale();
      });
    } else {
      loadScript(localeUrl, function() {
        var externalLocale, gettextInjector, localInjector, localeStrings;
        localInjector = angular.injector(['ngLocale']);
        externalLocale = localInjector.get('$locale');
        gettextInjector = angular.injector(['locale_' + localeId]);
        localeStrings = gettextInjector.get(localeId) || {};
        overrideValues($locale, externalLocale);
        $gettext.setStrings(localeId, localeStrings);
        $gettext.currentLanguage = localeId;
        localeCache.put(localeId, externalLocale);
        return $rootScope.$apply(applyLocale);
      });
    }
    return deferred.promise;
  };
  this.setLocationPattern = function(value) {
    if (value) {
      localeLocationPattern = value;
      return this;
    } else {
      return localeLocationPattern;
    }
  };
  this.useStorage = function(storageName) {
    return storageFactory = storageName;
  };
  this.useCookieStorage = function() {
    return this.useStorage('$cookieStore');
  };
  this.defaultLocale = function(value) {
    return defaultLocale = value;
  };
  this.$get = [
    '$rootScope', '$injector', '$interpolate', '$locale', '$baseurl', 'gettextCatalog', '$q', 'LocaleCache', function($rootScope, $injector, $interpolate, $locale, $baseurl, $gettext, $q, LocaleCache) {
      var localeLocation;
      localeLocation = $interpolate("" + $baseurl + localeLocationPattern);
      storage = $injector.get(storageFactory);
      $rootScope.$evalAsync(function() {
        var initialLocale;
        if (initialLocale = storage.get(storeKey) || defaultLocale) {
          return loadLocale(localeLocation({
            locale: initialLocale
          }), $locale, $gettext, initialLocale, $rootScope, $q, LocaleCache);
        }
      });
      return {
        set: function(value) {
          return loadLocale(localeLocation({
            locale: value
          }), $locale, $gettext, value, $rootScope, $q, LocaleCache);
        },
        get: function() {
          return storage.get(storeKey);
        }
      };
    }
  ];
  return this;
}).provider('LocaleCache', function() {
  this.$get = [
    '$cacheFactory', function($cacheFactory) {
      return $cacheFactory('locales');
    }
  ];
  return this;
}).provider('LocaleStorageCache', function() {
  this.$get = [
    '$cacheFactory', function($cacheFactory) {
      return $cacheFactory('locale');
    }
  ];
  return this;
}).run(['Locale', angular.noop]);
