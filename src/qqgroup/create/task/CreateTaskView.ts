'use strict';
import {
  nobodyUrl,
  inject,
  View,
  DetailAPI,
  MemberAPI,
  ProjectsAPI,
  TasklistAPI,
  Rrule
} from '../../index';
import {
  IMemberData,
  ITasklistData,
  IStageData,
  IProjectData,
  ITaskData
} from 'teambition';

export const recurrence = [
  {
    name: '从不',
    recurrence: null,
    isSelected: true
  },
  {
    name: '每天',
    recurrence: 'RRULE:FREQ=DAILY;INTERVAL=1',
    isSelected: false
  },
  {
    name: '每周',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1',
    isSelected: false
  },
  {
    name: '每两周',
    recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=2',
    isSelected: false
  },
  {
    name: '每月',
    recurrence: 'RRULE:FREQ=MONTHLY;INTERVAL=1',
    isSelected: false
  }
];

export const PRIORITY = [
  {
    priority: 0,
    name: '普通',
    isSelected: false
  },
  {
    priority: 1,
    name: '紧急',
    isSelected: false
  },
  {
    priority: 2,
    name: '非常紧急',
    isSelected: false
  }
];

export const createTemptask = {
  content: '',
  priority: 0,
  _executorId: '0',
  involveMembers: [],
  dueDate: undefined,
  showMore: false,
  note: '',
  recurrenceStr: '',
  recurrenceName: '从不',
  isVisiable: false,
  visiable: 'members'
};

@inject([
  'DetailAPI',
  'MemberAPI',
  'ProjectsAPI',
  'TasklistAPI'
])
export class CreateTaskView extends View {

  public static $inject = ['$scope'];

  public ViewName = 'CreateTaskView';

  public members: {
    [index: string]: IMemberData;
  };

  public PRIORITY = PRIORITY;

  public tasklist: ITasklistData;
  public stage: IStageData;
  public task: any;


  private tasklists: ITasklistData[];

  private projectId: string;
  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;
  private ProjectsAPI: ProjectsAPI;
  private TasklistAPI: TasklistAPI;

  // @ngInject
  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.task = createTemptask;
    this.zone.run(() => {
      this.projectId = this.$state.params._id;
    });
  }

  public onInit() {
    return this.$q.all([
      this.MemberAPI.fetch(this.projectId)
      .then((members: {[index: string]: IMemberData}) => {
        this.members = members;
      }),
      this.ProjectsAPI.fetchById(this.projectId)
      .then((project: IProjectData) => {
        this.project = project;
        return this.TasklistAPI.fetchAll(this.projectId);
      })
      .then((tasklists: ITasklistData[]) => {
        this.tasklists = tasklists;
      })
    ]);
  }

  public onAllChangesDone() {
    const userid = this.$rootScope.userMe._id;
    if (!this.task.involveMembers.length) {
      this.task.involveMembers.push(userid);
    }
    angular.forEach(this.members, (member: IMemberData) => {
      if (member._id === userid) {
        member.isSelected = true;
      }else {
        member.isSelected = false;
      }
    });
    this.tasklist = this.tasklists[0];
    this.stage = this.tasklists[0].hasStages[0];
  }

  public openNote() {
    window.location.hash = `/project/${this.projectId}/task/create/note`;
  }

  // executor
  public getExecutorAvatar() {
    const avatar = this.members ? this.members[this.task._executorId].avatarUrl : nobodyUrl;
    return avatar;
  }

  public getExecutorName() {
    const name =  this.members ? this.members[this.task._executorId].name : '选择执行者';
    return name;
  }

  public openExecutor() {
    window.location.hash = `/project/${this.projectId}/task/create/executor`;
  }

  public openRecurrence() {
    window.location.hash = `/project/${this.projectId}/task/create/recurrence`;
  }

  public openPriority() {
    window.location.hash = `/project/${this.projectId}/task/create/priority`;
  }

  public openInvolve() {
    window.location.hash = `/project/${this.projectId}/task/create/involve`;
  }

  public getInvolveNames() {
    const names = [];
    angular.forEach(this.task.involveMembers, (memberId: string) => {
      const name = this.members[memberId].name;
      names.push(name);
    });
    return names.join('、');
  }

  // priority
  public getPriorityName() {
    return this.PRIORITY[this.task.priority].name;
  }

  public choosePriority($index: number) {
    if ($index === this.task.priority) {
      return ;
    }
    angular.forEach(this.PRIORITY, (obj: any, index: number) => {
      if (index === $index) {
        obj.isSelected = true;
        this.task.priority = $index;
      } else {
        obj.isSelected = false;
      }
    });
    this.cancelModal();
  }

  public createTask() {
    if (typeof this.task.content !== 'undefined') {
      this.showLoading();
      let recurrence: string[];
      const dateNow = new Date();
      dateNow.setMilliseconds(0);
      dateNow.setSeconds(0);
      if (this.task.recurrenceStr) {
        const nowStr = 'DTSTART=' + Rrule.timeToUntilString(dateNow);
        recurrence = [this.task.recurrenceStr.replace(';', `;${nowStr};`)];
      }
      return this.DetailAPI.create('task', {
        _tasklistId: this.tasklist._id,
        content: this.task.content,
        note: this.task.note,
        _executorId: this.task._executorId === '0' ? null : this.task._executorId,
        dueDate: this.task.dueDate,
        priority: this.task.priority,
        involveMembers: this.task.involveMembers,
        recurrence: recurrence,
        visiable: this.task.visiable
      })
      .then((task: ITaskData) => {
        this.showMsg('success', '创建成功', '已成功创建任务', `#/detail/task/${task._id}`);
        this.hideLoading();
        const options = this.shareToQQgroup(task._id);
        this.$scope.$emit('transfer', 'new:task', options);
        angular.extend(createTemptask, {
          content: '',
          priority: 0,
          _executorId: '0',
          involveMembers: [],
          dueDate: undefined,
          showMore: false,
          note: '',
          recurrenceStr: '',
          recurrenceName: '从不',
          isVisiable: false,
          visiable: 'members'
        });
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '创建失败', message);
        this.hideLoading();
        window.history.back();
      });
    }
  }

  public showMoreInfo() {
    this.task.showMore = true;
  }

  private shareToQQgroup(taskId: string) {
    const executorName = this.members[this.task._executorId].name || '暂无执行者';
    const dueDate = this.task.dueDate ? `,截止日期: ${moment(this.task.dueDate).calendar()}` : '';
    return {
      title: `我创建了任务: ${this.task.content}`,
      desc: `执行者: ${executorName} ${dueDate}`,
      share_url: `http://${window.location.host}/qqgroup?_boundToObjectType=task&_boundToObjectId=${taskId}&_projectId=${this.project._id}&_tasklistId=${this.tasklist._id}`,
      image_url: `http://${window.location.host}/images/teambition.png`
    };
  }

}

angular.module('teambition').controller('CreateTaskView', CreateTaskView);

export * from './executor/CreatetaskExecutorView';
export * from './involve/CreatetaskInvolveView';
export * from './note/CreatetaskNoteView';
export * from './priority/CreatetaskPriorityView';
export * from './recurrence/CreatetaskRecurrenceView';
