/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEntryModel extends IDetailModel {
    getEntry(namespace: string): IEntryData;
    setEntry(namespace: string, entry: IEntryData | IEntryCategoriesData): void;
  }

  class EntryModel extends DetailModel implements IEntryModel {
    public getEntry(namespace: string) {
      return this._get<IEntryData>(namespace, null);
    }

    public setEntry(namespace: string, entry: IEntryData | IEntryCategoriesData) {
      if (!this.getEntry(namespace)) {
        this._set(namespace, null, entry);
      }
    }

  }

  angular.module('teambition').service('EntryModel', EntryModel);
}
