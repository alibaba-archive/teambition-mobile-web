/// <reference path="../../interface/teambition.d.ts" />
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

  @inject([
    'Cache'
  ])
  class MemberAPI extends BaseAPI implements IMemberAPI {
    private Cache: angular.ICacheObject;

    public fetch(_id: string) {
      let cacheId: string = `members:${_id}`;
      let members: IMemberData[] = this.Cache.get<IMemberData[]>(cacheId);
      if (members) {
        let deferred = this.$q.defer<IMemberData[]>();
        deferred.resolve(members);
        return deferred.promise;
      }else {
        return this.RestAPI.query({
          V2: 'v2',
          Type: 'projects',
          Id: _id,
          Path1: 'members',
          fields: this.queryFileds.memberFileds
        })
        .$promise
        .then((data: IMemberData[]) => {
          this.Cache.put(`members:${_id}`);
          return data;
        });
      }
    }
  }

  angular.module('teambition').service('MemberAPI', MemberAPI);
}
