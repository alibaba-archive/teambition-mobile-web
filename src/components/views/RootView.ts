/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare let Spiderjs: any;

  @inject([
    'app',
    '$http',
    'socket',
    'socketListener',
    'getParameterByName',
    'RestAPI',
    'MessageAPI'
  ])
  class RootView extends View {

    public ViewName = 'RootView';

    protected $state: angular.ui.IStateService;

    private app: Iapp;
    private $http: angular.IHttpService;
    private socket: any;
    private socketListener: ISocketListener;
    private getParameterByName: IGetParmByName;
    private RestAPI: IRestAPI;
    private MessageAPI: IMessageAPI;

    private userMe: IUserMe;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      let visible: string = this.getParameterByName(window.location.hash, 'visible');
      if (!visible) {
        this.zone.hasCreated = true;
        if (this.userMe && this.$rootScope.pending) {
          return this.$rootScope.pending;
        }
        // let corpId = this.getParameterByName(window.location.search, 'corpId');
        // return this.$http.get(`${this.app.dingApiHost}/getAccess?code=${Ding.code}&corpId=${corpId}`)
        // .then((data: any) => {
        //   // alert(1);
        // })
        // .catch((reason: any) => {
        //   // alert(2);
        // });
        return this.RestAPI.get({
          Type: 'users',
          Id: 'me'
        })
        .$promise
        .then((userMe: teambition.IUserMe) => {
          alert(0);
          this.initUser(userMe);
        })
        .catch((reason: any) => {
          let corpId = this.getParameterByName(window.location.search, 'corpId');
          alert(typeof Ding);
          this.$http.get(`${this.app.dingApiHost}/getAccess?code=${Ding.code}&corpId=${corpId}`)
          .then((data: any) => {
            alert(1);
          })
          .catch((reason: any) => {
            alert(2);
          });
        })
        .then((user: any) => {
          return this.RestAPI.get({
            Type: 'users',
            Id: 'me'
          })
          .$promise
          .then((userMe: IUserMe) => {
            alert(2);
            this.initUser(userMe);
          });
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          alert(message);
          this.showMsg('error', 'error', message);
        });
      }
    }

    public onAllChangesDone() {
      this.socketListener('new', 'message', (type: string, data: any) => {
        this.MessageAPI.getOne(data.msgId)
        .then((message: IMessageData) => {
          if (message.latestActivity && message.latestActivity.creator && message.latestActivity.creator._id !== this.userMe._id) {
            this.showMsg('success', message.creator.name, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
          }
        });
      });
      this.socketListener('change', 'message', (type: string, data: any) => {
        this.MessageAPI.getOne(data.msgId)
        .then((message: IMessageData) => {
          if (message.latestActivity && message.latestActivity.creator && message.latestActivity.creator._id !== this.userMe._id) {
            this.showMsg('success', message.creator.name, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
          }
        });
      });
    }

    private initRootscope(userMe: teambition.IUserMe): void {
      let $rootScope: teambition.IRootScope = this.$rootScope;
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
      window.location.hash = 'login';
    }

  }

  angular.module('teambition').controller('RootView', RootView);
}
