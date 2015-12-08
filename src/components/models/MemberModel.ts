'use strict';
import BaseModel from '../bases/BaseModel';
import {nobodyUrl} from '../config/config';
import {IMemberData} from 'teambition';

class MemberModel extends BaseModel {
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
      memberMap['0'] = {
        _id: '0',
        name: '待认领',
        avatarUrl: nobodyUrl
      };
      this._set('members', projectId, memberMap);
      return memberMap;
    }else {
      return cache;
    }
  }

  public setOrganizationMembers(organizationId: string, members: IMemberData[]) {
    let cache = this.getOrganizationMembers(organizationId);
    if (!cache) {
      let memberData: {
        [index: string]: IMemberData;
      };
      memberData = {};
      angular.forEach(members, (member: IMemberData) => {
        memberData[member._id] = member;
      });
      this._set('members:organization', organizationId, memberData);
      return memberData;
    }else {
      return cache;
    }
  }

  public getOrganizationMembers(organizationId: string) {
    return this._get<{[index: string]: IMemberData}>('members:organization', organizationId);
  }

  public addMember(projectId: string, member: IMemberData) {
    let cache = this.getMemberCollection(projectId);
    if (cache && !cache[member._id]) {
      cache[member._id] = member;
    }
  }
}

export default new MemberModel();
