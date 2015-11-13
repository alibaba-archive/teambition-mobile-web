/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IOrganizationModel {
    setOne(organization: IOrganizationData): void;
    getOne(id: string): IOrganizationData;
    setAll(organizations: IOrganizationData[]): void;
    getAll(): IOrganizationData[];
  }

  class OrganizationModel extends BaseModel implements IOrganizationModel {
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

  angular.module('teambition').service('OrganizationModel', OrganizationModel);
}
