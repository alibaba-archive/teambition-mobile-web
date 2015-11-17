/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMemberData {
    _id: string;
    name: string;
    avatarUrl: string;
    title?: string;
    isSelected?: boolean;
  }

  export interface IMemberAPI {
    fetch: (_projectId: string) => angular.IPromise<{[index: string]: IMemberData}>;
  }

  @inject([
    'MemberModel'
  ])
  class MemberAPI extends BaseAPI implements IMemberAPI {
    private MemberModel: IMemberModel;

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
  }

  angular.module('teambition').service('MemberAPI', MemberAPI);
}
