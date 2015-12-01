/// <reference path='components/interface/teambition.d.ts' />

import WechatService = Wechat.WechatService;
import MomentLocale = Locale.MomentLocale;
import DingService = Ding.DingService;

module teambition {
  'use strict';

  declare let webkitURL;
  declare let wx;
  declare let dd;
  declare let Spiderjs;
  declare let zone: Zone;

  export let Wechat: WechatService;
  export let Ding: DingService;
  export let DingCorpid: string;
  export let OrganizationId: string;

  export let spider: any;

  export interface IWxSignature {
    noncestr: string;
    signature: string;
    timestamp: number;
  }

  export interface IDingSignature {
    _organizationId: string;
    agentId: string;
    corpId: string;
    nonceStr: string;
    signature: string;
    timeStamp: number;
  }

  export let rootZone = zone.fork();

  export let $$injector: any;

  export let URL: URL = URL || webkitURL;

  export function noop() {
    return false;
  };

  // @ngInject
  var RunFn = function(
    $http: any,
    $q: angular.IQService,
    $rootScope: IRootScope,
    app: Iapp,
    Moment: moment.MomentStatic,
    getParameterByName: IGetParmByName
  ) {

    let initWechat = () => {
      return $http.get('/weixin/dev/signature');
    };

    let initDD = () => {
      DingCorpid = getParameterByName(window.location.search, 'corpId');
      let defer = $q.defer();
      if (DingCorpid && DingCorpid.length) {
        $http.get(app.dingApiHost + `/signature?corpId=${DingCorpid}`)
        .then((data: any) => {
          let info: IDingSignature = data.data;
          OrganizationId = info._organizationId;
          Ding = new DingService(info.agentId, info.corpId, info.timeStamp, info.nonceStr, info.signature);
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
        Wechat = new WechatService(app.wxid, data.noncestr, data.timestamp, data.signature);
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

    MomentLocale(app.LANGUAGE, Moment);
  };

  export let inject = (services: string[]) => {
    if (!services || !services.length) {
      return;
    }
    let service: any;
    return function(Target: any) {
      angular.module('teambition').run(['$injector', ($injector: any) => {
        $$injector = $injector;
        angular.forEach(services, (name: string, index: number) => {
          try {
            service = $injector.get(name);
            Target.prototype[name] = service;
          } catch (error) {
            console.error(error);
          }
        });
      }]);
    };
  };

  angular.module('teambition').run(RunFn);

  rootZone.run(() => {
    angular.element(document).ready(() => {
      angular.bootstrap(document, ['teambition']);
    });
  });
}
