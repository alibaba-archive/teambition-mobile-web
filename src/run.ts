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
      socket: any,
      ProjectsAPI: teambition.IProjectsAPI,
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
            try {
              let spiderOptions = {
                _userId: userMe._id,
                client: 'c6a5c100-73b3-11e5-873a-57bc512acffc',
                host: this.app.spiderhost
              };
              spider = new Spiderjs(spiderOptions);
            } catch (error) {
              console.error(error);
            }
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
    socket: any,
    ProjectsAPI: teambition.IProjectsAPI,
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
      socket,
      ProjectsAPI,
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
