/// <reference path="../interface/teambition.d.ts" />

module teambition {
  'use strict';

  export interface IProjectModel {
    set(project: IProjectData): void;
    updateObj(id: string, patch: any): IProjectDataParsed;
    get(id: string): IProjectDataParsed;
    remove(_id: string): void;
    setCollection(projects: IProjectData[]): void;
    getCollection(): IProjectDataParsed[];
  }

  @inject([
    'projectParser'
  ])
  class ProjectModel extends BaseModel implements IProjectModel {

    private projectIndex: string[] = [];
    private collection: IProjectDataParsed[] = [];
    private projectParser: (project: IProjectData) => IProjectDataParsed;

    public set(project: IProjectData) {
      if (this.projectIndex.indexOf(project._id) === -1) {
        let result = this.projectParser(project);
        this.projectIndex.push(project._id);
        this.collection.push(result);
        this._set('project', project._id, result);
      }else {
        this._updateObj('project', project._id, project);
      }
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
      this._delete('project', _id);
    }

    public setCollection(data: IProjectData[]) {
      let projectIndex = this.projectIndex;
      let collection = this.collection;
      if (!projectIndex.length) {
        angular.forEach(data, (project: IProjectData, index: number) => {
          projectIndex.push(project._id);
          let result = this.projectParser(project);
          this._set('project', project._id, result);
          collection.push(result);
        });
      }else {
        angular.forEach(data, (project: IProjectData, index: number) => {
          if (projectIndex[index] !== project._id) {
            projectIndex.splice(index, 0, project._id);
            let result = this.projectParser(project);
            collection.splice(index, 0, result);
            this._set('project', project._id, result);
          }else {
            this.updateObj(project._id, project);
            let projectParsed = this._get<IProjectData>('project', project._id);
            this.projectParser(projectParsed);
          }
        });
      }
      collection.sort((left: IProjectDataParsed, right: IProjectDataParsed) => {
        return left._py - right._py;
      });
      this._set('projects', null, collection);
    }

    public getCollection() {
      return this._get<IProjectDataParsed[]>('projects');
    }


  }

  angular.module('teambition').service('ProjectModel', ProjectModel);
}
