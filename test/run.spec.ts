import dingSignature from './mock/dingsignature.mock';
import {app} from '../src/ding';

beforeEach(() => {
  angular.mock.module('teambition');
  angular.mock.inject((
    $httpBackend: angular.IHttpBackendService
  ) => {
    $httpBackend.whenGET(`${app.dingApiHost}/signature?corpId=dinga9c60a58f418f010`).respond(dingSignature);
  });
});

