/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IPostModel extends IDetailModel {
    getProjectPostsCollection(projectId: string): IPostDataParsed[];
    setProjectPostsCollection(projectId: string, collection: IPostDataParsed[]): void;
  }

  class PostModel extends DetailModel implements IPostModel {
    public getProjectPostsCollection(projectId: string) {
      return this._get<IPostDataParsed[]>('posts', projectId);
    }

    public setProjectPostsCollection(projectId: string, collection: IPostDataParsed[]) {
      let cache = this.getProjectPostsCollection(projectId);
      if (!cache) {
        this._set('posts', projectId, collection);
      }
    }
  }

  angular.module('teambition').service('PostModel', PostModel);
}
