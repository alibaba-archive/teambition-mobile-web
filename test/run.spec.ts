/// <reference path='../src/components/interface/teambition.d.ts' />
import dingSignature from './mock/dingsignature.mock';

export default beforeEach(() => {
  angular.mock.module('teambition');
  angular.mock.inject((
    $httpBackend: angular.IHttpBackendService
  ) => {
    $httpBackend.whenGET('http://ding.project.ci/signature?corpId=').respond(dingSignature);
    teambition.Ding = new Ding.DingService(
      dingSignature.agentId,
      dingSignature.corpId,
      dingSignature.timeStamp,
      dingSignature.nonceStr,
      dingSignature.signature
    );
  });
});
