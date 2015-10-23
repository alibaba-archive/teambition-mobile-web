/// <reference path='components/interface/teambition.d.ts' />

import WechatService = Wechat.WechatService;
import MomentLocale = Locale.MomentLocale;

module teambition {
  'use strict';

  declare let webkitURL;
  declare let wx;

  export let Wechat: WechatService;

  export interface IWxSignature {
    noncestr: string;
    signature: string;
    timestamp: number;
  }

  export let rootZone = zone.fork({
    afterTask: () => {
      // console.log('root zone aftertask');
    }
  });

  export let $$rootScope: IRootScope;
  export let $$injector: any;

  export let URL: URL = URL || webkitURL;
  export let nobodyUrl = 'images/nobody-avator@2x.png';

  export function noop() {
    return false;
  };

  class Run {
    private $rootScope;
    private zone;
    private getParameterByName;
    private RestAPI: IRestAPI;
    private $state;
    private $ionicLoading;
    constructor(
      app: teambition.Iapp,
      RestAPI: teambition.IRestAPI,
      $ionicPlatform: ionic.platform.IonicPlatformService,
      $ionicLoading: ionic.loading.IonicLoadingService,
      $rootScope: teambition.IRootScope,
      $state: ng.ui.IStateService,
      $ionicHistory: ionic.navigation.IonicHistoryService,
      $ionicModal: ionic.modal.IonicModalService,
      $timeout: angular.ITimeoutService,
      $location: angular.ILocationService,
      $http: angular.IHttpService,
      $injector: any,
      projectsAPI: teambition.IProjectsAPI,
      Moment: moment.MomentStatic,
      Cache: angular.ICacheFactoryService,
      getParameterByName: teambition.IGetParmByName
    ) {
      this.zone = rootZone;
      this.getParameterByName = getParameterByName;
      this.RestAPI = RestAPI;
      this.$state = $state;
      this.$ionicLoading = $ionicLoading;
      $rootScope.zone = this.zone;
      this.zone.run(() => {
        this.$rootScope = $rootScope;
        this.getUserInfo();
      });
    }

    private initRootscope(userMe: teambition.IUserMe): void {
      let $rootScope: teambition.IRootScope = this.$rootScope;
      $rootScope.global = {
        title: 'Teambition'
      };
      $rootScope.userMe = userMe;
      $$rootScope = $rootScope;
    }

    private getUserInfo(): void {
      let visible: string = this.getParameterByName(window.location.hash, 'visible');
      if (!visible) {
        this.zone.hasCreated = true;
        this.$rootScope.pending = this.RestAPI.get({
          Type: 'users',
          Id: 'me'
        })
        .$promise
        .then((userMe: teambition.IUserMe) => {
          if (!userMe) {
            this.goHome();
          }else {
            this.initRootscope(userMe);
            let hash: string = window.location.hash;
            if (!hash) {
              this.$state.go('wechat');
            }
          }
        });
      }
    }

    private goHome(): void {
      this.$state.go('wx_login');
    }
  }

  // @ngInject
  var RunFn = function(
    app: teambition.Iapp,
    RestAPI: teambition.IRestAPI,
    $ionicPlatform: ionic.platform.IonicPlatformService,
    $ionicLoading: ionic.loading.IonicLoadingService,
    $rootScope: teambition.IRootScope,
    $state: ng.ui.IStateService,
    $ionicHistory: ionic.navigation.IonicHistoryService,
    $ionicModal: ionic.modal.IonicModalService,
    $timeout: angular.ITimeoutService,
    $location: angular.ILocationService,
    $http: angular.IHttpService,
    $injector: any,
    projectsAPI: teambition.IProjectsAPI,
    Moment: moment.MomentStatic,
    Cache: angular.ICacheFactoryService,
    getParameterByName: teambition.IGetParmByName
  ) {

    let run = new Run(
      app,
      RestAPI,
      $ionicPlatform,
      $ionicLoading,
      $rootScope,
      $state,
      $ionicHistory,
      $ionicModal,
      $timeout,
      $location,
      $http,
      $injector,
      projectsAPI,
      Moment,
      Cache,
      getParameterByName
    );

    let initWechat = () => {
      return $http.get('/weixin/dev/signature');
    };

    if (typeof(wx) === 'object') {
      initWechat()
      .then((data: IWxSignature) => {
        Wechat = new WechatService(app.wxid, data.noncestr, data.timestamp, data.signature);
      })
      .catch((reason: any) => {
        console.log('error', '微信SDK初始化失败', '您不能正常使用分享项目给好友功能');
      });
    }

    MomentLocale(app.LANGUAGE, Moment);

    $$injector = $injector;

    return run;
  };

  angular.module('teambition').run(RunFn);
}
