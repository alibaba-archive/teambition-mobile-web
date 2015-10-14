/// <reference path="../../scripts/interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare let $location;

  let lastid: string = '';
  let loaded: boolean = false;
  let hasMore: boolean = false;
  let projectId: string;
  let lastCacheText: string = '';

  @parentView('TabsView')
  export class PanelHomeView extends View {

    public ViewName = 'PanelHomeView';

    public selectedMembers = {
      all: true,
      text: '全部成员',
      count: 0,
      members: <IMemberData>{},
      cacheText: null
    };

    public selectedTypes = {
      all: true,
      text: '全部类型',
      count: 0,
      types: {},
      cacheText: null
    };

    public dueTasks: ITaskDataParsed[];
    public _dueTasks: ITaskDataParsed[];
    public noneExecutorTasks: ITaskDataParsed[];
    public _noneExecutorTasks: ITaskDataParsed[];
    public members: IMemberData[];
    public membersMap: {
      [index: string]: string;
    };
    public cacheActivities: {
      page: number;
      activities: IProjectActivitiesDataParsed[];
    } = {
      page: 0,
      activities: []
    };


    private projectDetailAPI: IProjectDetailAPI;
    private eventAPI: IEventAPI;
    private memberAPI: IMemberAPI;
    private infinite: boolean = true;
    private activities: IProjectActivitiesDataParsed [];
    private eventGroup: IEventData[];

    private typeMap = {
      'task': '任务',
      'event': '日程',
      'entry': '账目',
      'post': '分享',
      'work': '文件'
    };


    // @ngInject
    constructor(
      $scope: angular.IScope,
      projectDetailAPI: IProjectDetailAPI,
      memberAPI: IMemberAPI,
      eventAPI: IEventAPI
    ) {
      super();
      this.$scope = $scope;
      this.projectDetailAPI = projectDetailAPI;
      this.eventAPI = eventAPI;
      this.memberAPI = memberAPI;
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    public scrollHandler() {
      if (
        typeof(this.$ionicScrollDelegate.getScrollPosition().top) !== 'undefined' &&
        this.$ionicScrollDelegate.getScrollPosition().top > 45
      ) {
        this.loadMoreData();
      }
    }

    public loadDue() {
      this.dueTasks = this._dueTasks;
    }

    public loadNoneExecutor() {
      this.noneExecutorTasks = this._noneExecutorTasks;
    }

    public openDetail(href: string, type: string) {
      if (href === 'deleted') {
        this.showMsg('err', `该${this.typeMap[type]}已经被删除`);
      }else if (href !== '#') {
        window.location.href = href;
      }
    }

    public openMembersFilterModal() {
      this.openModal('project-home/members-filter-modal.html', {scope: this.$scope});
    }

    public openTasksFilterModal() {
      this.openModal('project-home/tasks-filter-modal.html', {scope: this.$scope});
    }

    public checkItem(filter: any, type: string, item: string) {
      if (!item) {
        if (!filter.count) {
          filter.all = true;
        }else {
          filter[type] = {};
          filter.count = 0;
        }
      }else {
        if (filter[type][item]) {
          filter.count += 1;
        }else {
          filter.count -= 1;
        }
        filter.all = !filter.count;
      }
    }

    public filterMembers() {
      let self = this;
      let cacheText;
      this.filterResultParser(this.selectedMembers, this.selectedMembers.members, this.membersMap, 'members');
      cacheText = this.selectedMembers.cacheText + ' ' + this.selectedTypes.cacheText;
      if (cacheText !== lastCacheText) {
        this.showLoading();
        this.getActivities(lastid, 20, this.selectedMembers.cacheText, this.selectedTypes.cacheText)
        .then(() => {
          self.hideLoading();
          self.cancelModal();
        });
      }
    }

    public filterTasks() {
      let self = this;
      let cacheText;
      this.filterResultParser(this.selectedTypes, this.selectedTypes.types, this.typeMap, 'tasks');
      cacheText = this.selectedMembers.cacheText + ' ' + this.selectedTypes.cacheText;
      if (cacheText !== lastCacheText) {
        this.showLoading();
        this.getActivities(lastid, 20, this.selectedMembers.cacheText, this.selectedTypes.cacheText)
        .then(() => {
          self.hideLoading();
          self.cancelModal();
        });
      }
    }

    private loadMoreData() {
      if (loaded) {
        return;
      }
      let membersFilter: string = this.selectedMembers.cacheText;
      let typesFilter: string = this.selectedTypes.cacheText;
      this.getActivities(lastid, 20, membersFilter, typesFilter);
    }

    private getActivities(start: string, count: number, membersFilter?: string, typesFilter?: string) {
      let _membersFilter: string = membersFilter ? membersFilter : 'all';
      let _typesFilter: string = typesFilter ? typesFilter : 'all';
      let cacheText = `${_membersFilter} ${_typesFilter}`;
      lastCacheText = cacheText;
      let cache = this.cacheActivities[cacheText];
      let deferred = this.$q.defer<any>();
      if (typeof(cache) !== 'undefined' && typeof(cache.hasMore) !== 'undefined') {
        hasMore = cache.hasMore;
      }else {
        hasMore = true;
      }
      if (!hasMore || loaded) {
        deferred.resolve('loading or no more data can be loaded');
        return deferred.promise;
      }
      loaded = true;
      let page: number = (typeof(cache) === 'undefined') ? 0 : cache.page;
      return this.projectDetailAPI.fetchActivities(projectId, start, count, page, membersFilter, typesFilter)
      .then((data: IProjectActivitiesData[]) => {
        if (cache) {
          cache.page += 1;
        }else {
          cache = this.cacheActivities[cacheText] = {
            page: 2,
            activities: []
          };
        }
        if (typeof(data.length) !== 'undefined' && data.length) {
          angular.forEach(data, (activity: IProjectActivitiesData, index: number) => {
            cache.activities.push(activity);
          });
          cache.hasMore = true;
          this.infinite = true;
          lastid = data[data.length - 1]._id;
        }else {
          this.infinite = false;
        }
        this.activities = cache.activities;
        loaded = false;
      });
    }

    private getEvents(_projectId: string, now: string) {
      let self = this;
      return this.eventAPI.fetch(_projectId, now)
      .then((eventGroup: any) => {
        self.eventGroup = eventGroup.raw;
      });
    }

    private getMembers() {
      return this.memberAPI.fetch(projectId)
      .then((members: IMemberData[]) => {
        let membersMap: {
          [index: string]: string;
        };
        membersMap = {};
        this.members = members;
        angular.forEach(members, (member: IMemberData, index: number) => {
          membersMap[member._id] = member.name;
        });
        this.membersMap = membersMap;
      });
    }

    private getNoneExecutorTasks() {
      let self = this;
      return this.projectDetailAPI.fetchNoExecutorOrDuedateTasks(projectId, 'noneExecutor')
      .then((tasks: ITaskDataParsed[]) => {
        if (!tasks) {
          return;
        }
        self._noneExecutorTasks = tasks;
        if (tasks.length > 4) {
          let _tasks: ITaskDataParsed[] = [];
          angular.forEach(tasks, (task: ITaskDataParsed, index: number) => {
            if (index < 3) {
              _tasks.push(task);
            }else {
              return false;
            }
          });
          self.noneExecutorTasks = _tasks;
        }else {
          self.noneExecutorTasks = tasks;
        }
      });
    }

    private getOverDueTasks() {
      let self = this;
      return this.projectDetailAPI.fetchNoExecutorOrDuedateTasks(projectId, 'due')
      .then((tasks: ITaskDataParsed []) => {
        if (!tasks) {
          return;
        }
        self._dueTasks = tasks;
        if (tasks.length > 4) {
          let _tasks: ITaskDataParsed[] = [];
          angular.forEach(tasks, (task: ITaskDataParsed, index: number) => {
            if (index < 3) {
              _tasks.push(task);
            }else {
              return false;
            }
          });
          self.dueTasks = _tasks;
        }else {
          self.dueTasks = tasks;
        }
        return;
      });
    }

    private getProjectTasks (_projectId: string) {
      let self = this;
      return this.$q.all([
        self.getMembers(),
        self.getNoneExecutorTasks(),
        self.getOverDueTasks()
      ]);
    }

    private initFetch() {
      let now = this.Moment().startOf('day').toISOString();
      return this.$q.all([
        this.getEvents(projectId, now),
        this.getProjectTasks(projectId)
      ])
      .then(() => {
        return this.getActivities(lastid[lastCacheText], 20);
      });
    }

    private filterResultParser(obj: any, arr: any, map: any, type: string) {
      if (obj.all) {
        obj.cacheText = '';
        obj.text = (type === 'members') ? '全部成员' : '全部类型';
        return;
      }
      let text = '';
      let result = [];
      for (let id in arr) {
        if (arr.hasOwnProperty(id)) {
          let value = arr[id];
          if (value) {
            text = text + map[id] + ',';
            result.push(id);
          }
        }
      }
      obj.text = text.slice(0, text.length - 1);
      obj.cacheText = result.sort().toString();
      return obj;
    }
  }

  angular.module('teambition').controller('PanelHomeView', PanelHomeView);
}
