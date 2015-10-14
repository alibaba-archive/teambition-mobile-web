/// <reference path="scripts/interface/teambition.d.ts" />
/// <reference path="run.ts" />

module teambition {
  'use strict';
  export let nobodyUrl: string = 'images/nobody-avator@2x.png';
  let script: HTMLElement = document.getElementById('teambition-config');
  angular.module('teambition', ['ionic', 'ngResource', 'tbTemplates', 'ngFileUpload'])
  .constant('Moment', moment)
  .constant('Marked', marked)
  .constant('app', {
    NAME: 'teambition-wechat',
    VERSION: 'v0.7.0',
    LANGUAGE: 'zh',
    apiHost: script.getAttribute('data-apihost')
  });
}
