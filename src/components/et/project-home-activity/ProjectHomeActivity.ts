/// <reference path="../../interface/teambition.d.ts" />
module EtTemplate {
  'use strict';

  @Component({
    templateUrl: 'et/project-home-activity/index',
    selector: '.activities-wrap .activities-list',
    lazy: true
  })
  @teambition.inject([
    '$filter'
  ])
  export class ProjectHomeActivity extends ETComponent {

    public formatDate: any;

    private $filter: angular.IFilterService;

    public show(scope: any) {
      this.formatDate = this.$filter('formatDate');
      this.bindContext(scope);
      this.insertDOM();
      return this;
    }
  }

  angular.module('et.template').service('ProjectHomeActivity', ProjectHomeActivity);
}
