'use strict';
import {nobodyUrl} from '../../../config/config';
import {parentView, inject} from '../../../bases/Utils';
import {Ding, OrganizationId} from '../../../../Run';
import {View} from '../../../bases/View';
import {
  DetailAPI,
  MemberAPI,
  ProjectsAPI,
  TasklistAPI,
  Rrule
} from '../../../services/service';
import {
  IMemberData,
  ITasklistData,
  IStageData,
  IProjectData,
  ITaskData
} from 'teambition';

@inject([
  'DetailAPI',
  'MemberAPI',
  'ProjectsAPI',
  'TasklistAPI'
])
export class CreateTaskView extends View {

  public ViewName = 'CreateTaskView';

  public _executorId: string;
  public dueDate: any;
  public involveMembers: string[];
  public content: string;
  public note: string;

  public isVisiable = false;
  public members: {
    [index: string]: IMemberData;
  };
  public visiable = 'members';

  public recurrenceStr: string;
  public recurrenceName: string;
  public recurrence = [
    {
      name: '从不',
      recurrence: null,
      isSelected: false
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

  public priority: number;
  public PRIORITY = [
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

  public tasklist: ITasklistData;
  public stage: IStageData;


  private tasklists: ITasklistData[];

  private state: string;
  private projectId: string;
  private DetailAPI: DetailAPI;
  private MemberAPI: MemberAPI;
  private ProjectsAPI: ProjectsAPI;
  private TasklistAPI: TasklistAPI;
  private lastRecurrneceIndex: number;

  // @ngInject
  constructor(
    $scope: angular.IScope
  ) {
    super();
    this.$scope = $scope;
    this.priority = 0;
    this._executorId = '0';
    this.involveMembers = [];
    this.state = 'origin';
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
    let userid = this.$rootScope.userMe._id;
    this.involveMembers.push(userid);
    angular.forEach(this.members, (member: IMemberData) => {
      if (member._id === userid) {
        member.isSelected = true;
      }else {
        member.isSelected = false;
      }
    });
    this.tasklist = this.tasklists[0];
    this.stage = this.tasklists[0].hasStages[0];
    this.setHeader();
  }

  public openNote() {
    this.openModal('create/task/note.html', {
      scope: this.$scope,
      animation: 'slide-in-left'
    });
    this.state = 'note';
    this.setHeader();
  }

  // executor
  public getExecutorAvatar() {
    let avatar = this.members ? this.members[this._executorId].avatarUrl : nobodyUrl;
    return avatar;
  }

  public getExecutorName() {
    let name =  this.members ? this.members[this._executorId].name : '选择执行者';
    return name;
  }

  public openExecutor() {
    this.openModal('create/task/executor.html', {
      scope: this.$scope,
      animation: 'slide-in-left'
    });
    this.state = 'executor';
    this.setHeader();
  }

  public chooseExecutor(id: string) {
    if (id === this._executorId) {
      return ;
    }
    this._executorId = id;
    this.cancelModal();
    this.state = 'origin';
    this.setHeader();
  }


  public openRecurrence() {
    this.openModal('create/task/recurrence.html', {
      scope: this.$scope,
      animation: 'slide-in-left'
    });
    this.state = 'recurrence';
    this.setHeader();
  }

  public openInvolve() {
    this.state = 'involve';
    this.setHeader();
    this.openModal('create/task/involve-modal.html', {
      scope: this.$scope
    });
  }

  public getInvolveNames() {
    let names = [];
    angular.forEach(this.members, (member: IMemberData) => {
      if (member.isSelected && member._id !== '0') {
        names.push(member.name);
      }
    });
    return names.join('、');
  }


  public chooseRecurrence($index: number) {
    if (this.lastRecurrneceIndex) {
      this.recurrence[this.lastRecurrneceIndex || 0].isSelected = false;
    }
    this.lastRecurrneceIndex = $index;
    this.recurrence[$index].isSelected = true;
    this.recurrenceStr = this.recurrence[$index].recurrence;
    this.recurrenceName = this.recurrence[$index].name;
    this.cancelModal();
    this.state = 'origin';
    this.setHeader();
  }

  // priority
  public getPriorityName() {
    return this.PRIORITY[this.priority].name;
  }

  public openPriority() {
    this.openModal('create/task/priority.html', {
      scope: this.$scope,
      animation: 'slide-in-left'
    });
    this.state = 'priority';
    this.setHeader();
  }

  public choosePriority($index: number) {
    if ($index === this.priority) {
      return ;
    }
    angular.forEach(this.PRIORITY, (obj: any, index: number) => {
      if (index === $index) {
        obj.isSelected = true;
        this.priority = $index;
      } else {
        obj.isSelected = false;
      }
    });
    this.cancelModal();
    this.state = 'origin';
    this.setHeader();
  }

  public selectInvolveMember(_id: string) {
    this.members[_id].isSelected = !this.members[_id].isSelected;
  }

  public selectPriority(priority: number) {
    if (priority === this.priority) {
      return ;
    }
    this.priority = priority;
    this.cancelModal();
    this.state = 'origin';
    this.setHeader();
  }

  // involve
  private selectInvolve() {
    let involve = [];
    angular.forEach(this.members, (member: IMemberData) => {
      if (member.isSelected) {
        involve.push(member._id);
      }
    });
    this.involveMembers = involve;
    this.visiable = this.isVisiable ? 'involves' : 'members';
  }

  private setHeader() {
    switch (this.state) {
      case 'origin':
        if (Ding) {
          Ding.setRight('确定', true, false, () => {
            this.createTask();
            this.state = 'origin';
          });
          Ding.setLeft('取消', true, false, () => {
            window.history.back();
            this.state = 'origin';
          });
        }
        break;
      case 'involve':
        if (Ding) {
          Ding.setRight('确定', true, false, () => {
            this.selectInvolve();
            this.state = 'origin';
            this.cancelModal();
            this.setHeader();
          });
          Ding.setLeft('取消', true, false, () => {
            let id = this.$rootScope.userMe._id;
            this.involveMembers = [id];
            angular.forEach(this.members, (member: IMemberData) => {
              member.isSelected = member._id === id;
            });
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
        }
        break;
      case 'note':
        if (Ding) {
          Ding.setRight('确定', true, false, () => {
            this.cancelModal();
            this.state = 'origin';
            if (!this.$scope.$$phase) {
              this.$scope.$digest();
            }
            this.setHeader();
          });
          Ding.setLeft('取消', true, false, () => {
            this.content = '';
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
        }
        break;
      case 'recurrence':
        if (Ding) {
          Ding.setRight('', false, false);
          Ding.setLeft('取消', true, false, () => {
            this.recurrenceStr = null;
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
        }
        break;
      case 'executor':
        if (Ding) {
          Ding.setRight('', false, false);
          Ding.setLeft('取消', true, false, () => {
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
        }
        break;
      case 'priority':
        if (Ding) {
          Ding.setRight('', false, false);
          Ding.setLeft('取消', true, false, () => {
            this.cancelModal();
            this.state = 'origin';
            this.setHeader();
          });
        }
        break;
    }
  }

  private createTask() {
    if (typeof this.content !== 'undefined') {
      this.showLoading();
      let recurrence: string[];
      let dateNow = new Date();
      dateNow.setMilliseconds(0);
      dateNow.setSeconds(0);
      if (this.recurrenceStr) {
        let nowStr = 'DTSTART=' + Rrule.timeToUntilString(dateNow);
        recurrence = [this.recurrenceStr.replace(';', `;${nowStr};`)];
      }
      return this.DetailAPI.create('task', {
        _tasklistId: this.tasklist._id,
        content: this.content,
        note: this.note,
        _executorId: this._executorId === '0' ? null : this._executorId,
        dueDate: this.dueDate,
        priority: this.priority,
        involveMembers: this.involveMembers,
        recurrence: recurrence,
        visiable: this.visiable
      })
      .then((task: ITaskData) => {
        this.showMsg('success', '创建成功', '已成功创建任务', `#/detail/task/${task._id}`);
        this.hideLoading();
        window.history.back();
      })
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        alert(JSON.stringify(reason));
        this.showMsg('error', '创建失败', message);
        this.hideLoading();
        window.history.back();
      });
    }
  }


}
