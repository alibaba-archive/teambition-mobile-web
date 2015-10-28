/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  @parentView('TabsView')
  @inject([
    'WorkAPI'
  ])
  class PanelWorkView extends View {

    public ViewName = 'PanelWorkView';

    public works: IFileDataParsed[];
    public collections: ICollectionData[];

    private WorkAPI: IWorkAPI;

    constructor() {
      super();
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    public openDetail(_id: string) {
      if (!_id) {
        return;
      }
      window.location.hash = `/detail/work/${_id}`;
    }

    private initFetch() {
      let collectionId = this.$state.params._collectionId;
      return this.parent.fetchProject(projectId)
      .then((project: IProjectDataParsed) => {
        let _collectionId = collectionId || project._rootCollectionId;
        return this.$q.all([
          this.WorkAPI.fetchWorks(projectId, _collectionId)
          .then((works: IFileDataParsed[]) => {
            this.works = works;
            return works;
          }),
          this.WorkAPI.fetchCollections(projectId, _collectionId)
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
