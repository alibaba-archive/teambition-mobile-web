/// <reference path="../interface/teambition.d.ts" />
module teambition {
	'use strict';
	angular.module('teambition').factory('Cache',
		// @ngInject
		(
			$cacheFactory: angular.ICacheFactoryService
		) => {
			return $cacheFactory('tempCache');
		}
	);
}
