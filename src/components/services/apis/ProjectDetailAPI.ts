/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IProjectDetailAPI {
    fetchActivities(_projectId: string, count: number, membersFilter: string, typesFilter: string, page?: number): angular.IPromise<IProjectActivitiesDataParsed[]>;
    fetchNoExecutorOrDuedateTasks(_projectId: string, typeFilter: string, count?: number, page?: number): angular.IPromise<ITaskDataParsed[]>;
    getTasksDone(projectId: string): angular.IPromise<ITaskDataParsed[]>;
    getTasksNotDone(projectId: string): angular.IPromise<ITaskDataParsed[]>;
    addMembers(projectId: string, emails: string[]): angular.IPromise<void>;
  }

  @inject([
    'queryFileds',
    'Moment',
    'MemberAPI',
    'ProjectActivityModel',
    'TaskModel',
    'MemberModel'
  ])
  class ProjectDetailAPI extends BaseAPI implements IProjectDetailAPI {
    private Moment: moment.MomentStatic;
    private MemberAPI: IMemberAPI;
    private ProjectActivityModel: IProjectActivityModel;
    private TaskModel: ITaskModel;
    private MemberModel: IMemberModel;

    private pageCounter: {
      [index: string]: number;
    } = {};

    public fetchActivities(_projectId: string, count: number, membersFilter?: string, typesFilter?: string, page?: number) {
      let _membersFilter = membersFilter || 'all';
      let _typesFilter = typesFilter || 'all';
      let cacheNamespace = `activities:${_projectId}:${_membersFilter}:${_typesFilter}`;
      if (typeof page === 'undefined') {
        if (typeof this.pageCounter[cacheNamespace] !== 'undefined') {
          page = this.pageCounter[cacheNamespace] + 1;
        }else {
          page = 1;
        }
      }
      let deferred = this.$q.defer();
      let cache = this.ProjectActivityModel.getCollection(_projectId, _membersFilter, _typesFilter);
      if (cache && Math.ceil(cache.length / 20) > page) {
        deferred.resolve(cache);
        return deferred.promise;
      }
      this.pageCounter[cacheNamespace] = page;
      return this.RestAPI.query({
        Type: 'projects',
        Id: _projectId,
        Path1: 'activities',
        count: count,
        page: page,
        fields: this.queryFileds.projectActivityFileds,
        _creatorId: membersFilter,
        type: typesFilter
      })
      .$promise
      .then((data: IProjectActivitiesData[]) => {
        let activities = this.ProjectActivityModel.setCollection(_projectId, _membersFilter, _typesFilter, data);
        return activities;
      });
    }

    public fetchNoExecutorOrDuedateTasks(_projectId: string, typesFilter: string, count: number = 20, page: number = 1) {
      let tasksCache: ITaskDataParsed [];
      if (typesFilter === 'due') {
        tasksCache = this.TaskModel.getDueCollection(_projectId);
      }else {
        tasksCache = this.TaskModel.getNoneExecutorCollection(_projectId);
      }
      let deferred = this.$q.defer<ITaskDataParsed []>();
      if (tasksCache) {
        deferred.resolve(tasksCache);
        return deferred.promise;
      }else {
        let now: string = this.Moment().endOf('day').toISOString();
        let query: any = {
          Type: 'projects',
          Id: _projectId,
          Path1: 'tasks',
          withTags: true,
          isDone: false,
          count: count,
          page: page,
          fields: this.queryFileds.taskFileds
        };
        if (typesFilter === 'due') {
          query.dueDate__lt = now;
        }else if (typesFilter === 'noneExecutor') {
          query._executorId = '';
        }
        return this.MemberAPI.fetch(_projectId)
        .then((members: {[index: string]: IMemberData}) => {
          return this.RestAPI.query(query)
          .$promise
          .then((data: ITaskData[]) => {
            let result: ITaskDataParsed[] = this.prepareTasks(data, _projectId, members, typesFilter, page);
            return result;
          });
        });
      }
    }

    public getTasksDone(projectId: string) {
      let cache = this.TaskModel.getTasksDoneCollection(projectId);
      if (cache) {
        let defer = this.$q.defer();
        defer.resolve(cache);
        return defer.promise;
      }
      return this.RestAPI.query({
        Type: 'projects',
        Id: projectId,
        Path1: 'tasks',
        isDone: true
      })
      .$promise
      .then((tasks: ITaskDataParsed[]) => {
        return this.TaskModel.setTasksDoneCollection(projectId, tasks);
      });
    }

    public getTasksNotDone(projectId: string) {
      let cache = this.TaskModel.getTasksNotDoneCollection(projectId);
      if (cache) {
        let defer = this.$q.defer();
        defer.resolve(cache);
        return defer.promise;
      }
      return this.RestAPI.query({
        Type: 'projects',
        Id: projectId,
        Path1: 'tasks',
        isDone: false
      })
      .$promise
      .then((tasks: ITaskDataParsed[]) => {
        return this.TaskModel.setTasksNotDoneCollection(projectId, tasks);
      });
    }

    public addMembers(projectId: string, emails: string[]) {
      return this.RestAPI.post({
        V2: 'V2',
        Type: 'projects',
        Id: projectId,
        Path1: 'members'
      }, {
        email: emails
      })
      .$promise
      .then((data: any) => {
        for (let i = 0; i < data.length; i ++) {
          let item = data[i];
          let memberData: IMemberData;
          memberData = {
            _id: item._memberId,
            avatarUrl: item.avatarUrl,
            name: item.name,
            title: item.title
          };
          this.MemberModel.addMember(projectId, memberData);
        };
      });
    }

    private prepareTasks(tasks: ITaskData[], projectId: string, members: {[index: string]: IMemberData}, typesFilter: string, page: number): ITaskDataParsed[] {
      if (typesFilter === 'noneExecutor') {
        return this.TaskModel.setNoneExecutorCollection(projectId, tasks);
      }else {
        return this.TaskModel.setDueCollection(projectId, tasks);
      }
    }
  }

  angular.module('teambition').service('ProjectDetailAPI', ProjectDetailAPI);
}
