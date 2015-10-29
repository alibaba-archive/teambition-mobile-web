/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IMemberModel {
    getMemberCollection(projectId: string): IMemberData[];
    setMemberCollection(projectId: string, collection: IMemberData[]): void;
  }

  class MemberModel extends BaseModel implements IMemberModel {
    public getMemberCollection(projectId: string) {
      return this._get<IMemberData[]>('members', projectId);
    }

    public setMemberCollection(projectId: string, collection: IMemberData[]) {
      let cache = this.getMemberCollection(projectId);
      if (!cache) {
        this._set('members', projectId, collection);
      }
    }
  }

  angular.module('teambition').service('MemberModel', MemberModel);
}
