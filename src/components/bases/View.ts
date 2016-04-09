'use strict';
import {app} from '../config';
import {rootZone, inject} from './Utils';
import {
  IProjectData,
  IRootScope
} from 'teambition';
import {Notify} from '../et';

const viewsMap = {};

const initedViews = {};

let pending: any;

let currentModal: ionic.modal.IonicModalController;


export interface IScope extends angular.IScope {
  ViewName: string;
}

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
  'notify'
])
export class View {

  public static $inject = ['$scope'];

  public zone: any;
  public ViewName: string;
  public $$id: string;
  public parentName: string;
  public parent: any;
  public project: IProjectData;

  protected $rootScope: IRootScope;
  protected $scope: IScope;
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
  protected notify: Notify;

  constructor($scope: IScope) {
    if (this.parentName) {
      this.parent = viewsMap[this.parentName];
    }
    this.$scope = $scope;
    this.ViewName = this.$scope.ViewName;
    this.initZone();
  }

  public static afterTaskHook(project: IProjectData) {
    angular.noop();
  }

  public onInit(): angular.IPromise<any> {
    return this.$rootScope.pending;
  }

  public onChange() {
    angular.noop();
  }

  public onAllChangesDone() {
    angular.noop();
  }

  public onDestroy() {
    angular.noop();
  }

  protected showMsg(type: string, title: string, content: string, href?: string) {
    this.notify.show(type, title, content, href);
  }

  protected showLoading() {
    if (this.$rootScope.loaded) {
      this.$ionicLoading.show({
        noBackdrop: true,
        delay: 500
      });
    }
  }

  protected hideLoading() {
    this.$ionicLoading.hide();
  }

  protected openModal(templateUrl: string, options: ionic.modal.IonicModalOptions) {
    let _options = angular.extend({
      animation: 'slide-in-up',
      focusFirstInput: false,
      backdropClickToClose: true,
      hardwareBackButtonClose: true
    }, options);
    this.$ionicModal.fromTemplateUrl(templateUrl, _options)
    .then((modal: ionic.modal.IonicModalController) => {
      currentModal = modal;
      modal.show();
    });
  }

  protected cancelModal(): void {
    currentModal.hide();
  }

  protected getFailureReason(reason: any): string {
    let message: string;
    if (typeof reason === 'string') {
      try {
        reason = JSON.parse(reason);
        if (reason.data && reason.data.message) {
          message = reason.data.message;
        }else if (reason.status) {
          message = reason.status;
        }
      } catch (error) {
        message = reason;
        console.error(error);
      }
    }else {
      if (reason.data && reason.data.message) {
        message = reason.data.message;
      }else {
        message = reason.status;
      }
    }
    return message;
  }

  private initZone() {
    let parentZone = (this.parent) ? this.parent.zone : rootZone;
    this.zone = parentZone.fork({
      'name': `${this.ViewName}-zone`,
      'onInvokeTask': () => {
        console.log('afterTask');
        View.afterTaskHook(this.project);
        this.onChange();
      },
      'onInvoke': () => {
        console.log('on invoke');
        let $$id: string;
        $$id = this.$$id || this.$state.params._id;
        if (!initedViews[this.ViewName + $$id]) {
          this._onInit().then(() => {
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
            if (app.NAME === 'teambition-qqgroup' && !this.$rootScope.loaded) {
              this.$rootScope.loaded = true;
            }
          }
        }
      }
    });
    this.zone.run(angular.noop);
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
      if (currentModal) {
        currentModal.hide();
      }
    });
    bindPromise = () => {
      pending = pending || this.$rootScope.pending || this.$q.resolve();
      return pending
      .then(() => {
        const _pending = this.onInit();
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
      })
      .catch(reason => {
        pending = this.$q.resolve();
        const message = this.getFailureReason(reason);
        this.showMsg('error', '初始化失败', message);
      });
    };
    console.log(this.ViewName, 'run', moment().format('HH:MM:SS'));
    return bindPromise();
  }

  private _onDestroy() {
    initedViews[this.ViewName + this.$$id] = false;
    this.onDestroy();
  }
}
