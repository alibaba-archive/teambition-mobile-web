'use strict';
import BaseModel from '../bases/BaseModel';
import {ILikeData} from 'teambition';

class LikeModel extends BaseModel {

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

export default new LikeModel();
