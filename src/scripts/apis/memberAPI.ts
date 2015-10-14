/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMemberData {
    _id: string;
    name: string;
    avatarUrl: string;
    title?: string;
  }

  export interface IMemberAPI {
    fetch: (_projectId: string) => angular.IPromise<IMemberData[]>;
  }

  angular.module('teambition').factory('memberAPI',
  // @ngInject
  function(
    $q: angular.IQService,
    RestAPI: IRestAPI,
    Cache: angular.ICacheObject,
    queryFileds: IqueryFileds
  ) {
    let fetchPromise: angular.IPromise<IMemberData[]>;
    return {
      fetch: (_id: string) => {
        let cacheId: string = `members:${_id}`;
        let members: IMemberData[] = Cache.get<IMemberData[]>(cacheId);
        if (members) {
          let deferred = $q.defer<IMemberData[]>();
          deferred.resolve(members);
          return deferred.promise;
        }else if (fetchPromise) {
          return fetchPromise;
        }else {
          fetchPromise = RestAPI.query({
            V2: 'v2',
            Type: 'projects',
            Id: _id,
            Path1: 'members',
            fields: queryFileds.memberFileds
          })
          .$promise
          .then((data: IMemberData[]) => {
            Cache.put(`members:${_id}`);
            return data;
          });
          return fetchPromise;
        }
      }
    };
  });
}
