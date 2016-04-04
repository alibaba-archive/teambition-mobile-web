'use strict';
import {parentView, inject, View, WorkAPI} from '../../index';
import {IFileData, ICollectionData, IProjectData} from 'teambition';

let projectId: string;

@parentView('TabsView')
@inject([
  'WorkAPI'
])
export class PanelWorkView extends View {

  public works: IFileData[];
  public collections: ICollectionData[];

  private WorkAPI: WorkAPI;

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
    .then((project: IProjectData) => {
      let _collectionId = collectionId || project._rootCollectionId;
      return this.$q.all([
        this.WorkAPI.fetchWorks(projectId, _collectionId)
        .then((works: IFileData[]) => {
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
