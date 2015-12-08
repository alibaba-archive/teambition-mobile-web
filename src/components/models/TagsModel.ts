'use strict';
import BaseModel from '../bases/BaseModel';
import {ITagsData} from 'teambition';

class TagsModel extends BaseModel {

  public getCollection(objectType: string, objectId: string) {
    return this._get<ITagsData[]>(`tags:${objectType}`, objectId);
  }

  public setCollection (objectType: string, objectId: string, collection: {[index: string]: ITagsData}) {
    let cache = this.getCollection(objectType, objectId);
    if (!cache) {
      this._set(`tags:${objectType}`, objectId, collection);
    }
  }
}

export default new TagsModel();
