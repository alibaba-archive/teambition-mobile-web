'use strict';
import { View, IScope } from '../index';
import { isWechatBrowser } from '../../components/services/utils/isWechat';

export class BannerView extends View {

  public static $inject = ['$scope'];

  protected $state: angular.ui.IStateService;

  private _isWechat = isWechatBrowser();
  private _isAndroid = navigator.platform !== 'iPhone' && navigator.userAgent.indexOf('Android') !== -1;
  private _isIPhone = navigator.platform === 'iPhone' || navigator.platform === 'iPad';
  private _browserVersion: string;
  private _magicLink = 'https://magiclink.teambition.com/share/';
  private _urlSchema = 'teambition://';
  private _androidSchema = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.teambition.teambition&android_scheme=';
  private _tail = '';
  private _href: string;

  constructor($scope: IScope) {
    super($scope);
    this.configUrl();
  }

  openUniversalLink(): any {
    if (this._isIPhone && parseInt(this._browserVersion) === 8) {
      if (!this._isWechat) {
        window.location.href = this._href;
        return setTimeout(() => {
          window.location.href = 'https://itunes.apple.com/cn/app/teambition/id656664814';
        }, 30)
      } else {
        return this.$rootScope.showTip = true;
      }
    }
    window.location.href = this._href;
  }

  private configUrl() {
    // 项目页面
    const browserVersion = navigator.userAgent.match(/\b[0-9]+_[0-9]+(?:_[0-9]+)?\b/);
    this._browserVersion = browserVersion ? browserVersion[0].split('_')[0] : '';
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
  }

  private _android() {
    this._href = `${this._androidSchema}${encodeURIComponent(this._urlSchema + this._tail)}`;
  }

  private _ios() {
    if (parseInt(this._browserVersion) >= 9) {
      this._href = `${this._magicLink}${this._tail}`;
    } else {
      this._href = `${this._urlSchema}${this._tail}`;
    }
  }
}

angular.module('teambition').controller('BannerView', BannerView);
