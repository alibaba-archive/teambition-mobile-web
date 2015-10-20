/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeAPI {
    getLiked: (type: string, _id: string) => angular.IPromise<ILikeData>;
    postLike: <T>(detail: any) => angular.IPromise<T>;
  }

  angular.module('teambition').factory('likeAPI',
  // @ngInject
  (
    RestAPI: IRestAPI,
    Cache: angular.ICacheObject,
    likeParser: ILikeParser
  ) => {
    return {
      getLiked: (type: string, _id: string) => {
        return RestAPI.get({
          Type: `${type}s`,
          Id: _id,
          Path1: 'like',
          'all': 1
        })
        .$promise
        .then((data: ILikeData) => {
          let result = likeParser(data);
          return result;
        });
      },
      postLike: <T>(detail: any) => {
        let promise: angular.IPromise<any>;
        if (detail.liked) {
          promise = RestAPI.delete({
            Type: `${detail.type}s`,
            Id: detail._id,
            Path1: 'like'
          }, {
            _id: detail._id
          })
          .$promise;
        }else {
          promise = RestAPI.save({
            Type: `${detail.type}s`,
            Id: detail._id,
            Path1: 'like'
          }, {
            _id: detail._id
          })
          .$promise;
        }
        promise.then((data: ILikeDataParsed) => {
          detail.isLike = data.isLike;
          detail.likesGroup = data.likesGroup;
          detail.likedPeople = data.likedPeople;
          detail.likesCount = data.likesCount;
          return detail;
        });
      }
    };
  });
}
