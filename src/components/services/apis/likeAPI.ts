/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeAPI {
    getLiked: (type: string, _id: string) => angular.IPromise<ILikeData>;
    postLike: <T>(detail: any) => angular.IPromise<T>;
  }

  @inject([
    'likeParser'
  ])
  class LikeAPI extends BaseAPI implements ILikeAPI {
    private likeParser: ILikeParser;

    public getLiked (type: string, _id: string) {
      return this.RestAPI.get({
        Type: `${type}s`,
        Id: _id,
        Path1: 'like',
        'all': 1
      })
      .$promise
      .then((data: ILikeData) => {
        let result = this.likeParser(data);
        return result;
      });
    }

    public postLike <T>(detail: any) {
      let promise: angular.IPromise<any>;
      if (detail.liked) {
        promise = this.RestAPI.delete({
          Type: `${detail.type}s`,
          Id: detail._id,
          Path1: 'like'
        }, {
          _id: detail._id
        })
        .$promise;
      }else {
        promise = this.RestAPI.save({
          Type: `${detail.type}s`,
          Id: detail._id,
          Path1: 'like'
        }, {
          _id: detail._id
        })
        .$promise;
      }
      return promise.then((data: ILikeDataParsed) => {
        detail.isLike = data.isLike;
        detail.likesGroup = data.likesGroup;
        detail.likedPeople = data.likedPeople;
        detail.likesCount = data.likesCount;
        return detail;
      });
    }
  }

  angular.module('teambition').service('LikeAPI', LikeAPI);
}
