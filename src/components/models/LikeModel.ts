/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeModel {
    set(_boundToObjectId: string, likeData: ILikeData): ILikeDataParsed;
    get(_boundToObjectId: string): ILikeDataParsed;
    update(_boundToObjectId: string, patch: any): void;
  }

  @inject([
    'likeParser'
  ])
  class LikeModel extends BaseModel implements ILikeModel {
    private likeParser: ILikeParser;

    public set(_boundToObjectId: string, likeData: ILikeData) {
      let result = this.likeParser(likeData);
      this._set('like', _boundToObjectId, result);
      return result;
    }

    public get(_boundToObjectId: string) {
      return this._get<ILikeDataParsed>('like', _boundToObjectId);
    }

    public update(_boundToObjectId: string, patch: any) {
      this._updateObj('like', _boundToObjectId, patch);
    }
  }

  angular.module('teambition').service('LikeModel', LikeModel);
}
