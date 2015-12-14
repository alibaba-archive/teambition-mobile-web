'use strict';
import PostModel from '../../models/PostModel';
import BaseAPI from '../../bases/BaseAPI';
import {IPostData} from 'teambition';

export class PostAPI extends BaseAPI {

  public fetchAll (_projectId: string) {
    let cache = PostModel.getProjectPostsCollection(_projectId);
    let deferred = this.$q.defer<IPostData[]>();
    if (cache) {
      deferred.resolve(cache);
      return deferred.promise;
    }
    return this.RestAPI.query({
      Type: 'projects',
      Id: _projectId,
      Path1: 'posts',
      fields: this.fields.postFileds
    })
    .$promise
    .then((data: IPostData[]) => {
      let result = PostModel.setProjectPostsCollection(_projectId, data);
      return result;
    });
  }

}

angular.module('teambition').service('PostAPI', PostAPI);
