import {inject, View, ProjectsAPI} from '../index';
import {IProjectData} from 'teambition';

declare let Gta: any;

let lastSelected: string;
let projectId: string;

@inject([
  'ProjectsAPI'
])
export class TabsView extends View {

  public projectId: string;
  public project: IProjectData;

  private projectName: string;
  private $ionicTabsDelegate: ionic.tabs.IonicTabsDelegate;
  private ProjectsAPI: ProjectsAPI;
  private hasFetched = false;
  private tabTypes: string[] = ['home', 'tasklist', 'post', 'work', 'event'];

  public onInit() {
    projectId = this.$state.params._id;
    this.projectId = projectId;
    return this.fetchProject(projectId)
      .then(() => this.hasFetched = true);
  }

  public openView(type: string) {
    if (!this.hasFetched) {
      return ;
    }
    let selectedIndex: number = this.$ionicTabsDelegate.selectedIndex();
    let _projectId = this.$state.params._id;
    if (projectId !== _projectId) {
      projectId = _projectId;
      this.projectId = _projectId;
      this.fetchProject(_projectId);
    }
    if (this.tabTypes[selectedIndex] !== lastSelected) {
      lastSelected = type;
      window.location.hash = `/project/${_projectId}/${type}`;
      if (typeof(Gta) !== 'undefined') {
        Gta.event('tab-nav', type, 'click tab-nav');
      }
    }
  }

  public fetchProject(projectId: string) {
    return this.ProjectsAPI.fetchById(projectId)
    .then((project: IProjectData) => {
      this.project = project;
      this.projectName = project.name;
      return project;
    });
  }
}

angular.module('teambition').controller('TabsView', TabsView);

export * from './project-work/PanelWorkView';
export * from './project-tasklist/PanelTasklistView';
export * from './project-post/PanelPostView';
export * from './project-home/PanelHomeView';
export * from './project-event/PanelEventView';
