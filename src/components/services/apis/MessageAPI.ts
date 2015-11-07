/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  export interface IMessageAPI {
    getOne(msgId: string): angular.IPromise<IMessageData>;
  }

  @inject([
    'MessageModel'
  ])
  class MessageAPI extends BaseAPI {

    private MessageModel: IMessageModel;

    public getOne(msgId: string) {
      return this.RestAPI.get({
        Type: 'messages',
        Id: msgId
      })
      .$promise
      .then((message: IMessageData) => {
        this.MessageModel.saveOne(message);
        return message;
      });
    }
  }

  angular.module('teambition').service('MessageAPI', MessageAPI);
}
