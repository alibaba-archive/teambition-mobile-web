'use strict';
import {inject} from './Utils';
import {RestAPI} from '../services/apis/RESTful';
import {fields} from '../services/apis/fields';

@inject([
  '$http',
  '$q',
  'RestAPI'
])
export default class BaseAPI {
  protected $http: angular.IHttpService;
  protected $q: angular.IQService;
  protected RestAPI: RestAPI;
  protected fields = fields;
}
