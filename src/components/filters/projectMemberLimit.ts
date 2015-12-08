'use strict';
export const memberLimit = (obj: any, limit: number) => {
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
