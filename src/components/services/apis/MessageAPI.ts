'use strict';

import BaseAPI from '../../bases/BaseAPI';
import MessageModel from '../../models/MessageModel';
import {IMessageData} from 'teambition';

export class MessageAPI extends BaseAPI {

  public getOne(msgId: string) {
    return this.RestAPI.get({
      Type: 'messages',
      Id: msgId
    })
    .$promise
    .then((message: IMessageData) => {
      MessageModel.saveOne(message);
      return message;
    });
  }
}

angular.module('teambition').service('MessageAPI', MessageAPI);
