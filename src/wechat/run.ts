import WechatService from '../components/bases/WechatService';
import {MomentLocale} from '../components/bases/MomentLocale';
import {app} from '../components/config/config';
import {
  IRootScope,
  IWxSignature
} from 'teambition';

declare let wx;
declare let zone: Zone;

export const RunFn = function(
  $http: any,
  $q: angular.IQService,
  $rootScope: IRootScope
) {

  let initWechat = () => {
    return $http.get('/weixin/dev/signature');
  };

  if (typeof wx === 'object') {
    $rootScope.pending = initWechat()
    .then((data: IWxSignature) => {
      WechatService.init(app.wxid, data.noncestr, data.timestamp, data.signature);
    })
    .catch((reason: any) => {
      console.log('error', '微信SDK初始化失败', '您不能正常使用分享项目给好友功能');
    });
  }else {
    let defer = $q.defer();
    defer.resolve();
    $rootScope.pending = defer.promise;
  }

  MomentLocale(app.LANGUAGE, moment);
};

RunFn.$inject = ['$http', '$q', '$rootScope'];
