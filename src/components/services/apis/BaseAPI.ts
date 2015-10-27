/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    '$http',
    '$q',
    'RestAPI'
  ])
  export class BaseAPI {
    protected $http: angular.IHttpService;
    protected $q: angular.IQService;
    protected RestAPI: IRestAPI;
  }
}
