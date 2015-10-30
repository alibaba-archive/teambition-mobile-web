/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    '$http',
    '$q',
    'RestAPI',
    'queryFileds'
  ])
  export class BaseAPI {
    protected $http: angular.IHttpService;
    protected $q: angular.IQService;
    protected RestAPI: IRestAPI;
    protected queryFileds;
  }
}
