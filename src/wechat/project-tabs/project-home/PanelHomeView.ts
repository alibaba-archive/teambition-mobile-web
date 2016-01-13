'use strict';
import {
  parentView,
  inject,
  View,
  ProjectsAPI,
  ProjectDetailAPI,
  EventAPI,
  MemberAPI,
  ProjectHomeActivity
} from '../../index';
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

  public static $inject = ['$scope'];

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
    this.ProjectHomeActivity.show(this);
  }

  public scrollHandler() {
    if (!this.infinite) {
      return true;
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
      this.showMsg('error', '不能查看详情', `该${typeMap[type]}已经被删除`);
    }else if (href !== '#') {
      window.location.hash = href;
    }
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

}

angular.module('teambition').controller('PanelHomeView', PanelHomeView);
