'use strict';
import BaseAPI from '../../bases/BaseAPI';
import TagsModel from '../../models/TagsModel';
import {ITagsData} from 'teambition';

export class TagsAPI extends BaseAPI {

  public fetchByObjectId (type: string, _id: string) {
    let cache: any = TagsModel.getCollection(type, _id);
    let deferred = this.$q.defer<ITagsData[]>();
    if (cache) {
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
      let _tags = this.prepareTags(tags);
      TagsModel.setCollection(type, _id, _tags);
      return tags;
    });
  }

  public fetchByProject (_id: string) {
    let cache: any = TagsModel.getCollection(`tags:project`, _id);
    let deferred = this.$q.defer<{[index: string]: ITagsData}>();
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
      TagsModel.setCollection('tags:project', _id, _tags);
      return _tags;
    });
  }

  private prepareTags (tags: ITagsData[]) {
    let result: {
      [index: string]: ITagsData;
    };
    result = {};
    angular.forEach(tags, (tag: ITagsData, index: number) => {
      result[tag._id] = tag;
    });
    return result;
  }
}

angular.module('teambition').service('TagsAPI', TagsAPI);
