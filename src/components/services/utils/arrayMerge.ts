'use strict';

export const arrayMerge = (oldArray: any[], newArray: any[]) => {
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
