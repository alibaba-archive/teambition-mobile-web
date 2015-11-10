/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IProjectDetailAPI {
    fetchActivities(_projectId: string, count: number, membersFilter: string, typesFilter: string, page?: number): angular.IPromise<IProjectActivitiesDataParsed[]>;
    fetchNoExecutorOrDuedateTasks(_projectId: string, typeFilter: string, count?: number, page?: number): angular.IPromise<ITaskDataParsed[]>;
  }

  @inject([
    'PAParser',
    'queryFileds',
    'taskParser',
    'Moment',
    'MemberAPI',
    'ProjectActivityModel',
    'TaskModel'
  ])
  class ProjectDetailAPI extends BaseAPI implements IProjectDetailAPI {
    private PAParser: IPAParser;
    private taskParser: ITaskParser;
    private Moment: moment.MomentStatic;
    private MemberAPI: IMemberAPI;
    private ProjectActivityModel: IProjectActivityModel;
    private TaskModel: ITaskModel;

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
      if (cache) {
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
        let activities = this.prepareActivities(data, _projectId, page, _membersFilter, _typesFilter);
        return activities;
      });
    }

    public fetchNoExecutorOrDuedateTasks(_projectId: string, typesFilter: string, count: number = 20, page: number = 1) {
      let tasksCache: ITaskDataParsed [];
      if (typesFilter === 'due') {
        tasksCache = this.TaskModel.getDueExecutorCollection(_projectId);
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

    private prepareActivities(activities: IProjectActivitiesData[], projectId: string, page: number, membersFilter: string, typesFilter: string): IProjectActivitiesDataParsed[] {
      if (activities && activities.length) {
        let _activities: IProjectActivitiesDataParsed [] = [];
        angular.forEach(activities, (activity: IProjectActivitiesData, index: number) => {
          let _activity: IProjectActivitiesDataParsed = this.PAParser(activity);
          _activities.push(_activity);
        });
        this.ProjectActivityModel.setCollection(projectId, membersFilter, typesFilter, _activities);
        return _activities;
      }else {
        return this.ProjectActivityModel.getCollection(projectId, membersFilter, typesFilter);
      }
    }

    private prepareTasks(tasks: ITaskData[], projectId: string, members: {[index: string]: IMemberData}, typesFilter: string, page: number): ITaskDataParsed[] {
      let results: ITaskDataParsed[] = [];
      if (tasks && tasks.length) {
        angular.forEach(tasks, (task: ITaskData, index: number) => {
          if (task._executorId) {
            task.executor = members[task._executorId];
          }
          let result: ITaskDataParsed = this.taskParser(task);
          results.push(result);
          result.fetchTime = Date.now();
          this.TaskModel.setDetail(`task:detail:${result._id}`, task);
        });
      }
      if (typesFilter === 'noneExecutor') {
        this.TaskModel.setNoneExecutorCollection(projectId, results);
      }else {
        this.TaskModel.setDueCollection(projectId, results);
      }
      return results;
    }
  }

  angular.module('teambition').service('ProjectDetailAPI', ProjectDetailAPI);
}
