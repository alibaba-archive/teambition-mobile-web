/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  @parentView('TabsView')
  class PanelWorkView extends View {

    public ViewName = 'PanelWorkView';

    public works: IFileDataParsed[];
    public collections: ICollectionData[];

    private workAPI: IWorkAPI;


    // @ngInject
    constructor(
      workAPI: IWorkAPI
    ) {
      super();
      this.workAPI = workAPI;
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    private initFetch() {
      let collectionId = this.$state.params._collectionId;
      return this.parent.fetchProject(projectId)
      .then((project: IProjectDataParsed) => {
        let _collectionId = collectionId || project._rootCollectionId;
        return this.$q.all([
          this.workAPI.fetchWorks(projectId, _collectionId)
          .then((works: IFileDataParsed[]) => {
            this.works = works;
            return works;
          }),
          this.workAPI.fetchCollections(projectId, _collectionId)
          .then((collections: ICollectionData[]) => {
            this.collections = collections;
            return collections;
          })
        ]);
      });
    }
  }

  angular.module('teambition').controller('PanelWorkView', PanelWorkView);
}
