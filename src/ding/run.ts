import DingService from '../components/bases/DingService';
import {MomentLocale} from '../components/bases/MomentLocale';
import {getParam} from '../components/bases/Utils';
import {app} from '../components/config/config';
import {
  IRootScope,
  IDingSignature
} from 'teambition';

declare let dd;
declare let zone: Zone;

export const RunFn = function(
  $http: any,
  $q: angular.IQService,
  $rootScope: IRootScope
) {

  let initWechat = () => {
    return $http.get('/weixin/dev/signature');
  };

  let initDD = () => {
    let DingCorpid = getParam(window.location.search, 'corpId');
    let defer = $q.defer();
    if (DingCorpid && DingCorpid.length) {
      $http.get(app.dingApiHost + `/signature?corpId=${DingCorpid}`)
      .then((data: any) => {
        let info: IDingSignature = data.data;
        DingService.initDing(info.agentId, info.corpId, info.timeStamp, info.nonceStr, info.signature);
        DingService.initOrganization(info._organizationId);
        DingService.$http = $http;
        defer.resolve();
      });
    }else {
      defer.resolve();
    }
    return defer.promise;
  };

  if (typeof dd === 'object') {
    $rootScope.pending = initDD();
  }else {
    let defer = $q.defer();
    defer.resolve();
    $rootScope.pending = defer.promise;
  }

  MomentLocale(app.LANGUAGE, moment);
};

RunFn.$inject = ['$http', '$q', '$rootScope'];
