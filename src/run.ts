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

  export let rootZone = zone.fork();

  export let $$rootScope: IRootScope;
  export let $$injector: any;

  export let URL: URL = URL || webkitURL;
  export let nobodyUrl = 'images/nobody-avator@2x.png';

  export function noop() {
    return false;
  };

  class Run {
    private app: Iapp;
    private $rootScope: IRootScope;
    private zone;
    private getParameterByName;
    private RestAPI: IRestAPI;
    private $state: angular.ui.IStateService;
    private $ionicLoading: ionic.loading.IonicLoadingService;
    private socket: any;
    constructor(
      app: teambition.Iapp,
      RestAPI: teambition.IRestAPI,
      $ionicPlatform: ionic.platform.IonicPlatformService,
      $ionicLoading: ionic.loading.IonicLoadingService,
      $rootScope: teambition.IRootScope,
      $state: angular.ui.IStateService,
      $ionicHistory: ionic.navigation.IonicHistoryService,
      $ionicModal: ionic.modal.IonicModalService,
      $timeout: angular.ITimeoutService,
      $location: angular.ILocationService,
      $http: angular.IHttpService,
      $injector: any,
      socket: any,
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
      this.socket = socket;
      this.app = app;
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
      this.app.socket = this.socket(userMe.snapperToken);
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
    $state: angular.ui.IStateService,
    $ionicHistory: ionic.navigation.IonicHistoryService,
    $ionicModal: ionic.modal.IonicModalService,
    $timeout: angular.ITimeoutService,
    $location: angular.ILocationService,
    $http: any,
    $injector: any,
    socket: any,
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
      socket,
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

    $http.defaults.headers.common.Authorization = 'OAuth2 JL_N0f_OP6dpvTOKjQe8e7wCi5w=MCN3vfXo99625ad6abf' +
                                                  '2bf03774c86d6ba205ceff8da45c6553c9bd488f5d80c9ac49ebb1' +
                                                  '91697aad985141dc8e94aa064f30e558f3a90194505323a58fe85c' +
                                                  'b162ee6df2554f253692fc09aced2bb4475ef0f1d5e68f1be52984' +
                                                  '2eec4ff020100829d74d0f89c0c0501be279ff8a08bf4cb6c7b';

    MomentLocale(app.LANGUAGE, Moment);

    $$injector = $injector;

    return run;
  };

  angular.module('teambition').run(RunFn);
}
