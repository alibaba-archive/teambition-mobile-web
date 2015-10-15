/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IProjectDetailAPI {
    fetchActivities(_projectId: string, _prevId: string, count: number, page: number, membersFilter: string, typesFilter: string): angular.IPromise<IProjectActivitiesData[]>;
    fetchNoExecutorOrDuedateTasks(_projectId: string, typeFilter: string, count?: number, page?: number): angular.IPromise<ITaskDataParsed[]>;
  }

  class ProjectDetailAPI implements IProjectDetailAPI {
    private $q: angular.IQService;
    private RestAPI: IRestAPI;
    private Cache: angular.ICacheObject;
    private PAParser: IPAParser;
    private queryFileds: IqueryFileds;
    private taskParser: ITaskParser;
    private Moment: moment.MomentStatic;
    private memberAPI: IMemberAPI;
    // @ngInject
    constructor(
      $q: angular.IQService,
      RestAPI: IRestAPI,
      memberAPI: IMemberAPI,
      PAParser: IPAParser,
      taskParser: ITaskParser,
      Moment: moment.MomentStatic,
      Cache: angular.ICacheObject,
      queryFileds: IqueryFileds
    ) {
      this.$q = $q;
      this.RestAPI = RestAPI;
      this.Cache = Cache;
      this.PAParser = PAParser;
      this.queryFileds = queryFileds;
      this.taskParser = taskParser;
      this.Moment = Moment;
      this.memberAPI = memberAPI;
    }

    public fetchActivities(_projectId: string, _prevId: string, count: number, page: number, membersFilter?: string, typesFilter?: string) {
      let cacheNamespace = `activities:${page}:${_projectId}:${membersFilter}:${typesFilter}`;
      let activities: IProjectActivitiesDataParsed[] = this.Cache.get<IProjectActivitiesDataParsed[]>(cacheNamespace);
      let deferred = this.$q.defer<IProjectActivitiesDataParsed[]>();
      if (activities) {
        deferred.resolve(activities);
        return deferred.promise;
      }else {
        return this.RestAPI.query({
          Type: 'projects',
          Id: _projectId,
          Path1: 'activities',
          count: count,
          page: page,
          fields: this.queryFileds.projectActivityFileds,
          _prevId: _prevId,
          _creatorId: membersFilter,
          type: typesFilter
        })
        .$promise
        .then((data: IProjectActivitiesData[]) => {
          activities = this.prepareActivities(data, _projectId, page, membersFilter, typesFilter);
          return activities;
        });
      }
    }

    public fetchNoExecutorOrDuedateTasks(_projectId: string, typesFilter: string, count: number = 20, page: number = 1) {
      let cacheNamespace: string = `${typesFilter}:tasks${page}:${_projectId}`;
      let tasksCache: ITaskDataParsed [] = this.Cache.get<ITaskDataParsed []>(cacheNamespace);
      let self = this;
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
        return this.memberAPI.fetch(_projectId)
        .then((members: IMemberData[]) => {
          let result: any = self.setMemberMaps(members);
          return result;
        })
        .then((members: any[]) => {
          return self.RestAPI.query(query)
          .$promise
          .then((data: ITaskData[]) => {
            let result: ITaskDataParsed[] = this.prepareTasks(data, _projectId, members, typesFilter, page);
            return result;
          });
        });
      }
    }

    private prepareActivities(activities: IProjectActivitiesData[], projectId: string, page: number, membersFilter: string, typesFilter: string): IProjectActivitiesDataParsed[] {
      let cacheNamespace: string = `activities:${page}:${projectId}:${membersFilter}:${typesFilter}`;
      if (activities && activities.length) {
        let _activities: IProjectActivitiesDataParsed [] = [];
        angular.forEach(activities, (activity: IProjectActivitiesData, index: number) => {
          let _activity: IProjectActivitiesDataParsed = this.PAParser(activity);
          _activities.push(_activity);
        });
        this.Cache.put(cacheNamespace, _activities);
        return _activities;
      }else {
        this.Cache.put(cacheNamespace, []);
        return [];
      }
    }

    private prepareTasks(tasks: ITaskData[], projectId: string, members: IMemberData[], typesFilter: string, page: number): ITaskDataParsed[] {
      let cacheNamespace: string = `${typesFilter}:tasks${page}:${projectId}`;
      if (!tasks || !tasks.length) {
        this.Cache.put(cacheNamespace, []);
        return [];
      }else {
        let results: ITaskDataParsed[] = [];
        angular.forEach(tasks, (task: ITaskData, index: number) => {
          if (task._executorId) {
            task.executor = members[task._executorId];
          }
          let result: ITaskDataParsed = this.taskParser(task);
          results.push(result);
          result.fetchTime = Date.now();
          this.Cache.put(`task:detail:${result._id}`, result);
        });
        this.Cache.put(cacheNamespace, results);
        return results;
      }
    }

    private setMemberMaps(members: IMemberData[]) {
      let map = {};
      angular.forEach(members, (member: IMemberData, index: number) => {
        map[member._id] = member;
      });
      return map;
    }
  }

  angular.module('teambition').service('projectDetailAPI', ProjectDetailAPI);
}
