/// <reference path="components/interface/teambition.d.ts" />
/// <reference path="run.ts" />

module teambition {
  'use strict';
  let script = document.getElementById('teambition-config');

  export let host = script.getAttribute('data-host');

  angular.module('teambition', ['ionic', 'ngResource', 'tbTemplates', 'ngFileUpload', 'et.template'])
  .constant('Moment', moment)
  .constant('Marked', marked)
  .constant('app', {
    NAME: 'teambition-wechat',
    VERSION: 'v0.7.0',
    LANGUAGE: 'zh',
    apiHost: script.getAttribute('data-apihost'),
    strikerHost: script.getAttribute('data-strikerhost'),
    cdnHost: script.getAttribute('data-cdnhost'),
    wsHost: script.getAttribute('data-wshost'),
    wxid: script.getAttribute('data-wxid'),
    spiderHost: script.getAttribute('data-spiderhost'),
    dingAgentId: script.getAttribute('data-ding-agentid')
  });
}
