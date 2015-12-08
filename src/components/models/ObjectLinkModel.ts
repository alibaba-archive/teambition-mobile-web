'use strict';
import BaseModel from '../bases/BaseModel';
import {ILinkedData} from 'teambition';

class ObjectLinkModel extends BaseModel {
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

export default new ObjectLinkModel();
