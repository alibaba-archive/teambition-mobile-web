/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ITagsData {
    _creatorId: string;
    _id: string;
    _projectId: string;
    color: string;
    created: string;
    isArchived: boolean;
    name: string;
    updated: string;
  }

  export interface ITagsAPI {
    fetchByObjectId(objectType: string, objectId: string): angular.IPromise<ITagsData[]>;
    fetchByProject(projectId: string): angular.IPromise<ITagsData[]>;
  }

  @inject([
    'Cache'
  ])
  class TagsAPI extends BaseAPI implements ITagsAPI {
    private Cache: angular.ICacheObject;

    public fetchByObjectId (type: string, _id: string) {
      let cache = this.Cache.get<ITagsData[]>(`tags:${type}:${_id}`);
      let deferred = this.$q.defer<ITagsData[]>();
      if (cache && cache.length) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: type,
        Id: _id,
        Path1: 'tags'
      })
      .$promise
      .then((tags: ITagsData[]) => {
        this.Cache.put(`tags:${type}:${_id}`, tags);
        return tags;
      });
    }

    public fetchByProject (_id: string) {
      let cache = this.Cache.get<ITagsData[]>(`tags:project:${_id}`);
      let deferred = this.$q.defer<ITagsData[]>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'projects',
        Id: _id,
        Path1: 'tags'
      })
      .$promise
      .then((tags: ITagsData[]) => {
        let _tags = this.prepareTags(tags);
        this.Cache.put(`tags:project:${_id}`, _tags);
        return _tags;
      });
    }

    private prepareTags (tags: ITagsData[]) {
      let result = {};
      angular.forEach(tags, (tag: ITagsData, index: number) => {
        result[tag._id] = tag;
      });
      return result;
    }
  }

  angular.module('teambition').service('TagsAPI', TagsAPI);
}
