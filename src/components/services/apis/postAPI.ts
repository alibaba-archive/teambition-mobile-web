/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostAPI {
    fetchAll: (_projectId: string) => angular.IPromise<any>;
  }

  @inject([
    'Cache',
    'postParser'
  ])
  class PostAPI extends BaseAPI implements IPostAPI {
    private Cache: angular.ICacheObject;
    private postParser: IPostParser;

    public fetchAll (_projectId: string) {
      let cache = this.Cache.get(`posts:${_projectId}`);
      let deferred = this.$q.defer();
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
      .then((data: IPostDataParsed[]) => {
        let result = this.preparePosts(data, _projectId);
        return result;
      });
    }

    private preparePosts (posts: IPostDataParsed[], _projectId: string) {
      if (!posts.length) {
        return [];
      }
      let results = [];
      angular.forEach(posts, (post: IPostDataParsed, index: number) => {
        let result = this.postParser(post);
        result.fetchTime = Date.now();
        this.Cache.put(`post:detail:${post._id}`, result);
        results.push(result);
      });
      this.Cache.put(`posts:${_projectId}`, results);
      return results;
    }
  }

  angular.module('teambition').service('PostAPI', PostAPI);
}
