/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';
  angular.module('teambition').filter('memberLimit', () => {
    return (obj: any, limit: number) => {
      if (typeof obj === 'object') {
        let keys = Object.keys(obj);
        if (keys.length < 1) {
          return [];
        }
        let ret = {};
        let count = 0;
        angular.forEach(keys, function(key: any, arrayIndex: string){
          if (count >= limit) {
            return false;
          }
          ret[key] = obj[key];
          count++;
        });
        return ret;
      }
    };
  });
}
