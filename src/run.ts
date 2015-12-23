import DingService from './components/bases/DingService';
import WechatService from './components/bases/WechatService';
import {MomentLocale} from './components/bases/MomentLocale';
import {getParam} from './components/bases/Utils';
import {app} from './components/config/config';
import {
  IRootScope,
  IDingSignature,
  IWxSignature
} from 'teambition';

declare let wx;
declare let dd;
declare let zone: Zone;

export let Wechat = WechatService;
export let Ding = typeof dd === 'undefined' ? undefined : DingService;

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
        Ding.initDing(info.agentId, info.corpId, info.timeStamp, info.nonceStr, info.signature);
        Ding.initOrganization(info._organizationId);
        Ding.$http = $http;
        defer.resolve();
      });
    }else {
      defer.resolve();
    }
    return defer.promise;
  };

  if (typeof wx === 'object') {
    $rootScope.pending = initWechat()
    .then((data: IWxSignature) => {
      Wechat.init(app.wxid, data.noncestr, data.timestamp, data.signature);
    })
    .catch((reason: any) => {
      console.log('error', '微信SDK初始化失败', '您不能正常使用分享项目给好友功能');
    });
  }else if (typeof dd === 'object') {
    $rootScope.pending = initDD();
  }else {
    let defer = $q.defer();
    defer.resolve();
    $rootScope.pending = defer.promise;
  }

  MomentLocale(app.LANGUAGE, moment);
};

RunFn.$inject = ['$http', '$q', '$rootScope'];
