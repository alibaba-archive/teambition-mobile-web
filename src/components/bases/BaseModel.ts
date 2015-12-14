import {inject} from './Utils';

'use strict';
const __notPatch = ['$promise'];

@inject([
  'Cache'
])
export default class BaseModel {
  'use strict';
  private Cache: angular.ICacheObject;

  protected _add(type: string, id: string, content: any) {
    this._set(type, id, content);
  }

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
      if (value) {
        for (let index = 0; index < keys.length; index++) {
          let element = keys[index];
          if (__notPatch.indexOf(element) === -1) {
            value[element] = patch[element];
          }
        }
      }
      return value;
    }
  }

  protected _delete(type: string, id: string) {
    let namespace = id ? `${type}:${id}` : type;
    this._updateObj(namespace, null, {
      deleted: true
    });
    this.Cache.remove(namespace);
  }
}
