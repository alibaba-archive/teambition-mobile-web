/// <reference path="../interface/teambition.d.ts" />
// import {inject} from 'teambition';

const __notPatch = ['$promise'];

// @inject([
//   'Cache'
// ])
export default class BaseModel {
  'use strict';
  private Cache: angular.ICacheObject;

  public set(type: string, id: string, content: any) {
    this.Cache.put(`${type}:${id}`, content);
  }

  public updateObj(type: string, id: string, patch: any) {
    if (typeof patch === 'object') {
      let value = this.Cache.get(`${type}:${id}`);
      let keys = Object.keys(patch);
      for (let index = 0; index < keys.length; index++) {
        let element = keys[index];
        if (__notPatch.indexOf(element) === -1) {
          value[element] = patch[element];
        }
      }
    }
  }
}
