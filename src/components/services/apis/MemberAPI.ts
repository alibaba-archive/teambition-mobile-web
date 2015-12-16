'use strict';
import {inject} from '../../bases/Utils';
import BaseAPI from '../../bases/BaseAPI';
import {DingRestAPI} from '../service';
import MemberModel from '../../models/MemberModel';
import {IMemberData} from 'teambition';
import {Ding} from '../../../Run';

let hasResolved = {};

@inject([
  'DingRestAPI'
])
export class MemberAPI extends BaseAPI {
  private DingRestAPI: DingRestAPI;

  public fetch(_id: string) {
    let members = MemberModel.getMemberCollection(_id);
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
        fields: this.fields.memberFileds
      })
      .$promise
      .then((data: IMemberData[]) => {
        return MemberModel.setMemberCollection(_id, data);
      });
    }
  }

  public getOrganizationMembers(organizationId: string) {
    let cache = MemberModel.getOrganizationMembers(organizationId);
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
      return MemberModel.setOrganizationMembers(organizationId, members);
    });
  }

  public getDingId(userIds: string[], projectId: string) {
    let cache = hasResolved[projectId];
    let DingCorpid = Ding.corpId;
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
