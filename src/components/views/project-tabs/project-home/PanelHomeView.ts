'use strict';
import {parentView, inject} from '../../../bases/Utils';
import {View} from '../../../bases/View';
import {
  ProjectsAPI,
  ProjectDetailAPI,
  EventAPI,
  MemberAPI
} from '../../../services/service';
import {ProjectHomeActivity} from '../../../et/ETs';
import {Ding} from '../../../../Run';
import {
  IProjectActivitiesData,
  IMemberData,
  IProjectData,
  ITaskData,
  IEventData
} from 'teambition';

let loaded: boolean = false;
let projectId: string;
let lastCacheText: string = '';
// counter the request to home activities, set infinite false if counter is 3 or more
let counter = 0;

let cacheActivities: {
  [index: string]: IProjectActivitiesData[];
};
cacheActivities = {};

const typeMap = {
  'task': '任务',
  'event': '日程',
  'entry': '账目',
  'post': '分享',
  'work': '文件'
};

@parentView('TabsView')
@inject([
  'ProjectsAPI',
  'ProjectDetailAPI',
  'EventAPI',
  'MemberAPI',
  'ProjectHomeActivity'
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

  public project: IProjectData;
  public dueTasks: ITaskData[];
  public _dueTasks: ITaskData[];
  public noneExecutorTasks: ITaskData[];
  public _noneExecutorTasks: ITaskData[];
  public membersMap: {
    [index: string]: IMemberData;
  };
  public organizationMembers: {
    [index: string]: IMemberData;
  };
  public membersLength: number;
  public memberLimit: string;

  private ProjectsAPI: ProjectsAPI;
  private ProjectDetailAPI: ProjectDetailAPI;
  private EventAPI: EventAPI;
  private MemberAPI: MemberAPI;
  private infinite = true;
  private activities: IProjectActivitiesData [];
  private eventGroup: IEventData[];
  private ProjectHomeActivity: ProjectHomeActivity;
  private state: string;

  private static $inject = ['$scope'];

  constructor($scope: angular.IScope) {
    super();
    this.$scope = $scope;
    this.infinite = true;
    this.zone.run(angular.noop);
  }

  public onInit() {
    projectId = this.$state.params._id;
    return this.initFetch();
  }

  public onAllChangesDone() {
    this.state = 'origin';
    this.setHeader();
    this.ProjectHomeActivity.show(this);
  }

  public scrollHandler() {
    if (!this.infinite) {
      return true;
    }
    let thisView = this.$ionicScrollDelegate.getScrollView();
    if (thisView.isNative) {
      thisView.resize(true);
    }
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
      this.showMsg('error', '不能查看详情', `该${typeMap[type]}已经被删除`);
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
    this.filterResultParser(this.selectedTypes, this.selectedTypes.types, typeMap, 'tasks');
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

  public openMembersModel() {
    this.state = 'addMember';
    this.setHeader();
    this.openModal('project-tabs/project-home/add-member-modal.html', {
      scope: this.$scope
    });
    this.showLoading();
    this.MemberAPI.getOrganizationMembers(this.project.organizationId)
    .then((members: {[index: string]: IMemberData}) => {
      this.organizationMembers = members;
      angular.forEach(this.membersMap, (member: IMemberData) => {
        if (this.organizationMembers[member._id]) {
          this.organizationMembers[member._id].isSelected = true;
        }
      });
      this.hideLoading();
    })
    .catch((reason: any) => {
      let message = this.getFailureReason(reason);
      this.showMsg('error', '获取数据失败', message);
      this.hideLoading();
    });
  }

  public addMember(id: string) {
    this.organizationMembers[id].isSelected = !this.organizationMembers[id].isSelected;
  }

  public getMemberLength() {
    if (this.membersMap) {
      return Object.keys(this.membersMap).length - 1;
    }else {
      return 0;
    }
  }

  public openCreator(type: string) {
    if (type !== 'file') {
      window.location.hash = `/project/${projectId}/${type}/create`;
    }else {
      window.location.hash = `/project/${projectId}/work`;
    }
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
          Ding.setLeft('取消', true, false, () => {
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
          Ding.setRight('确定', true, false, () => {
            this.filterMembers();
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
          break;
        case 'typeFilter':
          Ding.setTitle('选择类型');
          Ding.setLeft('取消', true, false, () => {
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
          Ding.setRight('确定', true, false, () => {
            this.filterTasks();
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
          break;
        case 'addMember':
          Ding.setTitle('添加成员');
          Ding.setLeft('取消', true, false, () => {
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
          Ding.setRight('确定', true, false, () => {
            this.addMembers();
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
    .then((data: IProjectActivitiesData[]) => {
      if (!cache) {
        cacheActivities[cacheText] = data;
        cache = data;
      }else if (cache.length === data.length) {
        counter ++;
        if (counter > 3) {
          this.infinite = false;
        }
      }
      if (this.ProjectHomeActivity) {
        this.ProjectHomeActivity.update();
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
    });
  }

  private getNoneExecutorTasks() {
    return this.ProjectDetailAPI.fetchNoExecutorOrDuedateTasks(projectId, 'noneExecutor')
    .then((tasks: ITaskData[]) => {
      if (!tasks) {
        return;
      }
      this._noneExecutorTasks = tasks;
      if (tasks.length > 4) {
        let _tasks: ITaskData[] = [];
        angular.forEach(tasks, (task: ITaskData, index: number) => {
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
    .then((tasks: ITaskData []) => {
      if (!tasks) {
        return;
      }
      this._dueTasks = tasks;
      if (tasks.length > 4) {
        let _tasks: ITaskData[] = [];
        angular.forEach(tasks, (task: ITaskData, index: number) => {
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
    let now = moment().startOf('day').toISOString();
    return this.$q.all([
      this.getEvents(projectId, now),
      this.getProjectTasks(projectId),
      this.ProjectsAPI.fetchById(projectId)
      .then((project: IProjectData) => {
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

  private addMembers() {
    let emails: string[] = [];
    angular.forEach(this.organizationMembers, (member: IMemberData) => {
      if (member.isSelected) {
        emails.push(member.email);
      }
    });
    this.showLoading();
    this.ProjectDetailAPI.addMembers(projectId, emails)
    .then(() => {
      this.hideLoading();
    })
    .catch((reason: any) => {
      alert(JSON.stringify(reason));
      let message = this.getFailureReason(reason);
      this.showMsg('error', '更新成员失败', message);
      this.hideLoading();
    });
  }
}
