/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    'DetailAPI',
    'ProjectsAPI'
  ])
  class TaskPositionSelectorView extends View {

    public ViewName = 'TaskPositionSelectorView';

    public detail: any;
    public project: IProjectDataParsed;

    private DetailAPI: IDetailAPI;
    private ProjectsAPI: IProjectsAPI;
    private boundToObjectType: string;
    private boundToObjectId: string;

    constructor() {
      super();
      this.zone.run(() => {
        this.boundToObjectId = this.$state.params._id;
        this.boundToObjectType = this.$state.params.type;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.boundToObjectId, this.boundToObjectType)
      .then((detail: any) => {
        this.detail = detail;
        return this.ProjectsAPI.fetchById(detail._projectId)
        .then((project: IProjectDataParsed) => {
          this.project = project;
          return project;
        });
      });
    }
  }

  angular.module('teambition').controller('TaskPositionSelectorView', TaskPositionSelectorView);
}
