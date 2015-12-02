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

  let runing = false;

  export interface IWxSignature {
    noncestr: string;
    signature: string;
    timestamp: number;
  }

  export interface IDingSignature {
    _organizationId: string;
    corpId: string;
    agentId: string;
    nonceStr: string;
    signature: string;
    timeStamp: number;
  }

  export let rootZone = zone.fork();

  export let $$injector: any;

  export let URL: URL = URL || webkitURL;
  export let nobodyUrl = 'images/nobody-avator@2x.png';

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

    if (!runing) {
      let initWechat = () => {
        return $http.get('/weixin/dev/signature');
      };

      let initDD = () => {
        DingCorpid = getParameterByName(window.location.search, 'corpId');
        let defer = $q.defer();
        $http.get(app.dingApiHost + `/signature?corpId=${DingCorpid}`)
        .then((data: any) => {
          let info: IDingSignature = data.data;
          OrganizationId = info._organizationId;
          Ding = new DingService(info.agentId, info.corpId, info.timeStamp, info.nonceStr, info.signature);
          Ding.$http = $http;
          defer.resolve();
        });
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

      // $http.defaults.headers.common.Authorization = 'OAuth2 JL_N0f_OP6dpvTOKjQe8e7wCi5w=MCN3vfXo99625ad6abf2bf03774c86d6ba205ceff8da45c6553c9bd488f5d80c9ac49ebb191697aad985141dc8e94aa064f30e558f3a90194505323a58fe85cb162ee6df2554f253692fc09aced2bb4475ef0f1d5e68f1be529842eec4ff020100829d74d0f89c0c0501be279ff8a08bf4cb6c7b';

      MomentLocale(app.LANGUAGE, Moment);

      runing = true;
    }
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
