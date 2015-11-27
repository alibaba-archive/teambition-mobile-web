/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMemberData {
    _id: string;
    name: string;
    avatarUrl: string;
    email?: string;
    title?: string;
    isSelected?: boolean;
    emplId?: string;
  }

  let hasResolved = {};

  export interface IMemberAPI {
    fetch(_projectId: string): angular.IPromise<{[index: string]: IMemberData}>;
    getOrganizationMembers(organizationId: string): angular.IPromise<{[index: string]: IMemberData}>;
    getDingId(userIds: string[], projectId: string): angular.IPromise<{_userId: string, emplId: string}[]>;
  }

  @inject([
    'MemberModel',
    'DingRestAPI'
  ])
  class MemberAPI extends BaseAPI implements IMemberAPI {
    private MemberModel: IMemberModel;
    private DingRestAPI: IRestAPI;

    public fetch(_id: string) {
      let members = this.MemberModel.getMemberCollection(_id);
      if (members) {
        let deferred = this.$q.defer<{[index: string]: IMemberData}>();
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
          return this.MemberModel.setMemberCollection(_id, data);
        });
      }
    }

    public getOrganizationMembers(organizationId: string) {
      let cache = this.MemberModel.getOrganizationMembers(organizationId);
      if (cache) {
        let defer = this.$q.defer();
        defer.resolve(cache);
        return defer.promise;
      }
      return this.RestAPI.query({
        V2: 'v2',
        Type: 'organizations',
        Id: organizationId,
        Path1: 'members'
      })
      .$promise
      .then((members: IMemberData[]) => {
        return this.MemberModel.setOrganizationMembers(organizationId, members);
      });
    }

    public getDingId(userIds: string[], projectId: string) {
      let cache = hasResolved[projectId];
      if (!cache) {
        return this.DingRestAPI.query({
          Type: 'userIds',
          type: '_userId',
          corpId: DingCorpid,
          conditions: userIds.join(',')
        }, (data: any) => {
          hasResolved[projectId] = data;
        })
        .$promise;
      }else {
        let defer = this.$q.defer();
        defer.resolve(cache);
        return defer.promise;
      }
    }
  }

  angular.module('teambition').service('MemberAPI', MemberAPI);
}
