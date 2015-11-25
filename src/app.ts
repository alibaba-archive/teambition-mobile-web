/// <reference path="components/interface/teambition.d.ts" />
/// <reference path="run.ts" />

module teambition {
  'use strict';

  export let host = 'http://yinan.project.ci';

  export let app = {
    NAME: 'teambition-mobile-web',
    VERSION: 'v0.9.0',
    LANGUAGE: 'zh',
    apiHost: 'http://project.ci/api',
    strikerHost: 'https://striker.teambition.net/',
    cdnHost: 'https://dn-st.teambition.net',
    wsHost: 'ws://snapper.project.bi/',
    wxid: 'wx48744c9444d9824a',
    spiderHost: 'https://spider.teambition.com/api/track',
    dingAgentId: '6837452',
    // dingApiHost: 'http://cai.project.ci:8081'
    dingApiHost: 'http://yinan.project.ci:6040'
  };

  angular.module('teambition', ['ionic', 'ngResource', 'tbTemplates', 'ngFileUpload', 'et.template'])
  .constant('Moment', moment)
  .constant('Marked', marked)
  .constant('app', app);
}
