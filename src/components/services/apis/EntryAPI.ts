/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEntryData {
    _id: string;
    _projectId: string;
    _creatorId: string;
    _entryCategoryId: string;
    content: string;
    note: string;
    amount: number;
    status: string;
    type: number;
    date: string;
    involveMembers: string[];
    tagIds: string[];
    visiable: string;
    created: string;
    isArchived: boolean;
    isFavorite: boolean;
    title?: string;
  }

  export interface IEntryCategoriesData {
    _id: string;
    _projectId: string;
    title: string;
    type: number;
  }

  export interface IEntryAPI {
    fetch(_entryId: string): angular.IPromise<IEntryData>;
  }

  @inject([
    'Cache'
  ])
  class EntryAPI extends BaseAPI implements IEntryAPI {
    private Cache: angular.ICacheObject;

    public fetch(_id: string) {
      let cache = this.Cache.get<IEntryData>(`entry:detail:${_id}`);
      let deferred = this.$q.defer();
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
      let deferred = this.$q.defer();
      let cache = this.Cache.get<IEntryCategoriesData>(`entry:categories:${_catId}`);
      entry.type = entry.type === -1 ? 0 : entry.type;
      if (cache) {
        entry.title = cache.title;
        deferred.resolve(entry);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'entryCategories',
        _projectId: entry._projectId,
        fields: this.queryFileds.entryFileds
      })
      .$promise
      .then((data: IEntryCategoriesData[]) => {
        let result: IEntryData;
        for (let index = 0; index < data.length; index++) {
          let category = data[index];
          this.Cache.put(`entry:categories:${category._id}`, category);
          if (category._id === _catId) {
            entry.title = category.title;
            this.Cache.put(`entry:detail:${_id}`, entry);
            result = entry;
            break;
          }
        }
        return result;
      });
    }
  }

  angular.module('teambition').service('EntryAPI', EntryAPI);
}
