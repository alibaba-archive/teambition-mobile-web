/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeAPI {
    getLiked: (type: string, _id: string) => angular.IPromise<ILikeData>;
    postLike: (type: string, _id: string, isLiked: boolean) => angular.IPromise<ILikeData>;
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
      postLike: (type: string, _id: string, liked: boolean) => {
        if (liked) {
          return RestAPI.delete({
            Type: `${type}s`,
            Id: _id,
            Path1: 'like'
          }, {
            _id: _id
          })
          .$promise
          .then((data: ILikeData) => {
            let likeObj = likeParser(data);
            return likeObj;
          });
        }else {
          return RestAPI.save({
            Type: `${type}s`,
            Id: _id,
            Path1: 'like'
          }, {
            _id: _id
          })
          .$promise
          .then((data: ILikeData) => {
            let likeObj = likeParser(data);
            return likeObj;
          });
        }
      }
    };
  });
}
