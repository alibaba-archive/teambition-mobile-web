'use strict';
import BaseModel from '../bases/BaseModel';
import {IOrganizationData} from 'teambition';

class OrganizationModel extends BaseModel {
  public setOne(organization: IOrganizationData) {
    if (organization) {
      this._set('organization', organization._id, organization);
    }
  }

  public getOne(id: string) {
    return this._get<IOrganizationData>('organization', id);
  }

  public setAll(organizations: IOrganizationData[]) {
    if (organizations && organizations.length) {
      angular.forEach(organizations, (organization: IOrganizationData) => {
        this.setOne(organization);
      });
      this._set('organizations', null, organizations);
    }
  }

  public getAll() {
    return this._get<IOrganizationData[]>('organizations');
  }
}

export default new OrganizationModel();
