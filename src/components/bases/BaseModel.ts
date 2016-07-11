'use strict';

import {inject} from './Utils';
const __notPatch = ['$promise', '_id'];

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
      let value = this.Cache.get<T>(namespace) || Object.create(null);
      let keys = Object.keys(patch);
      for (let index = 0; index < keys.length; index++) {
        let element = keys[index];
        if (__notPatch.indexOf(element) === -1) {
          value[element] = patch[element];
        }
      }
      this._set(type, id, value);
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
