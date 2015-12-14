import dingSignature from './mock/dingsignature.mock';
import {DingService} from '../src/components/bases/DingService';
import {app} from '../src/app';

beforeEach(() => {
  angular.mock.module('teambition');
  angular.mock.inject((
    $httpBackend: angular.IHttpBackendService
  ) => {
    $httpBackend.whenGET(`${app.dingApiHost}/signature?corpId=dinga9c60a58f418f010`).respond(dingSignature);
  });
});

export const Ding = new DingService(
  dingSignature.agentId,
  dingSignature.corpId,
  dingSignature.timeStamp,
  dingSignature.nonceStr,
  dingSignature.signature
);
