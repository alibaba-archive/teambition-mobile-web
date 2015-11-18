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
    'ProjectsAPI',
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

    public project: IProjectDataParsed;
    public dueTasks: ITaskDataParsed[];
    public _dueTasks: ITaskDataParsed[];
    public noneExecutorTasks: ITaskDataParsed[];
    public _noneExecutorTasks: ITaskDataParsed[];
    public members: IMemberData[];
    public membersMap: {
      [index: string]: IMemberData;
    };

    private ProjectsAPI: IProjectsAPI;
    private ProjectDetailAPI: IProjectDetailAPI;
    private EventAPI: IEventAPI;
    private MemberAPI: IMemberAPI;
    private infinite = true;
    private activities: IProjectActivitiesDataParsed [];
    private eventGroup: IEventData[];
    private state: string;

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
      this.members = [];
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    public onAllChangesDone() {
      this.state = 'origin';
      this.setHeader();
    }

    public scrollHandler() {
      if (!this.infinite) {
        return;
      }
      let thisView = this.$ionicScrollDelegate.getScrollView();
      let height: number;
      if (typeof(thisView) !== 'undefined') {
        height = thisView.__maxScrollTop;
        if (height < thisView.__clientHeight) {
          this.infinite = false;
        }
      }
      if ( typeof(this.$ionicScrollDelegate.getScrollPosition) !== 'undefined') {
        let position = this.$ionicScrollDelegate.getScrollPosition();
        let top = position ? position.top : null;
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
        window.location.hash = href;
      }
    }

    public openMembersFilterModal() {
      this.state = 'memberFilter';
      this.setHeader();
      this.openModal('project-tabs/project-home/members-filter-modal.html', {scope: this.$scope});
    }

    public openTasksFilterModal() {
      this.state = 'typeFilter';
      this.setHeader();
      this.openModal('project-tabs/project-home/tasks-filter-modal.html', {scope: this.$scope});
    }

    public checkItem(filter: any, type: string, item?: any) {
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

    public selectMember(id: string) {
      if (id === 'all') {
        this.selectedMembers.all = true;
        angular.forEach(this.membersMap, (member: IMemberData) => {
          member.isSelected = false;
        });
        this.checkItem(this.selectedMembers, 'members');
      }else {
        this.selectedMembers.all = false;
        this.membersMap[id].isSelected = !this.membersMap[id].isSelected;
        this.selectedMembers.members[id] = this.selectedMembers.members[id] ? null : this.membersMap[id].name;
        this.checkItem(this.selectedMembers, 'members', this.membersMap[id]);
      }
    }

    public filterMembers() {
      let cacheText;
      this.filterResultParser(this.selectedMembers, this.selectedMembers.members, this.selectedMembers.members, 'members');
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

    private setHeader() {
      if (Ding) {
        switch (this.state) {
          case 'origin':
            Ding.setTitle('Teambition');
            Ding.setLeft('返回', true, true, () => {
              location.href = location.href.replace(window.location.hash, '') + '#/projects';
            });
            Ding.setRight('', false, false);
            break;
          case 'memberFilter':
            Ding.setTitle('选择成员');
            Ding.setLeft('', false, false);
            Ding.setRight('确定', true, false, () => {
              this.filterMembers();
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
            break;
          case 'typeFilter':
            Ding.setTitle('选择类型');
            Ding.setLeft('', false, false);
            Ding.setRight('确定', true, false, () => {
              this.filterTasks();
              this.cancelModal();
              this.state = 'origin';
              this.setHeader();
            });
            break;
        }
      }
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
      .then((members: {[index: string]: IMemberData}) => {
        this.membersMap = members;
        angular.forEach(members, (member: IMemberData) => {
          this.members.push(member);
        });
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
        this.getProjectTasks(projectId),
        this.ProjectsAPI.fetchById(projectId)
        .then((project: IProjectDataParsed) => {
          this.project = project;
        })
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
