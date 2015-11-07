/// <reference path="../interface/teambition.d.ts" />

module teambition {
  'use strict';
  const __notPatch = ['$promise'];

  @inject([
    'Cache'
  ])
  export class BaseModel {
    'use strict';
    private Cache: angular.ICacheObject;

    protected _set(type: string, id: string, content: any) {
      let namespace = id ? `${type}:${id}` : type;
      if (!this.Cache.get(namespace)) {
        this.Cache.put(namespace, content);
      }
    }

    protected _get<T>(type: string, id?: string) {
      let namespace = id ? `${type}:${id}` : type;
      return this.Cache.get<T>(namespace);
    }

    protected _updateObj<T>(type: string, id: string, patch: any) {
      if (typeof patch === 'object') {
        let namespace = id ? `${type}:${id}` : type;
        let value = this.Cache.get<T>(namespace);
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
