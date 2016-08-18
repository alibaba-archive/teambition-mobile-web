'use strict';
import { getGtaUser } from '../gta';
import { View } from '../index';
import { isWechatBrowser } from '../../components/services/utils/isWechat';

export type ObjectType = 'task' | 'post' | 'event' | 'file'

export class BannerView extends View {

  protected $state: angular.ui.IStateService;

  private _isWechat = isWechatBrowser();
  private _isAndroid = navigator.platform !== 'iPhone' && navigator.userAgent.indexOf('Android') !== -1;
  private _isIPhone = navigator.platform === 'iPhone';
  private _browserVersion: string;
  private _magicLink = 'https://magiclink.teambition.com/share/';
  private _urlSchema = 'teambition://';
  private _androidSchema = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.teambition.teambition&android_scheme=';
  private _tail = '';
  private _href: string;

  onAllChangesDone() {
    this._browserVersion = getGtaUser(this.$rootScope.userMe).$browser_version;
    // 项目页面
    const id = this.$state.params['_id'];
    const type = this.$state.params['type'];
    if (!type && this.$state.current.name.indexOf('project') !== -1 && id) {
      this._tail = `project:${id}`;
    } else if (type && id) {
      this._tail = `${type}:${id}`;
    } else if (this.$state.current.name === 'subtask') {
      this._tail = `subtask:${id}`;
    } else if (this.$state.current.name === 'collections') {
      this._tail = `collection:${id}`;
    }
    if (this._isAndroid) {
      this._android();
    } else if (this._isIPhone) {
      this._ios();
    }
    if (!this._isWechat) {
      this._href = this._urlSchema + this._tail;
    }
    console.log(this._href);
  }

  public openUniversalLink() {
    if (this._isWechat && this._isIPhone && parseInt(this._browserVersion) < 9) {
      this.$rootScope.showTip = true;
    } else {
      window.location.href = this._href;
    }
  }

  private _android() {
    this._href = `${this._androidSchema}${encodeURIComponent(this._urlSchema + this._tail)}`;
  }

  private _ios() {
    if (this._isWechat) {
      if (this._browserVersion === '9') {
        this._href = `${this._magicLink}${this._tail}`;
      } else {
        this._href = `${this._urlSchema}${this._tail}`;
      }
    }
  }
}

angular.module('teambition').controller('BannerView', BannerView);
