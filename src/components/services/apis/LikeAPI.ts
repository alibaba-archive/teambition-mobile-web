/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeAPI {
    getLiked: (type: string, _id: string) => angular.IPromise<ILikeDataParsed>;
    postLike: <T>(detail: any) => angular.IPromise<T>;
  }

  @inject([
    'LikeModel'
  ])
  class LikeAPI extends BaseAPI implements ILikeAPI {
    private LikeModel: ILikeModel;

    public getLiked (type: string, _id: string) {
      let cache = this.LikeModel.get(_id);
      if (cache) {
        let deferred = this.$q.defer();
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.get({
        Type: `${type}s`,
        Id: _id,
        Path1: 'like',
        'all': 1
      })
      .$promise
      .then((data: ILikeData) => {
        return this.LikeModel.set(_id, data);
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
        this.LikeModel.update(detail._id, data);
      });
    }
  }

  angular.module('teambition').service('LikeAPI', LikeAPI);
}
