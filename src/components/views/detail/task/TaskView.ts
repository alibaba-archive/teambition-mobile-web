/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';
  @parentView('DetailView')
  class TaskView extends View {

    public ViewName = 'TaskView';

    public task: ITaskDataParsed;
    public project: IProjectDataParsed;

    private projectsAPI: IProjectsAPI;

    // @ngInject
    constructor(
      projectsAPI: IProjectsAPI
    ) {
      super();
      this.projectsAPI = projectsAPI;
      this.zone.run(noop);
    }

    public onInit() {
      this.task = this.parent.detail;
      let projectId = this.task._projectId;
      return this.projectsAPI.fetchById(projectId)
      .then((project: IProjectDataParsed) => {
        this.project = project;
      });
    }

    public openSubtasks () {
      if (this.task.subtaskCount) {
        window.location.hash = `/detail/task/${this.task._id}/subtasks`;
      }
    }

  }

  angular.module('teambition').controller('TaskView', TaskView);
}
