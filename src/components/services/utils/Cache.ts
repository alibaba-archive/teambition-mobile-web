'use strict';
export default angular.module('teambition').factory('Cache', ['$cacheFactory',
($cacheFactory: angular.ICacheFactoryService) => {
    return $cacheFactory('tempCache');
}]);
