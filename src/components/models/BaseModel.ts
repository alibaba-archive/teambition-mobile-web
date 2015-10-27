/// <reference path="../interface/teambition.d.ts" />

module teambition {
  'use strict';
  const __notPatch = ['$promise'];

  @inject([
    'Cache'
  ])
  export class BaseModel {
    'use strict';
    protected Cache: angular.ICacheObject;

    protected _set(type: string, id: string, content: any) {
      if (!this.Cache.get(`${type}:${id}`)) {
        this.Cache.put(`${type}:${id}`, content);
      }
    }

    protected _updateObj<T>(type: string, id: string, patch: any) {
      if (typeof patch === 'object') {
        let value = this.Cache.get<T>(`${type}:${id}`);
        let keys = Object.keys(patch);
        for (let index = 0; index < keys.length; index++) {
          let element = keys[index];
          if (__notPatch.indexOf(element) === -1) {
            value[element] = patch[element];
          }
        }
        return value;
      }
    }
  }
}
