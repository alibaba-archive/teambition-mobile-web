/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @inject([
    'MessageListener',
    'MessageAPI'
  ])
  class RootView extends View {

    public ViewName = 'RootView';

    private MessageListener: IMessageListener;
    private MessageAPI: IMessageAPI;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onAllChangesDone() {
      this.MessageListener.listen((type: string, data: any) => {
        this.MessageAPI.getOne(data.msgId)
        .then((message: IMessageData) => {
          this.showMsg('success', message.creator.name, data.title, `#/detail/${message.boundToObjectType}/${message._boundToObjectId}`);
        });
      });
    }
  }

  angular.module('teambition').controller('RootView', RootView);
}
