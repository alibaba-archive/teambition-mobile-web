/// <reference path="scripts/interface/teambition.d.ts" />
module teambition {
  'use strict';

  export let rootZone = zone.fork({
    afterTask: () => {
      // console.log('root zone aftertask');
    }
  });

  export let $$rootScope: IRootScope;
  export let $$injector: any;

  export let cdnHost: string;
  export let strikerHost: string;
  export let wsHost: string;

  export function noop() {
    return false;
  };

  export let $inject = {
    $rootScope: null,
    $q: null,
    $state: null,
    $ionicLoading: null,
    $location: null,
    $ionicModal: null,
    $ionicListDelegate: null,
    $ionicActionSheet: null,
    $ionicPopup: null,
    $ionicTabsDelegate: null,
    $ionicScrollDelegate: null,
    Moment: null
  };

  class Run {
    private $rootScope;
    private zone;
    private getParameterByName;
    private RestAPI: IRestAPI;
    private $state;
    private pending: angular.IPromise<any>;
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
      Moment: moment.Moment,
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
        this.getConfig();
        this.getUserInfo();
        $rootScope.pending = this.pending;
      });
    }

    private getConfig() {
      let script = document.getElementById('teambition-config');
      strikerHost = script.getAttribute('data-strikerhost');
      cdnHost = script.getAttribute('data-cdnhost');
      wsHost = script.getAttribute('data-cdnhost');
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
      let self = this;
      if (!visible) {
        this.zone.hasCreated = true;
        this.pending = this.RestAPI.get({
          Type: 'users',
          Id: 'me'
        })
        .$promise
        .then((userMe: teambition.IUserMe) => {
          if (!userMe) {
            self.goHome();
          }else {
            self.initRootscope(userMe);
            let hash: string = window.location.hash;
            if (!hash) {
              self.$state.go('wechat');
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
    Moment: moment.Moment,
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

    let dependency = Object.keys($inject);
    for (let index = 0; index < dependency.length; index++) {
      let element = dependency[index];
      let instance: any;
      try {
        instance = $injector.get(element);
        $inject[element] = instance;
      } catch (error) {
        throw error;
      }
    }
    $$injector = $injector;
    return run;
  };

  angular.module('teambition').run(RunFn);
}
