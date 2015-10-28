/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare let $location;

  let loaded: boolean = false;
  let projectId: string;
  let lastCacheText: string = '';
  // 用于计算拉取到的主页动态为空的次数，如果多次为空则认为动态已经拉完，禁止下拉加载更多
  let counter = 0;

  let cacheActivities: {
    [index: string]: IProjectActivitiesDataParsed[];
  };
  cacheActivities = {};

  @parentView('TabsView')
  @inject([
    'ProjectDetailAPI',
    'EventAPI',
    'MemberAPI'
  ])
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


    private ProjectDetailAPI: IProjectDetailAPI;
    private EventAPI: IEventAPI;
    private MemberAPI: IMemberAPI;
    private infinite = true;
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
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.infinite = true;
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    public scrollHandler() {
      if (!this.infinite) {
        return;
      }
      let thisView = this.$ionicScrollDelegate.getScrollView();
      let height: number;
      if (typeof(thisView) !== 'undefined') {
        height = thisView.__maxScrollTop;
      }
      if ( typeof(this.$ionicScrollDelegate.getScrollPosition) !== 'undefined') {
        let top = this.$ionicScrollDelegate.getScrollPosition().top;
        if (height - top < 45) {
          this.loadMoreData();
        }
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
        this.showMsg('err', '不能查看详情', `该${this.typeMap[type]}已经被删除`);
      }else if (href !== '#') {
        window.location.href = href;
      }
    }

    public openMembersFilterModal() {
      this.openModal('project-tabs/project-home/members-filter-modal.html', {scope: this.$scope});
    }

    public openTasksFilterModal() {
      this.openModal('project-tabs/project-home/tasks-filter-modal.html', {scope: this.$scope});
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
      let cacheText;
      this.filterResultParser(this.selectedMembers, this.selectedMembers.members, this.membersMap, 'members');
      cacheText = this.selectedMembers.cacheText + ' ' + this.selectedTypes.cacheText;
      if (cacheText !== lastCacheText) {
        this.showLoading();
        this.getActivities(20, this.selectedMembers.cacheText, this.selectedTypes.cacheText)
        .then(() => {
          this.hideLoading();
          this.cancelModal();
        });
      }
      this.infinite = true;
    }

    public filterTasks() {
      let cacheText;
      this.filterResultParser(this.selectedTypes, this.selectedTypes.types, this.typeMap, 'tasks');
      cacheText = this.selectedMembers.cacheText + ' ' + this.selectedTypes.cacheText;
      if (cacheText !== lastCacheText) {
        this.showLoading();
        this.getActivities(20, this.selectedMembers.cacheText, this.selectedTypes.cacheText)
        .then(() => {
          this.hideLoading();
          this.cancelModal();
        });
      }
      this.infinite = true;
    }

    private loadMoreData() {
      if (loaded) {
        return;
      }
      let membersFilter: string = this.selectedMembers.cacheText;
      let typesFilter: string = this.selectedTypes.cacheText;
      this.getActivities(20, membersFilter, typesFilter);
    }

    private getActivities(count: number, membersFilter?: string, typesFilter?: string, page?: number) {
      let _membersFilter = membersFilter ? membersFilter : 'all';
      let _typesFilter = typesFilter ? typesFilter : 'all';
      let cacheText = `${projectId}:${_membersFilter}:${_typesFilter}`;
      lastCacheText = cacheText;
      let cache = cacheActivities[cacheText];
      loaded = true;
      return this.ProjectDetailAPI.fetchActivities(projectId, count, membersFilter, typesFilter, page)
      .then((data: IProjectActivitiesDataParsed[]) => {
        if (!cache) {
          cacheActivities[cacheText] = data;
          cache = data;
        }else if (cache.length === data.length) {
          counter ++;
          if (counter > 1) {
            this.infinite = false;
          }
        }
        this.activities = cache;
        loaded = false;
      });
    }

    private getEvents(_projectId: string, now: string) {
      return this.EventAPI.fetch(_projectId, now)
      .then((eventGroup: any) => {
        this.eventGroup = eventGroup.raw;
      });
    }

    private getMembers() {
      return this.MemberAPI.fetch(projectId)
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
      return this.ProjectDetailAPI.fetchNoExecutorOrDuedateTasks(projectId, 'noneExecutor')
      .then((tasks: ITaskDataParsed[]) => {
        if (!tasks) {
          return;
        }
        this._noneExecutorTasks = tasks;
        if (tasks.length > 4) {
          let _tasks: ITaskDataParsed[] = [];
          angular.forEach(tasks, (task: ITaskDataParsed, index: number) => {
            if (index < 3) {
              _tasks.push(task);
            }else {
              return false;
            }
          });
          this.noneExecutorTasks = _tasks;
        }else {
          this.noneExecutorTasks = tasks;
        }
      });
    }

    private getOverDueTasks() {
      return this.ProjectDetailAPI.fetchNoExecutorOrDuedateTasks(projectId, 'due')
      .then((tasks: ITaskDataParsed []) => {
        if (!tasks) {
          return;
        }
        this._dueTasks = tasks;
        if (tasks.length > 4) {
          let _tasks: ITaskDataParsed[] = [];
          angular.forEach(tasks, (task: ITaskDataParsed, index: number) => {
            if (index < 3) {
              _tasks.push(task);
            }else {
              return false;
            }
          });
          this.dueTasks = _tasks;
        }else {
          this.dueTasks = tasks;
        }
        return;
      });
    }

    private getProjectTasks (_projectId: string) {
      return this.$q.all([
        this.getMembers(),
        this.getNoneExecutorTasks(),
        this.getOverDueTasks()
      ]);
    }

    private initFetch() {
      let now = this.Moment().startOf('day').toISOString();
      return this.$q.all([
        this.getEvents(projectId, now),
        this.getProjectTasks(projectId)
      ])
      .then(() => {
        return this.getActivities(20, null, null, 1);
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
