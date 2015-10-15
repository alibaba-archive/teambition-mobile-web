/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';

  let viewsMap = {};

  let initedViews = {};

  let loadingZone: Zone;

  let currentModal = {
    modal: null,
    templateUrl: '',
    state : ''
  };

  export class View {

    public zone;
    public hasFetched = false;
    public ViewName: string;
    public $$id: string;
    public parentName: string;
    public parent: any;
    public shouldFetchedTimes: number;

    protected $rootScope: IRootScope;
    protected $scope: angular.IScope;
    protected $q: angular.IQService;
    protected $location: angular.ILocationService;
    protected $state: angular.ui.IState;
    protected $ionicLoading: ionic.loading.IonicLoadingService;
    protected $ionicListDelegate: ionic.list.IonicListDelegate;
    protected $ionicActionSheet: ionic.actionSheet.IonicActionSheetService;
    protected $ionicPopup: ionic.popup.IonicPopupService;
    protected $ionicScrollDelegate: ionic.scroll.IonicScrollDelegate;
    protected $ionicModal: ionic.modal.IonicModalService;
    protected loading = false;
    protected Moment: moment.MomentStatic;


    constructor() {
      if (this.parentName) {
        this.parent = viewsMap[this.parentName];
      }
      this.initZone();
    }

    public onInit(promise?: angular.IPromise<any>) {
      return promise || this.$rootScope.pending;
    }

    public onAllChangesDone() {
      noop();
    }

    public onDestroy() {
      noop();
    }

    protected showMsg(type: string, infomation: string) {
      console.log(type, infomation);
    }

    protected showLoading() {
      if (this.$rootScope.loaded) {
        loadingZone = loadingZone || rootZone.fork();
        loadingZone.run(() => {
          this.$ionicLoading.show({});
        });
      }
    }

    protected hideLoading() {
      loadingZone = loadingZone || rootZone.fork();
      loadingZone.run(() => {
        this.$ionicLoading.hide();
      });
    }

    protected openModal(templateUrl: string, options: ionic.modal.IonicModalOptions) {
      if (
        templateUrl === currentModal.templateUrl &&
        currentModal.modal &&
        this.$location.path() === currentModal.state
      ) {
        currentModal.modal.show();
      }else {
        if (currentModal.modal) {
          currentModal.modal.remove();
        }
        currentModal.templateUrl = '';
        let _options = angular.extend({
          animation: 'slide-in-up',
          focusFirstInput: false,
          backdropClickToClose: true
        }, options);
        this.$ionicModal.fromTemplateUrl(templateUrl, _options)
        .then((modal: ionic.modal.IonicModalController) => {
          currentModal.modal = modal;
          currentModal.templateUrl = templateUrl;
          currentModal.modal.show();
        });
      }
    }

    protected cancelModal() {
      if (currentModal.modal && typeof(currentModal.modal.hide) === 'function') {
        currentModal.modal.hide();
      }
    }

    private initZone() {
      let parentZone = (this.parent) ? this.parent.zone : rootZone;
      this.zone = parentZone.fork({
        'afterTask': () => {
          currentModal.state = this.$location.path();
        },
        'beforeTask': () => {
          let $$id: string;
          this.initInjector($inject);
          $$id = this.$$id || this.$state.params._id;
          if (!initedViews[this.ViewName + $$id]) {
            this._onInit().then(() => {
              this.$rootScope.loaded = true;
              this.hideLoading();
              this.hasFetched = true;
            });
          }else {
            this.hideLoading();
          }
        }
      });
    }

    private initInjector($inject: any) {
      if (typeof($inject) !== 'object') {
        return false;
      }
      let properties = Object.keys($inject);
      for (let index = 0; index < properties.length; index++) {
        let element = properties[index];
        this[element] = $inject[element];
      }
    }

    private _onInit() {
      let $$id = this.$$id || this.$state.params._id;
      let pending: angular.IPromise<any>;
      let bindPromise: () => angular.IPromise<any>;
      this.$$id = $$id;
      this.showLoading();
      viewsMap[this.ViewName] = this;
      initedViews[this.ViewName + $$id] = true;
      if (typeof(this.$scope) === 'object') {
        this.$scope.$on('$destroy', () => {
          // console.log(this.ViewName, ' has been destroyed');
          this._onDestroy();
        });
      }
      this.$rootScope.$on('$stateChangeStart', () => {
        initedViews[this.ViewName + this.$$id] = false;
      });
      pending = this.onInit();
      bindPromise = Zone.bindPromiseFn<any>(() => {
        return pending.then(() => {
          return this.onAllChangesDone();
        });
      });
      console.log(this.ViewName, 'run', Date.now());
      return bindPromise();
    }

    private _onDestroy() {
      initedViews[this.ViewName + this.$$id] = false;
      this.onDestroy();
    }
  }

  export function parentView (name: string) {
    return function(TargetView: any) {
      TargetView.prototype.parentName = name;
    };
  }

}
