/// <reference path="../../scripts/interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare var wx: any;

  export interface IWxScanRes {
    resultStr?: string;
  }

  export interface IonicOptionsButtonsOption {
    text: string;
  }

  export class ProjectView extends View {

    public ViewName = 'ProjectView';
    public $$id     = 'Projects';

    private projectsAPI: teambition.IProjectsAPI;
    private allProjects: teambition.IProjectData[];
    private starProjects: number = 0;

    // @ngInject
    constructor(
      $scope: angular.IScope,
      projectsAPI: teambition.IProjectsAPI
    ) {
      super();
      this.$scope = $scope;
      this.projectsAPI = projectsAPI;
      this.zone.run(noop);
    }

    public onInit() {
      return this.getProjects();
    }

    public wxQrcode() {
      let self = this;
      wx.scanQRCode({
        needResult: 1,
        scanType: ['qrCode'],
        success: (res: IWxScanRes) => {
          self.checkUrlValid(res.resultStr)
          .then((data: IProjectInviteData) => {
            window.location.hash = `/invited/${data.projectId}/${data.signCode}/${data.invitorId}`;
          });
        }
      });
    }

    public starProject(project: IProjectData) {
      if (!project.isStar) {
        this.projectsAPI.starProject(project._id)
        .then((data: IProjectData) => {
          project.isStar = data.isStar;
          let str: string;
          if (!project.isStar) {
            str = '星标项目失败';
            this.showMsg('error', str);
          }else {
            str = '星标项目成功';
            this.starProjects += 1;
            this.showMsg('success', str);
          }
        })
        .catch((err: Error) => {
          let str = '星标项目失败';
          this.showMsg('error', str);
        });
      }
      this.$ionicListDelegate.closeOptionButtons();
    }

    public unStarProject(project: IProjectData) {
      if (project.isStar) {
        this.projectsAPI.unStarProject(project._id)
        .then((data: IProjectData) => {
          project.isStar = data.isStar;
          let str: string;
          if (project.isStar) {
            str = '取消星标失败';
            this.showMsg('error', str);
          }else {
            str = '取消星标成功';
            this.starProjects += 1;
            this.showMsg('success', str);
          }
        })
        .catch((err: Error) => {
          let str = '取消星标失败';
          this.showMsg('error', str);
        });
      }
      this.$ionicListDelegate.closeOptionButtons();
    }

    public showMore(project: IProjectData) {
      let index: number = -1;
      let thisButtons: IonicOptionsButtonsOption[] = [];
      let archiveIndex: number;
      let quitIndex: number;
      let deleteIndex: number;
      let self = this;
      if (project.canArchive) {
        thisButtons.push({text: '归档项目'});
        archiveIndex = ++index;
      }
      if (project.canQuit) {
        thisButtons.push({text: '<font color="red">退出项目</font>'});
        quitIndex = ++index;
      }
      if (project.canDelete) {
        thisButtons.push({text: '<font color="red">删除项目</font>'});
        deleteIndex = ++index;
      }
      this.$ionicActionSheet.show({
        buttons: thisButtons,
        cancelText: '取消',
        buttonClicked: (index: number) => {
          switch (index) {
            case archiveIndex :
              self.archiveProject(project);
              break;
            case quitIndex :
              self.leaveProject(project);
              break;
            case deleteIndex :
              self.deleteProject(project);
              break;
          };
          return true;
        }
      });
      this.$ionicListDelegate.closeOptionButtons();
    }

    private archiveProject(project: IProjectData) {
      let self = this;
      if (project.canArchive) {
        let popup = this.$ionicPopup.show({
          title: `归档项目「${project.name}」`,
          subTitle: '如果项目已经完成或是暂时中止，你可以先将项目归档',
          scope: self.$scope,
          buttons: [
            {text: '取消'},
            {
              text: '确认归档',
              type: 'button-positive',
              onTap: function() {
                self.projectsAPI.archiveProject(project._id)
                .then((data: IProjectData) => {
                  project.deleted = true;
                  self.showMsg('success', '归档项目成功');
                })
                .catch((err: Error) => {
                  project.deleted = false;
                  self.showMsg('error', '网络错误，归档项目失败');
                });
                popup.close();
              }
            }
          ]
        });
      }else {
        this.showMsg('error', '无法归档项目');
      }
    }

    private leaveProject(project: IProjectData) {
      let self = this;
      if (project.canQuit) {
        let popup = this.$ionicPopup.show({
          title: `退出项目「${project.name}」`,
          subTitle: '一旦你退出了该项目，你将不能查看任何关于该项目的信息',
          scope: self.$scope,
          buttons: [
            {
              text: '取消'
            },
            {
              text: '确认退出',
              type: 'button-assertive',
              onTap: () => {
                self.projectsAPI.leaveProject(project._id)
                .then((data: IProjectData) => {
                  project.deleted = true;
                  self.showMsg('success', '退出项目成功');
                })
                .catch((err: Error) => {
                  project.deleted = false;
                  self.showMsg('error', '不能退出这个项目');
                });
                popup.close();
              }
            }
          ]
        });
      }else {
        this.showMsg('error', '无法退出项目');
      }
    }

    private deleteProject(project: IProjectData) {
      let self = this;
      if (project.canDelete) {
        let popup = this.$ionicPopup.show({
          title: `删除项目「${project.name}」`,
          subTitle: '所有与项目有关的信息将会被永久删除',
          scope: self.$scope,
          buttons: [
            {
              text: '取消'
            },
            {
              text: '确认删除',
              type: 'button-assertive',
              onTap: () => {
                self.projectsAPI.deleteProject(project._id)
                .then((data: IProjectData) => {
                  project.deleted = true;
                  self.showMsg('success', '删除项目成功');
                })
                .catch((err: Error) => {
                  project.deleted = false;
                  self.showMsg('error', '不能删除这个项目');
                });
                popup.close();
              }
            }
          ]
        });
      }else {
        this.showMsg('error', '无法删除项目');
      }
    }

    private getProjects(): Thenjs.IPromise<any> {
      let self = this;
      return this.projectsAPI.fetch()
      .then((projects: teambition.IProjectData[]) => {
        self.allProjects = projects;
        angular.forEach(projects, (project: teambition.IProjectData, index: number) => {
          if (project.isStar) {
            self.starProjects += 1;
          }
        });
      });
    }

    private checkUrlValid(url: string): angular.IPromise<any> {
      let self = this;
      return this.projectsAPI.checkProjectsInviteUrl(url)
      .then(function(data: string | teambition.IProjectInviteData) {
        if (data === 'notValid') {
          self.showMsg('error', '不合法的二维码');
        }
        return data;
      });
    }
  }
  angular.module('teambition').controller('ProjectView', ProjectView);
}
