'use strict';
import ObjectLinkModel from '../../models/ObjectLinkModel';
import BaseAPI from '../../bases/BaseAPI';
import {ILinkedData} from 'teambition';

export class ObjectLinkAPI extends BaseAPI {

  public fetch(_parentType: string, _parentId: string) {
    let cache = ObjectLinkModel.getLinks(_parentType, _parentId);
    if (cache) {
      let deferred = this.$q.defer();
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: `${_parentType}s`,
      Id: _parentId,
      Path1: 'objectLinks'
    })
    .$promise
    .then((data: ILinkedData[]) => {
      ObjectLinkModel.setLinks(_parentType, _parentId, data);
      return data;
    });
  }
}

angular.module('teambition').service('ObjectLinkAPI', ObjectLinkAPI);
