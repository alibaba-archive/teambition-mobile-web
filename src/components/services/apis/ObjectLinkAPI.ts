/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILinkedData {
    _id: string;
    _projectId: string;
    _parentId: string;
    _linkedId: string;
    _creatorId: string;
    updated: string;
    created: string;
    linkedType: string;
    parentType: string;
    creator: IMemberData;
    title: string;
    project: string;
    isDone: boolean;
    icon?: string;
  }

  export interface IObjectLinkAPI {
    fetch: (_parentType: string, _parentId: string) => angular.IPromise<ILinkedData[]>;
  }

  @inject([
    'ObjectLinkModel'
  ])
  class ObjectLinkAPI extends BaseAPI implements IObjectLinkAPI {

    private ObjectLinkModel: IObjectLinkModel;

    public fetch(_parentType: string, _parentId: string) {
      let cache = this.ObjectLinkModel.getLinks(_parentType, _parentId);
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
        this.ObjectLinkModel.setLinks(_parentType, _parentId, data);
        return data;
      });
    }
  }

  angular.module('teambition').service('ObjectLinkAPI', ObjectLinkAPI);
}
