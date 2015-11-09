/// <reference path='components/interface/teambition.d.ts' />

import WechatService = Wechat.WechatService;
import MomentLocale = Locale.MomentLocale;

module teambition {
  'use strict';

  declare let webkitURL;
  declare let wx;
  declare let Spiderjs;

  export let Wechat: WechatService;

  export let spider: any;

  export interface IWxSignature {
    noncestr: string;
    signature: string;
    timestamp: number;
  }

  export let rootZone = zone.fork();

  export let $$injector: any;

  export let URL: URL = URL || webkitURL;
  export let nobodyUrl = 'images/nobody-avator@2x.png';

  export function noop() {
    return false;
  };

  class Run {
    private zone: Zone;
    constructor() {
      this.zone = rootZone;
      this.zone.run(noop);
    }
  }

  // @ngInject
  var RunFn = function(
    $http: any,
    $rootScope: IRootScope,
    app: Iapp,
    Moment: moment.MomentStatic
  ) {

    let run = new Run();
    let initWechat = () => {
      return $http.get('/weixin/dev/signature');
    };

    if (typeof(wx) === 'object') {
      $rootScope.pending = initWechat()
      .then((data: IWxSignature) => {
        Wechat = new WechatService(app.wxid, data.noncestr, data.timestamp, data.signature);
      })
      .catch((reason: any) => {
        console.log('error', '微信SDK初始化失败', '您不能正常使用分享项目给好友功能');
      });
    }

    $http.defaults.headers.common.Authorization = 'OAuth2 5QnZlQtolQ3MVnelk-IRYpuCnDs=jXRIzqqC4cd919bc76a46a28621f738984f4a31ab2bff372b016ec8cd14a23fa5e10bc8a55a4ab6d790c3081327a3c8ad5a9ad28d213e8150fe5534f9bc8936f42b0e6cb1f9ea7480aca118bc4c1d86a05eacad7f1c44d6dcc23abaacd87c33932aa1013b4a92e0eb054a6bcb82027b0b1527b6d';

    MomentLocale(app.LANGUAGE, Moment);

    return run;
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
}
