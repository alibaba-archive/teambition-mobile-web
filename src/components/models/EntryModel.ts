'use strict';
import BaseModel from '../bases/BaseModel';
import {IEntryData, IEntryCategoriesData} from 'teambition';

class EntryModel extends BaseModel {
  public getEntry(namespace: string) {
    return this._get<IEntryData>(namespace, null);
  }

  public setEntry(namespace: string, entry: IEntryData | IEntryCategoriesData) {
    if (!this.getEntry(namespace)) {
      this._set(namespace, null, entry);
    }
  }
}

export default new EntryModel();
