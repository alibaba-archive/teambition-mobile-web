/// <reference path="../../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  @inject([
    '$ionicHistory',
    'DetailAPI'
  ])
  class EditRecurrenceView extends View {
    public ViewName = 'EditRecurrenceView';

    public task: ITaskDataParsed;
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

    private $ionicHistory: ionic.navigation.IonicHistoryService;
    private DetailAPI: IDetailAPI;
    private taskid: string;
    private lastIndex: number;
    constructor() {
      super();
      this.zone.run(() => {
        this.taskid = this.$state.params._id;
      });
    }

    public onInit() {
      return this.DetailAPI.fetch(this.taskid, 'task')
      .then((task: ITaskDataParsed) => {
        this.task = task;
        if (!this.task.recurrence) {
          this.recurrence[0].isSelected = true;
          this.lastIndex = 0;
        }else {
          for (let index = 1; index < this.recurrence.length; index++) {
            let element = this.recurrence[index];
            if (this.task.recurrenceTime.indexOf(element.recurrence) !== -1) {
              element.isSelected = true;
              this.lastIndex = index;
            }
          }
        }
      });
    }

    public chooseRecurrence($index: number) {
      this.showLoading();
      return this.DetailAPI.update(this.taskid, 'task', {
        recurrence: [this.recurrence[$index].recurrence]
      })
      .then(() => {
        this.recurrence[this.lastIndex].isSelected = false;
        this.recurrence[$index].isSelected = true;
        this.lastIndex = $index;
        this.showMsg('success', '更新成功', '已更新任务重复规则');
        this.hideLoading();
        this.$ionicHistory.goBack();
      })
      .catch((reason: any) => {
        this.showMsg('error', '网络错误', reason);
        this.hideLoading();
        this.$ionicHistory.goBack();
      });
    }
  }

  angular.module('teambition').controller('EditRecurrenceView', EditRecurrenceView);
}
