/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeData {
    isLike: boolean;
    likesCount: string | number;
    likesGroup: IMemberData[];
  }

  export interface ILikeDataParsed extends ILikeData {
    likedPeople: string;
  }

  export type ILikeParser = (likedData: ILikeData) => ILikeDataParsed;

  angular.module('teambition').factory('likeParser', () => {
    return (likedObj: ILikeDataParsed) => {
      let likedPeople: string[] = [];
      if (likedObj.likesCount) {
        angular.forEach(likedObj.likedPeople, (people: IMemberData, index: number) => {
          likedPeople.push(people.name);
        });
        likedObj.likesCount = `${likedObj.likesCount}人点了赞`;
      }else {
        likedObj.likesCount = '点赞';
      }
      likedObj.likedPeople = likedPeople.join(',');
      return likedObj;
    };
  });
}
