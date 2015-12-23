'use strict';
import {IMemberData} from 'teambition';

export const likedPeopleFilter = (likesGroup: string[]) => {
  if (likesGroup && likesGroup.length) {
    let result = [];
    angular.forEach(likesGroup, (member: IMemberData) => {
      result.push(member.name);
    });
    return result.join('、');
  }else {
    return '点赞';
  }
};
