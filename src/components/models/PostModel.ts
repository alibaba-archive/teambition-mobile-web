'use strict';
import BaseModel from '../bases/BaseModel';
import {postParser} from '../services/service';
import {IPostData} from 'teambition';

class PostModel extends BaseModel {
  public getProjectPostsCollection(projectId: string) {
    return this._get<IPostData[]>('posts', projectId);
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

  public addPostToCollection(post: IPostData) {
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
        let cache = this._get<IPostData[]>('posts', projectId);
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
    angular.forEach(posts, (post: IPostData, index: number) => {
      let result = postParser(post);
      result.fetchTime = Date.now();
      this._set(`post:detail`, post._id, result);
      results.push(result);
      $index.push(result._id);
    });
    this._set('post:index', _projectId, $index);
    return results;
  }
}

export default new PostModel();
