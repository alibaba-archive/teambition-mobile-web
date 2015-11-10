/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMemberModel {
    getMemberCollection(projectId: string): {[index: string]: IMemberData};
    setMemberCollection(projectId: string, collection: IMemberData[]): {[index: string]: IMemberData};
  }

  class MemberModel extends BaseModel implements IMemberModel {
    public getMemberCollection(projectId: string) {
      return this._get<{[index: string]: IMemberData}>('members', projectId);
    }

    public setMemberCollection(projectId: string, collection: IMemberData[]) {
      let cache = this.getMemberCollection(projectId);
      if (!cache) {
        let memberMap: {
          [index: string]: IMemberData
        };
        memberMap = {};
        angular.forEach(collection, (member: IMemberData) => {
          memberMap[member._id] = member;
        });
        this._set('members', projectId, memberMap);
        return memberMap;
      }else {
        return cache;
      }
    }
  }

  angular.module('teambition').service('MemberModel', MemberModel);
}
