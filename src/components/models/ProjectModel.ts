/// <reference path="../interface/teambition.d.ts" />

module teambition {
  'use strict';

  export interface IProjectModel {
    set(id: string, content: any): void;
    updateObj(id: string, patch: any): IProjectDataParsed;
    get(id: string): IProjectDataParsed;
    remove(_id: string): void;
    setCollection(projects: IProjectDataParsed[]): void;
    getCollection(): IProjectDataParsed[];
  }

  export class ProjectModel extends BaseModel implements IProjectModel {

    private projectIndex: string[] = [];
    private collection: IProjectDataParsed[] = [];

    public set(id: string, content: IProjectDataParsed) {
      this._set('project', id, content);
    }

    public updateObj(id: string, patch: any) {
      return this._updateObj<IProjectDataParsed>('project', id, patch);
    }

    public get(id: string) {
      return this._get<IProjectDataParsed>('project', id);
    }

    public remove(_id: string) {
      let index = this.projectIndex.indexOf(_id);
      let collection = this._get<IProjectDataParsed[]>('projects');
      collection.splice(index, 1);
      this.updateObj(_id, {deleted: true});
    }

    public setCollection(data: IProjectDataParsed[]) {
      let projectIndex = this.projectIndex;
      let collection = this.collection;
      if (!projectIndex.length) {
        angular.forEach(data, (project: IProjectDataParsed, index: number) => {
          projectIndex.push(project._id);
          collection.push(project);
        });
      }else {
        angular.forEach(data, (project: IProjectDataParsed, index: number) => {
          if (projectIndex[index] !== project._id) {
            projectIndex.splice(index, 0, project._id);
            collection.splice(index, 0, project);
          }else {
            this.updateObj(project._id, project);
          }
        });
      }
      this._set('projects', null, collection);
    }

    public getCollection() {
      return this._get<IProjectDataParsed[]>('projects');
    }


  }

  angular.module('teambition').service('ProjectModel', ProjectModel);
}
