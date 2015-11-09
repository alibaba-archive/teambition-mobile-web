/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare var Gta: any;

  let lastSelected: string;
  let projectId: string;

  @inject([
    'ProjectsAPI'
  ])
  export class TabsView extends View {

    public ViewName = 'TabsView';
    public projectId: string;
    public project: IProjectDataParsed;

    private projectName: string;
    private $ionicTabsDelegate: ionic.tabs.IonicTabsDelegate;
    private ProjectsAPI: IProjectsAPI;
    private tabTypes: string[] = ['home', 'tasklist', 'post', 'work', 'event'];

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      this.projectId = projectId;
      return this.$rootScope.pending = this.$rootScope.pending.then(() => {
        return this.fetchProject(projectId);
      });
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
        if (typeof(Gta) !== undefined) {
          Gta.event('tab-nav', type, 'click tab-nav');
        }
      }
    }

    public fetchProject(projectId: string) {
      return this.ProjectsAPI.fetchById(projectId)
      .then((project: IProjectDataParsed) => {
        this.project = project;
        this.projectName = project.name;
        return project;
      });
    }
  }

  angular.module('teambition').controller('TabsView', TabsView);
}
