'use strict';
import WechatService from '../components/bases/WechatService';
import {
  inject,
  app,
  getParam,
  View,
  RestAPI,
  socketListener,
  MessageAPI
} from './';
import {IUserMe, IMessageData, IRootScope, IProjectData} from 'teambition';

declare let Spiderjs: any;
declare let wx: any;
declare const Gta: any;
export let spider: any;

@inject([
  '$http',
  'socket',
  'RestAPI',
  'MessageAPI'
])
export class RootView extends View {

  public userMe: IUserMe;

  public $state: angular.ui.IStateService;

  public $http: angular.IHttpService;
  public socket: any;
  public RestAPI: RestAPI;
  public MessageAPI: MessageAPI;

  public onInit(): angular.IPromise<any> {
    let visible = getParam(window.location.hash, 'visible');
    if (!visible && this.$state.current.name !== 'login' && this.$state.current.name !== 'wx_login') {
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
        this.goHome();
      });
    }else {
      const defer = this.$q.defer();
      defer.resolve();
      return defer.promise;
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
    app.socket = this.socket(userMe.snapperToken);
  }

  private initUser(userMe: IUserMe) {
    if (!userMe) {
      this.goHome();
    }else {
      this.initRootscope(userMe);
      this.userMe = userMe;
      View.afterTaskHook = (project: IProjectData) => {
        if (typeof wx !== 'undefined' && WechatService && project) {
          WechatService.reconfigShare(userMe, project);
        }
      };
      try {
        Gta.setUser(userMe._id);
        let spiderOptions = {
          _userId: userMe._id,
          client: 'c6a5c100-73b3-11e5-873a-57bc512acffc',
          host: app.spiderHost
        };
        spider = new Spiderjs(spiderOptions);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private goHome(): void {
    window.location.hash = '/login';
  }

}

angular.module('teambition').controller('RootView', RootView);

export * from './report/ReportView';
export * from './project-tabs/TabsView';
export * from './project/ProjectView';
export * from './login/LoginView';
export * from './invited/InviteView';
export * from './detail/DetailView';
