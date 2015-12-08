'use strict';
import {app} from '../config/config';
import {IDingSignature} from 'teambition';

declare let dd: any;

export interface IDingMemberData {
  name: string;
  avatar: string;
  emplId: string;
  [index: string]: any;
}

export class DingService {

  public code: string;
  public $http: angular.IHttpService;

  private agentId: string;
  private corpId: string;
  private timeStamp: number;
  private nonceStr: string;
  private signature: string;

  private isSetForce: boolean;

  constructor(
    agentId: string,
    corpId: string,
    timeStamp: number,
    nonceStr: string,
    signature: string
  ) {
    this.agentId = agentId;
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
        }
      });
    });
  }

  public closePage() {
    dd.ready(() => {
      dd.biz.navigation.close();
    });
  }

  public setTitle(title: string) {
    dd.ready(() => {
      dd.biz.navigation.setTitle({
        title: title
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
        }
      });
    });
  }

  public previewImages(urls: string[]) {
    dd.ready(() => {
      dd.biz.util.previewImage({
        urls: urls,
        current: urls[0]
      });
    });
  }

  public openProfilePage(id: string) {
    dd.ready(() => {
      dd.biz.util.open({
        name: 'profile',
        params: {
          id: id,
          corpId: this.corpId
        }
      });
    });
  }

  public openConcatChoose(
    multiple: boolean,
    defaults: string[],
    callback: (data: IDingMemberData[]) => any
  ) {
    dd.ready(() => {
      dd.biz.contact.choose({
        startWithDepartmentId: 0,
        multiple: multiple,
        users: defaults || [],
        corpId: this.corpId,
        max: 100,
        onSuccess: function(data: IDingMemberData[]) {
          if (typeof callback === 'function') {
            callback(data);
          }
        }
      });
    });
  }

  public createDing(users: string[], link: string, title: string, text: string) {
    dd.ready(() => {
      dd.biz.ding.post({
        users : users,
        corpId: this.corpId,
        type: 2,
        alertType: 2,
        attachment: {
          title: title,
          url: link,
          image: 'https://dn-st.teambition.net/tb-weixin/images/teambition.a9debe2c.png',
          text: text
        },
        text: text
      });
    });
  }

  public createCall(users: string[]) {
    dd.ready(() => {
      dd.biz.telephone.call({
        users: users,
        corpId: this.corpId
      });
    });
  }

  public pickConversation(callback: (chatid: string) => any) {
    dd.ready(() => {
      dd.biz.chat.pickConversation({
        corpId: this.corpId,
        isConfirm: 'true',
        onSuccess: (data: any) => {
          if (typeof callback === 'function') {
            callback(data.cid);
          }
        }
      });
    });
  }

  public sendContentToChat(
    cid: string,
    sender: string,
    url: string,
    msgBody: any
  ) {
    return this.$http.post(`${app.dingApiHost}/message/oa?corpId=${this.corpId}`, {
      chatId: cid,
      sender: sender,
      messageUrl: url,
      messageBody: msgBody
    });
  }

  private initDing() {
    let dingConf = {
      agentId: this.agentId,
      corpId: this.corpId,
      timeStamp: this.timeStamp,
      nonceStr: this.nonceStr,
      signature: this.signature,
      jsApiList: [
        'runtime.permission.requestAuthCode',
        'biz.navigation.close',
        'biz.navigation.setLeft',
        'biz.navigation.setTitle',
        'biz.navigation.setRight',
        'biz.chat.chooseConversation',
        'biz.ding.post',
        'biz.util.previewImage',
        'biz.util.open',
        'biz.contact.choose',
        'biz.telephone.call',
        'biz.chat.pickConversation'
      ]
    };
    dd.config(dingConf);
    this.handlerError();
  }

  private handlerError() {
    dd.error((error: any) => {
      alert(JSON.stringify(error));
      let requestStr = `${app.dingApiHost}/signature?corpId=${this.corpId}`;
      requestStr = this.isSetForce ? `${requestStr}&force=true` : requestStr;
      this.isSetForce = true;
      this.$http.get(requestStr)
      .then((data: IDingSignature) => {
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
    this.setTitle('Teambition');
  }
}
