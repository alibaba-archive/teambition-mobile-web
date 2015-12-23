'use strict';
import {host} from '../config/config';
import {IUserMe, IProjectData} from 'teambition';

declare let wx: any;

const jsApiList = [
  'scanQRCode',
  'previewImage',
  'chooseImage',
  'onMenuShareAppMessage',
  'showOptionMenu',
  'hideMenuItems'
];

const wxShareMsgConfig = {
  title: '分享一个超赞的协作工具给你',
  desc: 'Teambition 是一个超赞的全平台覆盖的协作工具，让你享受你的工作',
  link: 'https://www.teambition.com',
  imgUrl: 'https://dn-st.teambition.net/tb-weixin/images/teambition.a9debe2c.png'
};

class WechatService {

  public init(appid: string, noncestr: string, timestamp: number, signature: string) {
    wx.config({
      debug: false,
      appId: appid,
      timestamp: timestamp,
      nonceStr: noncestr,
      signature: signature,
      jsApiList: jsApiList
    });
    wx.onMenuShareAppMessage(wxShareMsgConfig);
  }

  public reconfigShare(user: IUserMe, project: IProjectData) {
    let newConfig = angular.extend({}, wxShareMsgConfig);
    let url = `${host}/#/invited/${project._id}/${project.signCode}/${user.name}`;
    url = this.buildWechatShareLink(url);
    newConfig.title = project.name;
    newConfig.desc = `你的好友${user.name}邀请你加入「${project.name}」, 点击加入该项目`;
    newConfig.link = url;
    wx.onMenuShareAppMessage(newConfig);
    console.log(newConfig);
  }

  private buildWechatShareLink(redirect: string) {
    let redirectString = encodeURIComponent(redirect);
    let link = `${host}/weixin/dev/tpl/message?share=true&state=mp_share&next=${redirectString}`;
    return link;
  }
}

export default new WechatService();
