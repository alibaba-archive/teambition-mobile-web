/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostAPI {
    fetchAll: (_projectId: string) => angular.IPromise<any>;
  }

  angular.module('teambition').factory('postAPI',
  // @ngInject
  (
    $q: angular.IQService,
    RestAPI: IRestAPI,
    Cache: angular.ICacheObject,
    postParser: IPostParser,
    queryFileds: IqueryFileds
  ) => {

    let preparePosts = (posts: IPostDataParsed[], _projectId: string) => {
      if (!posts.length) {
        return [];
      }
      let results = [];
      angular.forEach(posts, (post: IPostDataParsed, index: number) => {
        let result = postParser(post);
        result.fetchTime = Date.now();
        Cache.put(`post:detail:${post._id}`, result);
        results.push(result);
      });
      Cache.put(`posts:${_projectId}`, results);
      return results;
    };

    return <IPostAPI>{
      fetchAll: (_projectId: string) => {
        let cache = Cache.get(`posts:${_projectId}`);
        let deferred = $q.defer();
        if (cache) {
          deferred.resolve(cache);
          return deferred.promise;
        }
        return RestAPI.query({
          Type: 'projects',
          Id: _projectId,
          Path1: 'posts',
          fields: queryFileds.postFileds
        })
        .$promise
        .then((data: IPostDataParsed[]) => {
          let result = preparePosts(data, _projectId);
          return result;
        });
      }
    };
  });
}
