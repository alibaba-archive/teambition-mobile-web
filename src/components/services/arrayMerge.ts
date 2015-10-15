/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export type IArrayMerge = (oldArray: any[], newArray: any[]) => any[];

  angular.module('teambition').factory('arrayMerge', () => {
    return (oldArray: any[], newArray: any[]) => {
      let flag = {};
      angular.forEach(oldArray, (item: any, index: number) => {
        let id = item._id;
        if (id) {
          flag[id] = index;
        }
      });
      angular.forEach(newArray, (item: any, index: number) => {
        let id = flag[item._id];
        if (flag[id] >= 0) {
          angular.extend(oldArray[id], item);
        }else {
          oldArray.push(item);
        }
      });
      return oldArray;
    };
  });
}
