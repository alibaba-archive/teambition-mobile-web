'use strict';
import BaseAPI from '../../bases/BaseAPI';
import EntryModel from '../../models/EntryModel';
import {IEntryData, IEntryCategoriesData} from 'teambition';

export class EntryAPI extends BaseAPI {

  public fetch(_id: string) {
    let cache = EntryModel.getEntry(`entry:detail:${_id}`);
    let deferred = this.$q.defer<IEntryData>();
    if (cache) {
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.RestAPI.get({
      Type: 'entries',
      Id: _id
    })
    .$promise
    .then((data: IEntryData) => {
      return this.getEntryDetail(data);
    });
  }

  private getEntryDetail(entry: IEntryData) {
    let _id = entry._id;
    let _catId = entry._entryCategoryId;
    let deferred = this.$q.defer<IEntryData>();
    let cache = EntryModel.getEntry(`entry:categories:${_catId}`);
    entry.type = entry.type === -1 ? 0 : entry.type;
    if (cache) {
      entry.title = cache.title;
      deferred.resolve(entry);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: 'entryCategories',
      _projectId: entry._projectId,
      fields: this.fields.entryFileds
    })
    .$promise
    .then((data: IEntryCategoriesData[]) => {
      let result: IEntryData;
      for (let index = 0; index < data.length; index++) {
        let category = data[index];
        EntryModel.setEntry(`entry:categories:${category._id}`, category);
        if (category._id === _catId) {
          entry.title = category.title;
          EntryModel.setEntry(`entry:detail:${_id}`, entry);
          result = entry;
          break;
        }
      }
      return result;
    });
  }
}

angular.module('teambition').service('EntryAPI', EntryAPI);
