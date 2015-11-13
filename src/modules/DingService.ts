/// <reference path='../components/interface/teambition.d.ts' />
module Ding {
  'use strict';

  declare let dd: any;

  export class DingService {

    public  $q: angular.IQService;
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
      dd.ready(() => {
        dd.runtime.permission.requestAuthCode({
          corpId: corpId,
          onSuccess: function(result: any) {
            let code: string;
            if (typeof result === 'object') {
              code = result.code;
            }
          },
          onFail : function(err: any) {
            console.log(err);
          }
        });
      });
    }

    public setTitle(title: string) {
      dd.ready(() => {
        dd.biz.navigation.setTitle({
          title: title,
          onFail : function(err: any) {
            alert(err);
          }
        });
      });
    }

    public setRight(text: string, show: boolean, showIcon: boolean, callback?: Function) {
      dd.ready(() => {
        dd.biz.navigation.setRight({
          show: show,
          control: true,
          showIcon: showIcon,
          text: text,
          onSuccess : function(result: any) {
            if (typeof callback === 'function') {
              callback();
            }
          },
          onFail : function(err: any) {
            alert(`2, ${err}`);
          }
        });
      });
    }

    public setLeft(text: string, show: boolean, showIcon: boolean, callback?: Function) {
      dd.ready(() => {
        dd.biz.navigation.setLeft({
          show: show,
          control: true,
          showIcon: showIcon,
          text: text,
          onSuccess : function(result: any) {
            if (typeof callback === 'function') {
              callback();
            }
          },
          onFail : function(err: any) {
            alert(`2, ${err}`);
          }
        });
      });
    }

    private initDing() {
      dd.config({
        agentId: this.agentid,
        corpId: this.corpId,
        timeStamp: this.timeStamp,
        nonceStr: this.nonceStr,
        signature: this.signature,
        jsApiList: [
          'runtime.permission.requestAuthCode',
          'biz.navigation.setLeft',
          'biz.navigation.setTitle',
          'biz.navigation.setRight',
          'biz.chat.chooseConversation',
          'biz.ding.post'
        ]
      });
      dd.error((error: any) => {
        console.log(`error: ${JSON.stringify(error)}`);
      });
    }
  }

}
