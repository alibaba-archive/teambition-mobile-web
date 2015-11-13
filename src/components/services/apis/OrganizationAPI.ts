/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IOrganizationData {
    _id: string;
    name: string;
    _creatorId: string;
    logo: string;
    description: string;
    category: string;
    pinyin: string;
    py: string;
    isPublic: boolean;
    dividers: {
      name: string;
      pos: number;
    }[];
    projectIds: string[];
    created: string;
    background: string;
    plan: {
      lastPaidTime: string;
      firstPaidTime: string;
      updated: string;
      created: string;
      expired: boolean;
      free: boolean;
      membersCount: number;
      days: number;
    };
    _defaultRoleId: number;
    _roleId: number;
  }

  export interface IOrganizationAPI {
    fetch: () => angular.IPromise<IOrganizationData[]>;
  }

  @inject([
    'OrganizationModel'
  ])
  class OrganizationAPI extends BaseAPI implements IOrganizationAPI {

    private OrganizationModel: IOrganizationModel;

    public fetch() {
      let cache = this.OrganizationModel.getAll();
      if (cache) {
        let deferred = this.$q.defer();
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'organizations'
      })
      .$promise
      .then((data: IOrganizationData[]) => {
        this.OrganizationModel.setAll(data);
        return data;
      });
    }
  }

  angular.module('teambition').service('OrganizationAPI', OrganizationAPI);
}
