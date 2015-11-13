/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare let Spiderjs: any;

  @inject([
    'app',
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
          return;
        }
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

    private goHome(): void {
      window.location.hash = 'login';
    }

  }

  angular.module('teambition').controller('RootView', RootView);
}
