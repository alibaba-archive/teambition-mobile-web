'use strict';
import BaseAPI from '../../bases/BaseAPI';
import OrganizationModel from '../../models/OrganizationModel';
import {IOrganizationData} from 'teambition';

export class OrganizationAPI extends BaseAPI {

  public fetch() {
    let cache = OrganizationModel.getAll();
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
      OrganizationModel.setAll(data);
      return data;
    });
  }
}

angular.module('teambition').service('OrganizationAPI', OrganizationAPI);
