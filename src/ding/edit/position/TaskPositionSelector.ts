'use strict';
import {View, inject, DetailAPI, ProjectsAPI} from '../../index';
import {IProjectData} from 'teambition';

@inject([
  'DetailAPI',
  'ProjectsAPI'
])
export class TaskPositionSelectorView extends View {

  public ViewName = 'TaskPositionSelectorView';

  public detail: any;
  public project: IProjectData;

  private DetailAPI: DetailAPI;
  private ProjectsAPI: ProjectsAPI;
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
      .then((project: IProjectData) => {
        this.project = project;
        return project;
      });
    });
  }

  public openEditor(type: string) {
    if (type) {
      window.location.hash = `#/detail/${this.boundToObjectType}/${this.boundToObjectId}/position/${type}`;
    }
  }
}

angular.module('teambition').controller('TaskPositionSelectorView', TaskPositionSelectorView);
