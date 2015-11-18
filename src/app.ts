/// <reference path="components/interface/teambition.d.ts" />
/// <reference path="run.ts" />

module teambition {
  'use strict';

  export let host = 'http://m.wx.project.ci';

  angular.module('teambition', ['ionic', 'ngResource', 'tbTemplates', 'ngFileUpload', 'et.template'])
  .constant('Moment', moment)
  .constant('Marked', marked)
  .constant('app', {
    NAME: 'teambition-wechat',
    VERSION: 'v0.7.0',
    LANGUAGE: 'zh',
    apiHost: 'http://project.ci/api',
    strikerHost: 'https://striker.teambition.net/',
    cdnHost: 'https://dn-st.teambition.net',
    wsHost: 'ws://snapper.project.bi/',
    wxid: 'wx48744c9444d9824a',
    spiderHost: 'https://spider.teambition.com/api/track',
    dingAgentId: '6837452',
    dingApiHost: 'http://yinan.project.ci:6040'
  });
}
