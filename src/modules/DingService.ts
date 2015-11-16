/// <reference path='../components/interface/teambition.d.ts' />
module Ding {
  'use strict';

  declare let dd: any;

  export class DingService {

    public $q: angular.IQService;

    public code: string;

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

    public getCode(callback: Function) {
      dd.ready(() => {
        dd.runtime.permission.requestAuthCode({
          corpId: this.corpId,
          onSuccess: (result: any) => {
            this.code = result.code;
            if (typeof callback === 'function') {
              callback(result.code);
            }
          },
          onFail : function(err: any) {
            alert(err);
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
        alert(`config err: ${JSON.stringify(error)}`);
        console.log(`error: ${JSON.stringify(error)}`);
      });
    }
  }

}
