/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITagsModel {
    getCollection(objectType: string, objectId: string): ITagsData[] | {[index: string]: ITagsData};
    setCollection (objectType: string, objectId: string, collection: ITagsData[] | {[index: string]: ITagsData}): void;
  }

  class TagsModel extends BaseModel implements ITagsModel {

    public getCollection(objectType: string, objectId: string) {
      return this._get<ITagsData[]>(`tags:${objectType}`, objectId);
    }

    public setCollection (objectType: string, objectId: string, collection: ITagsData[]) {
      let cache = this.getCollection(objectType, objectId);
      if (!cache) {
        this._set(`tags:${objectType}`, objectId, collection);
      }
    }
  }

  angular.module('teambition').service('TagsModel', TagsModel);
}
