/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface ILikeModel {
    set(_boundToObjectId: string, likeData: ILikeData): ILikeData;
    get(_boundToObjectId: string): ILikeData;
    update(_boundToObjectId: string, patch: any): void;
  }

  class LikeModel extends BaseModel implements ILikeModel {

    public set(_boundToObjectId: string, likeData: ILikeData) {
      this._set('like', _boundToObjectId, likeData);
      return likeData;
    }

    public get(_boundToObjectId: string) {
      return this._get<ILikeData>('like', _boundToObjectId);
    }

    public update(_boundToObjectId: string, patch: any) {
      this._updateObj('like', _boundToObjectId, patch);
    }
  }

  angular.module('teambition').service('LikeModel', LikeModel);
}
