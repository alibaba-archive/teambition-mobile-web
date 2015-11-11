/// <reference path='../components/interface/teambition.d.ts' />
module Ding {
  'use strict';

  declare let dd: any;

  export class DingService {

    private agentid: string;
    private corpId: string;
    private timeStamp: number;
    private nonceStr: string;
    private signature: string;

    constructor(
      agentid: string,
      corpId: string,
      timeStamp: number,
      nonceStr: string,
      signature: string
    ) {
      this.agentid = agentid;
      this.corpId = corpId;
      this.timeStamp = timeStamp;
      this.nonceStr = nonceStr;
      this.signature = signature;
      this.initDing();
    }

    private initDing() {
      console.log(this);
      dd.config({
        agentId: this.agentid,
        corpId: this.corpId,
        timeStamp: this.timeStamp,
        nonceStr: this.nonceStr,
        signature: this.signature,
        jsApiList: [
          'device.notification.confirm',
          'device.notification.alert',
          'device.notification.prompt',
          'biz.chat.chooseConversation',
          'biz.ding.post'
        ]
      });
    }
  }
}
