'use strict';
import {inject} from '../../bases/Utils';
import {Iapp} from 'teambition';

interface IRestPaths {
  V2?: string;
  Type: string;
  Id?: string;
  Path1?: string;
  Path2?: string;
  Path3?: string;
  _boundToObjectId?: string;
  fields?: string;
  [index: string]: any;
}

interface IRestMethod {
  get?: (...params: any[]) => any;
  query?: (...params: any[]) => any;
  update?: (...params: any[]) => any;
  delete?: (...params: any[]) => any;
  post?: (...params: any[]) => any;
  save?: (...params: any[]) => any;
}

let fetchTimes = 0;

let fetchingMap: {
  [index: string]: angular.resource.IResource<any>;
};
fetchingMap = {};

let RestCallback = function(path: string, callback?: Function) {
  return function() {
    fetchTimes ++;
    fetchingMap[path] = null;
    if (typeof(callback) === 'function') {
      callback.apply(null, arguments);
    }
  };
};

let replaceCallback = (args: any[], path: string): any[] => {
  let length = args.length;
  let _args = [];
  let callbacksCount = 0;
  for (let i = 0; i < length; i++) {
    let ele = args[i];
    if (typeof(ele) === 'function') {
      callbacksCount ++;
      if (callbacksCount < 2) {
        _args.push(RestCallback(path, ele));
      }
    }else {
      _args.push(ele);
    }
  };
  switch (callbacksCount) {
    case 0:
      let callback = RestCallback(path);
      _args.push(callback, callback);
      break;
    case 1:
      _args.push(RestCallback(path));
      break;
  }
  return _args;
};

let request = (target: any, key: string, value: any) => {
  return {
    value: function (...args: any[]) {
      let arg: string = args.map((a: any) => {
        if (typeof(a) !== 'function') {
          return JSON.stringify(a);
        }
      }).join();
      let fetching = fetchingMap[arg];
      if (fetching) {
        return fetching;
      }else {
        let _arguments = replaceCallback(args, arg);
        let result = value.value.apply(this, _arguments);
        // console.log(`Call: ${key}(${arg}) => `, result);
        fetchingMap[arg] = result;
        return result;
      }
    }
  };
};

@inject([
  '$resource',
  'app'
])
export class RestAPI {
  private resource: IRestMethod;
  private $resource: angular.resource.IResourceService;
  private app: Iapp;
  // @ngInject
  constructor() {
    // 大写开头是为了避免和后端的接口的 key 冲突
    let path: string = '/:V2/:Type/:Id/:Path1/:Path2/:Path3';
    this.resource = this.$resource(this.app.apiHost + path, null , {
      query: {
        method: 'GET',
        isArray: true,
        withCredentials: true
      },
      get: {
        method: 'GET',
        withCredientials: true
      },
      update: {
        method: 'PUT',
        withCredientials: true
      },
      save: {
        method: 'POST',
        withCredientials: true
      },
      post: {
        method: 'POST',
        widthCredientials: true,
        isArray: true
      },
      'delete': {
        method: 'DELETE',
        withCredientials: true
      }
    });
  }

  @request
  public get(paths: IRestPaths, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.get.apply(null, arguments);
  }

  @request
  public query(paths: IRestPaths, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.query.apply(null, arguments);
  }

  @request
  public update(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.update.apply(null, arguments);
  }

  @request
  public save(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.save.apply(null, arguments);
  }

  @request
  public post(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.post.apply(null, arguments);
  }

  @request
  public delete(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.delete.apply(null, arguments);
  }
}

@inject([
  '$resource',
  'app'
])
export class DingRestAPI {
  private resource: IRestMethod;
  private $resource: angular.resource.IResourceService;
  private app: Iapp;
  // @ngInject
  constructor() {
    // 大写开头是为了避免和后端的接口的 key 冲突
    let path: string = '/:V2/:Type/:Id/:Path1/:Path2/:Path3';
    this.resource = this.$resource(this.app.dingApiHost + path, null , {
      query: {
        method: 'GET',
        isArray: true,
        withCredentials: true
      },
      get: {
        method: 'GET',
        withCredientials: true
      },
      update: {
        method: 'PUT',
        withCredientials: true
      },
      save: {
        method: 'POST',
        withCredientials: true
      },
      post: {
        method: 'POST',
        widthCredientials: true,
        isArray: true
      },
      'delete': {
        method: 'DELETE',
        withCredientials: true
      }
    });
  }

  @request
  public get(paths: IRestPaths, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.get.apply(null, arguments);
  }

  @request
  public query(paths: IRestPaths, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.query.apply(null, arguments);
  }

  @request
  public update(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.update.apply(null, arguments);
  }

  @request
  public save(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.save.apply(null, arguments);
  }

  @request
  public post(paths: IRestPaths, data?: any, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.post.apply(null, arguments);
  }

  @request
  public delete(paths: IRestPaths, successCallback?: (data: any) => any, errorCallback?: (err: Error) => any) {
    return this.resource.delete.apply(null, arguments);
  }
}

angular.module('teambition')
.service('RestAPI', RestAPI)
.service('DingRestAPI', DingRestAPI);
