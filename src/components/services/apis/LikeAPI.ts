'use strict';
import BaseAPI from '../../bases/BaseAPI';
import LikeModel from '../../models/LikeModel';
import {ILikeData} from 'teambition';

export class LikeAPI extends BaseAPI {

  public getLiked (type: string, _id: string) {
    let cache = LikeModel.get(_id);
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
      return LikeModel.set(_id, data);
    });
  }

  public postLike <T>(type: string, detail: any) {
    let promise: angular.IPromise<any>;
    if (detail.like && detail.like.isLike) {
      promise = this.RestAPI.delete({
        Type: `${type}s`,
        Id: detail._id,
        Path1: 'like'
      }, {
        _id: detail._id
      })
      .$promise;
    }else {
      promise = this.RestAPI.save({
        Type: `${type}s`,
        Id: detail._id,
        Path1: 'like'
      }, {
        _id: detail._id
      })
      .$promise;
    }
    return promise.then((data: ILikeData) => {
      LikeModel.update(detail._id, data);
    });
  }
}

angular.module('teambition').service('LikeAPI', LikeAPI);
