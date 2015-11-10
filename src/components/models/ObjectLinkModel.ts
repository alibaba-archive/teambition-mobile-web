/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IObjectLinkModel {
    set(link: ILinkedData): void;
    update(parentType: string, parentId: string, patch: any): void;
    setLinks(parentType: string, parentId: string, links: ILinkedData[]): void;
    getLinks(parentType: string, parentId: string): ILinkedData[];
  }

  class ObjectLinkModel extends BaseModel implements IObjectLinkModel {
    public set(link: ILinkedData) {
      this._set('link', link._id, link);
    }

    public update(parentType: string, parentId: string, patch: any) {
      this._updateObj(`${parentType}:link`, parentId, patch);
    }

    public setLinks(parentType: string, parentId: string, links: ILinkedData[]) {
      angular.forEach(links, (link: ILinkedData) => {
        this.set(link);
      });
      this._set(`${parentType}:link`, parentId, links);
    }

    public getLinks(parentType: string, parentId: string) {
      return this._get<ILinkedData[]>(`${parentType}:link`, parentId);
    }
  }

  angular.module('teambition').service('ObjectLinkModel', ObjectLinkModel);
}
