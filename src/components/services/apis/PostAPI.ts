/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostAPI {
    fetchAll: (_projectId: string) => angular.IPromise<any>;
  }

  @inject([
    'PostModel'
  ])
  class PostAPI extends BaseAPI implements IPostAPI {
    private PostModel: IPostModel;

    public fetchAll (_projectId: string) {
      let cache = this.PostModel.getProjectPostsCollection(_projectId);
      let deferred = this.$q.defer<IPostDataParsed[]>();
      if (cache) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      return this.RestAPI.query({
        Type: 'projects',
        Id: _projectId,
        Path1: 'posts',
        fields: this.queryFileds.postFileds
      })
      .$promise
      .then((data: IPostData[]) => {
        let result = this.PostModel.setProjectPostsCollection(_projectId, data);
        return result;
      });
    }

  }

  angular.module('teambition').service('PostAPI', PostAPI);
}
