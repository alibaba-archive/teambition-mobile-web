/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostModel extends IDetailModel {
    getProjectPostsCollection(projectId: string): IPostDataParsed[];
    setProjectPostsCollection(projectId: string, collection: IPostData[]): IPostDataParsed[];
    addPostToCollection(post: IPostDataParsed): void;
    removePost(projectId: string, id: string): void;
  }

  class PostModel extends DetailModel implements IPostModel {
    public getProjectPostsCollection(projectId: string) {
      return this._get<IPostDataParsed[]>('posts', projectId);
    }

    public setProjectPostsCollection(projectId: string, collection: IPostData[]) {
      let cache = this.getProjectPostsCollection(projectId);
      if (!cache) {
        let results = this.preparePosts(projectId, collection);
        this._set('posts', projectId, results);
        return results;
      }
      return cache;
    }

    public addPostToCollection(post: IPostDataParsed) {
      let $index = this._get<string[]>('post:index', post._projectId);
      if ($index && $index.indexOf(post._id) === -1) {
        let collection = this.getProjectPostsCollection(post._projectId);
        collection.push(post);
        $index.push(post._id);
      }
    }

    public removePost(projectId: string, id: string) {
      let $index = this._get<string[]>('post:index', projectId);
      console.log(projectId, id, $index);
      if ($index) {
        let position = $index.indexOf(id);
        if (position !== -1) {
          let cache = this._get<IPostDataParsed[]>('posts', projectId);
          cache.splice(position, 1);
          $index.splice(position, 1);
        }
      }
    }

    private preparePosts (_projectId: string, posts: IPostData[]) {
      if (!posts.length) {
        this._set('post:index', _projectId, []);
        return [];
      }
      let results = [];
      let $index = [];
      angular.forEach(posts, (post: IPostDataParsed, index: number) => {
        let result = this.postParser(post);
        result.fetchTime = Date.now();
        this.setDetail(`post:detail:${post._id}`, result);
        results.push(result);
        $index.push(result._id);
      });
      this._set('post:index', _projectId, $index);
      return results;
    }
  }

  angular.module('teambition').service('PostModel', PostModel);
}
