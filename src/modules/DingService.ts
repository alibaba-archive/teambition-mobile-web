/// <reference path='../components/interface/teambition.d.ts' />
module Ding {
  'use strict';

  declare let dd: any;

  export class DingService {

    public code: string;
    public $http: angular.IHttpService;

    private agentid: string;
    private corpId: string;
    private timeStamp: number;
    private nonceStr: string;
    private signature: string;

    private isSetForce: boolean;

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
            alert('setTitle' + JSON.stringify(err));
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

    public previewImages(urls: string[]) {
      dd.biz.util.previewImage({
        urls: urls,
        current: urls[0]
      });
    }

    private initDing() {
      dd.config({
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
          'biz.ding.post',
          'biz.util.previewImage'
        ]
      });

      dd.ready(() => {
        this.setTitle('Teambition');
      });
      this.handlerError();
    }

    private handlerError() {
      dd.error((error: any) => {
        let requestStr = `${teambition.app.dingApiHost}/signature?corpId=${this.corpId}`;
        requestStr = this.isSetForce ? `${requestStr}&force=true` : requestStr;
        this.isSetForce = true;
        this.$http.get(requestStr)
        .then((data: teambition.IDingSignature) => {
          this.signature = data.signature;
          this.timeStamp = data.timeStamp;
          this.nonceStr = data.nonceStr;
          this.initDing();
          this.isSetForce = false;
        })
        .catch((reason: any) => {
          alert(reason);
        });
        console.log(`error: ${JSON.stringify(error)}`);
      });
    }
  }

}
