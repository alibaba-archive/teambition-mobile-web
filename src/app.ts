/// <reference path="components/interface/teambition.d.ts" />
/// <reference path="run.ts" />

module teambition {
  'use strict';
  export let nobodyUrl: string = 'images/nobody-avator@2x.png';
  let script = document.getElementById('teambition-config');
  angular.module('teambition', ['ionic', 'ngResource', 'tbTemplates', 'ngFileUpload'])
  .constant('Moment', moment)
  .constant('Marked', marked)
  .constant('app', {
    NAME: 'teambition-wechat',
    VERSION: 'v0.7.0',
    LANGUAGE: 'zh',
    apiHost: script.getAttribute('data-apihost'),
    strikerHost: script.getAttribute('data-strikerhost'),
    cdnHost: script.getAttribute('data-cdnhost'),
    wsHost: script.getAttribute('data-wshost')
  });
}
