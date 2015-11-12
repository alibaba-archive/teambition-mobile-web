/// <reference path='../interface/teambition.d.ts' />
module teambition {
  'use strict';

  let viewsMap = {};

  let initedViews = {};

  let loadingZone: Zone;

  let pending: any;

  let userMe: IUserMe;

  let currentModal = {
    modal: null,
    templateUrl: '',
    state : ''
  };

  @inject([
    '$rootScope',
    '$q',
    '$state',
    '$ionicLoading',
    '$location',
    '$ionicModal',
    '$ionicListDelegate',
    '$ionicActionSheet',
    '$ionicPopup',
    '$ionicTabsDelegate',
    '$ionicScrollDelegate',
    'Moment',
    'notify'
  ])
  export class View {

    public zone;
    public hasFetched = false;
    public ViewName: string;
    public $$id: string;
    public parentName: string;
    public parent: any;
    public shouldFetchedTimes: number;
    public project: IProjectDataParsed;

    protected $rootScope: IRootScope;
    protected $scope: angular.IScope;
    protected $q: angular.IQService;
    protected $location: angular.ILocationService;
    protected $state: angular.ui.IStateService | angular.ui.IState;
    protected $ionicLoading: ionic.loading.IonicLoadingService;
    protected $ionicListDelegate: ionic.list.IonicListDelegate;
    protected $ionicActionSheet: ionic.actionSheet.IonicActionSheetService;
    protected $ionicPopup: ionic.popup.IonicPopupService;
    protected $ionicScrollDelegate: ionic.scroll.IonicScrollDelegate;
    protected $ionicModal: ionic.modal.IonicModalService;
    protected loading = false;
    protected Moment: moment.MomentStatic;
    protected notify: EtTemplate.Notify;

    constructor() {
      if (this.parentName) {
        this.parent = viewsMap[this.parentName];
      }
      this.initZone();
    }

    public onInit() {
      return this.$rootScope.pending;
    }

    public onAllChangesDone() {
      noop();
    }

    public onDestroy() {
      noop();
    }

    protected showMsg(type: string, title: string, content: string, href?: string) {
      this.notify.show(type, title, content, href);
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

    protected cancelModal(): void {
      if (currentModal.modal && typeof(currentModal.modal.hide) === 'function') {
        currentModal.modal.hide();
      }
    }

    protected getFailureReason(reason: any): string {
      let message: string;
      if (typeof reason === 'string') {
        try {
          reason = JSON.parse(reason);
          console.log(reason);
          message = reason.data.message;
        } catch (error) {
          message = reason;
          console.error(error);
        }
      }else {
        message = reason.data ? reason.data.message : JSON.stringify(reason);
      }
      return message;
    }

    private initZone() {
      let parentZone = (this.parent) ? this.parent.zone : rootZone;
      this.zone = parentZone.fork({
        'afterTask': () => {
          userMe = userMe ? userMe : this.$rootScope.userMe;
          currentModal.state = this.$location.path();
          if (Wechat && this.project) {
            Wechat.reconfigShare(userMe, this.project);
          }
        },
        'beforeTask': () => {
          let $$id: string;
          $$id = this.$$id || this.$state.params._id;
          if (!initedViews[this.ViewName + $$id]) {
            this._onInit().then(() => {
              this.hasFetched = true;
              if ((pending && pending.$$state.status === 0) || this.ViewName === 'RootView') {
                return ;
              }else {
                this.$rootScope.loaded = true;
                this.hideLoading();
              }
            });
          }else {
            if (!pending || (pending && pending.$$state.status === 1)) {
              this.hideLoading();
            }
          }
        }
      });
    }

    private _onInit() {
      let $$id = this.$$id || this.$state.params._id;
      let bindPromise: () => angular.IPromise<any>;
      this.$$id = $$id;
      this.showLoading();
      viewsMap[this.ViewName] = this;
      if (typeof(this.$scope) === 'object') {
        this.$scope.$on('$destroy', () => {
          // console.log(this.ViewName, ' has been destroyed');
          this._onDestroy();
        });
      }
      this.$rootScope.$on('$stateChangeStart', () => {
        initedViews[this.ViewName + this.$$id] = false;
      });
      bindPromise = Zone.bindPromiseFn<any>(() => {
        return this.$rootScope.pending
        .then(() => {
          let _pending = this.onInit();
          if (_pending !== this.$rootScope.pending) {
            pending = _pending;
          }
          return pending;
        })
        .then(() => {
          initedViews[this.ViewName + $$id] = true;
          if (this.$ionicScrollDelegate) {
            this.$ionicScrollDelegate.resize();
          }
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
