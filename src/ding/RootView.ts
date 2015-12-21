'use strict';

import {
  inject,
  getParam,
  Ding,
  View,
  RestAPI,
  socketListener,
  MessageAPI
} from './';
import {IUserMe, Iapp, IMessageData, IRootScope} from 'teambition';

declare let Spiderjs: any;
export let spider: any;

@inject([
  'app',
  '$http',
  'socket',
  'RestAPI',
  'MessageAPI'
])
export class RootView extends View {

  public ViewName = 'RootView';
  public $$id = 'RootView';

  public userMe: IUserMe;

  public $state: angular.ui.IStateService;

  public app: Iapp;
  public $http: angular.IHttpService;
  public socket: any;
  public RestAPI: RestAPI;
  public MessageAPI: MessageAPI;

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit(): angular.IPromise<any> {
    let visible = getParam(window.location.hash, 'visible');
    if (!visible) {
      this.zone.hasCreated = true;
      if (this.userMe && this.$rootScope.pending) {
        return this.$rootScope.pending;
      }
      return this.RestAPI.get({
        Type: 'users',
        Id: 'me'
      })
      .$promise
      .then((userMe: IUserMe) => {
        this.initUser(userMe);
      })
      .catch((reason: any) => {
        let defer = this.$q.defer();
        if (Ding) {
          Ding.getCode((code: string) => {
            let DingCorpid = Ding.corpId;
            this.$http.get(`${this.app.dingApiHost}/getAccess?code=${code}&corpId=${DingCorpid}`)
            .then((result: any) => {
              defer.resolve();
            })
            .catch((reason: any) => {
              let message = this.getFailureReason(reason);
              this.showMsg('error', 'error', message);
            });
          });
        }else {
          this.showMsg('error', 'error', '应用无法初始化');
        }
        return defer.promise;
      })
      .then(() => {
        if (!this.userMe) {
          return this.RestAPI.get({
            Type: 'users',
            Id: 'me'
          })
          .$promise
          .then((userMe: IUserMe) => {
            this.initUser(userMe);
          })
          .catch((reason: any) => {
            let message = this.getFailureReason(reason);
            this.showMsg('error', 'error', message);
          });
        }
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', 'error', message);
      });
    }
  }

  public onAllChangesDone() {
    socketListener('new', 'message', (type: string, data: any) => {
      this.MessageAPI.getOne(data.msgId)
      .then((message: IMessageData) => {
        if (message.latestActivity && message.latestActivity.creator && message.latestActivity.creator._id !== this.userMe._id) {
          this.showMsg('success', message.creator.name, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
        }
      });
    });
    socketListener('change', 'message', (type: string, data: any) => {
      this.MessageAPI.getOne(data.msgId)
      .then((message: IMessageData) => {
        if (message.latestActivity && message.latestActivity.creator && message.latestActivity.creator._id !== this.userMe._id) {
          this.showMsg('success', message.creator.name, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
        }
      });
    });
  }

  private initRootscope(userMe: IUserMe): void {
    let $rootScope: IRootScope = this.$rootScope;
    $rootScope.global = {
      title: 'Teambition'
    };
    $rootScope.userMe = userMe;
    this.app.socket = this.socket(userMe.snapperToken);
  }

  private initUser(userMe: IUserMe) {
    if (!userMe) {
      this.goHome();
    }else {
      this.initRootscope(userMe);
      this.userMe = userMe;
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
      let hash = window.location.hash;
      if (!hash) {
        this.$state.go('projects');
      }
    }
  }

  private goHome(): void {
    window.location.hash = '/login';
  }

}

angular.module('teambition').controller('RootView', RootView);
