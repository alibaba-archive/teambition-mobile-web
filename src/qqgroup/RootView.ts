'use strict';

import {
  inject,
  getParam,
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

  public static $inject = ['$scope'];

  public ViewName = 'RootView';
  public $$id = 'RootView';

  public userMe: IUserMe;

  public $state: angular.ui.IStateService;

  public app: Iapp;
  public $http: angular.IHttpService;
  public socket: any;
  public RestAPI: RestAPI;
  public MessageAPI: MessageAPI;

  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.zone.run(angular.noop);
  }

  public onInit(): angular.IPromise<any> {
    this.zone.hasCreated = true;
    if (this.userMe && this.$rootScope.pending) {
      return this.$rootScope.pending;
    }
    return this.RestAPI.get({
      Type: 'users',
      Id: 'me'
    })
    .$promise
    .then((userMe: IUserMe): any => {
      this.initUser(userMe);
      const search = window.location.search;
      const groupId = getParam(search, 'group_openid');
      const objectType = getParam(search, '_boundToObjectType');
      const objectId = getParam(search, '_boundToObjectId');
      if (objectType.length && objectId.length) {
        return [objectType, objectId];
      }else {
        return this.$http.get(`/qqgroup/project?group_openid=${groupId}`);
      }
    })
    .then((param: any) => {
      if (param instanceof Array) {
        window.location.hash = `/detail/${param[0]}/${param[1]}`;
      }else {
        window.location.hash = `/project/${param.data._id}/tasklist`;
      }
    })
    .catch((reason: any) => {
      const message = this.getFailureReason(reason);
      this.showMsg('error', '初始化失败', message);
    });
  }

  public onAllChangesDone() {
    socketListener('new', 'message', (type: string, data: any) => {
      this.MessageAPI.getOne(data.msgId)
      .then((message: IMessageData) => {
        if (message.latestActivity && message.latestActivity.creator && message.latestActivity.creator._id !== this.userMe._id) {
          this.showMsg('success', message.creator ? message.creator.name : message.subtitle, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
        }
      });
    });
    socketListener('change', 'message', (type: string, data: any) => {
      this.MessageAPI.getOne(data.msgId)
      .then((message: IMessageData) => {
        if (message.latestActivity && message.latestActivity.creator && message.latestActivity.creator._id !== this.userMe._id) {
          this.showMsg('success', message.creator ? message.creator.name : message.subtitle, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
        }
      });
    });
    this.$scope.$on('transfer', (event, ...args) => {
      window.setTimeout(() => {
        this.$scope.$broadcast(args[0], args);
      }, 200);
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
    }
  }

  private goHome(): void {
    window.location.hash = '/login';
  }

}

angular.module('teambition').controller('RootView', RootView);

export * from './create';
export * from './detail/DetailView';
export * from './edit';
export * from './tasklist/PanelTasklistView';
