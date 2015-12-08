'use strict';
import {inject} from '../../bases/Utils';
import {View} from '../../bases/View';
import {IProjectData} from 'teambition';
import {ProjectsAPI} from '../../services/service';

declare var Gta: any;

let lastSelected: string;
let projectId: string;

@inject([
  'ProjectsAPI'
])
export class TabsView extends View {

  public ViewName = 'TabsView';
  public project: IProjectData;

  private projectName: string;
  private $ionicTabsDelegate: ionic.tabs.IonicTabsDelegate;
  private ProjectsAPI: ProjectsAPI;
  private tabTypes: string[] = ['home', 'tasklist', 'post', 'work', 'event'];

  constructor() {
    super();
    this.zone.run(angular.noop);
  }

  public onInit() {
    projectId = this.$state.params._id;
    return this.fetchProject(projectId);
  }

  public openView(type: string) {
    if (!this.hasFetched) {
      return ;
    }
    let selectedIndex: number = this.$ionicTabsDelegate.selectedIndex();
    let _projectId = this.$state.params._id;
    if (projectId !== _projectId) {
      projectId = _projectId;
      this.fetchProject(_projectId);
    }
    if (this.tabTypes[selectedIndex] !== lastSelected) {
      lastSelected = type;
      window.location.hash = `/project/${_projectId}/${type}`;
      if (typeof(Gta) !== undefined) {
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
