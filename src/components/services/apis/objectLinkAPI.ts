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
  }

  export interface IObjectLinkAPI {
    fetch: (_parentType: string, _parentId: string) => angular.IPromise<ILinkedData[]>;
  }

  angular.module('teambition').factory('objectLinkAPI',
  // @ngInject
  (
    RestAPI: IRestAPI
  ) => {
    return {
      fetch: (_parentType: string, _parentId: string) => {
        return RestAPI.query({
          Type: `${_parentType}s`,
          Id: _parentId,
          Path1: 'objectLinks'
        })
        .$promise
        .then((data: ILinkedData[]) => {
          return data;
        });
      }
    };
  });
}
