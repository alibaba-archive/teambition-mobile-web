/// <reference path="../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  declare var wx: any;

  export interface IWxScanRes {
    resultStr?: string;
  }

  export interface IonicOptionsButtonsOption {
    text: string;
  }

  @inject([
    'ProjectsAPI'
  ])
  export class ProjectView extends View {

    public ViewName = 'ProjectView';
    public $$id     = 'Projects';
    public personalProjects: IProjectDataParsed[] = [];
    public staredProject: IProjectDataParsed[] = [];
    public projects: IProjectDataParsed[] = [];

    private ProjectsAPI: IProjectsAPI;
    private organization: {
      [index: string]: {
        id: string;
        name: string;
        projects: IProjectDataParsed[];
      }
    } = {};

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.zone.run(noop);
    }

    public onInit() {
      return this.getProjects();
    }

    public wxQrcode() {
      wx.scanQRCode({
        needResult: 1,
        scanType: ['qrCode'],
        success: (res: IWxScanRes) => {
          this.checkUrlValid(res.resultStr)
          .then((data: IProjectInviteData) => {
            window.location.hash = `/invited/${data.projectId}/${data.signCode}/${data.invitorId}`;
          });
        }
      });
    }

    public starProject(project: IProjectData) {
      if (!project.isStar) {
        this.ProjectsAPI.starProject(project._id)
        .then((data: IProjectData) => {
          let str: string;
          if (!project.isStar) {
            str = '星标项目失败';
            this.showMsg('error', project.name, str);
          }else {
            str = '星标项目成功';
            this.showMsg('success', project.name, str);
          }
        })
        .catch((err: Error) => {
          let str = '星标项目失败';
          this.showMsg('error', project.name, str);
        });
      }
      this.$ionicListDelegate.closeOptionButtons();
    }

    public unStarProject(project: IProjectData) {
      if (project.isStar) {
        this.ProjectsAPI.unStarProject(project._id)
        .then((data: IProjectData) => {
          let str: string;
          if (project.isStar) {
            str = '取消星标失败';
            this.showMsg('error', project.name, str);
          }else {
            str = '取消星标成功';
            this.showMsg('success', project.name, str);
          }
        })
        .catch((err: Error) => {
          let str = '取消星标失败';
          this.notify.show('error', '网路出错了', '断线重连中');
          this.showMsg('error', project.name, str);
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
              this.archiveProject(project);
              break;
            case quitIndex :
              this.leaveProject(project);
              break;
            case deleteIndex :
              this.deleteProject(project);
              break;
          };
          return true;
        }
      });
      this.$ionicListDelegate.closeOptionButtons();
    }

    public countStar() {
      let index: number;
      let projects = this.projects;
      let hasStar = false;
      for (index = 0; index < projects.length; index++) {
        let project = projects[index];
        if (project.isStar) {
          hasStar = true;
        }
      }
      return hasStar;
    }

    private archiveProject(project: IProjectData) {
      if (project.canArchive) {
        let popup = this.$ionicPopup.show({
          title: `归档项目「${project.name}」`,
          subTitle: '如果项目已经完成或是暂时中止，你可以先将项目归档',
          scope: this.$scope,
          buttons: [
            {text: '取消'},
            {
              text: '确认归档',
              type: 'button-positive',
              onTap: function() {
                this.ProjectsAPI.archiveProject(project._id)
                .then((data: IProjectData) => {
                  project.deleted = true;
                  this.showMsg('success', project.name, '归档项目成功');
                })
                .catch((err: Error) => {
                  project.deleted = false;
                  this.showMsg('error', project.name, '网络错误，归档项目失败');
                });
                popup.close();
              }
            }
          ]
        });
      }else {
        this.showMsg('error', project.name, '无法归档项目');
      }
    }

    private leaveProject(project: IProjectData) {
      if (project.canQuit) {
        let popup = this.$ionicPopup.show({
          title: `退出项目「${project.name}」`,
          subTitle: '一旦你退出了该项目，你将不能查看任何关于该项目的信息',
          scope: this.$scope,
          buttons: [
            {
              text: '取消'
            },
            {
              text: '确认退出',
              type: 'button-assertive',
              onTap: () => {
                this.ProjectsAPI.leaveProject(project._id)
                .then((data: IProjectData) => {
                  project.deleted = true;
                  this.showMsg('success', project.name, '退出项目成功');
                })
                .catch((err: Error) => {
                  project.deleted = false;
                  this.showMsg('error', project.name, '不能退出这个项目');
                });
                popup.close();
              }
            }
          ]
        });
      }else {
        this.showMsg('error', project.name, '无法退出项目');
      }
    }

    private deleteProject(project: IProjectData) {
      if (project.canDelete) {
        let popup = this.$ionicPopup.show({
          title: `删除项目「${project.name}」`,
          subTitle: '所有与项目有关的信息将会被永久删除',
          scope: this.$scope,
          buttons: [
            {
              text: '取消'
            },
            {
              text: '确认删除',
              type: 'button-assertive',
              onTap: () => {
                this.ProjectsAPI.deleteProject(project._id)
                .then((data: IProjectData) => {
                  this.showMsg('success', project.name, '删除项目成功');
                })
                .catch((err: Error) => {
                  this.showMsg('error', project.name, '不能删除这个项目');
                });
                popup.close();
              }
            }
          ]
        });
      }else {
        this.showMsg('error', project.name, '无法删除项目');
      }
    }

    private getProjects(): angular.IPromise<any> {
      return this.ProjectsAPI.fetch()
      .then((projects: IProjectDataParsed[]) => {
        this.sortProject(projects);
        this.projects = projects;
      });
    }

    private sortProject(projects: IProjectDataParsed[]) {
      angular.forEach(projects, (project: IProjectDataParsed, index: number) => {
        if (project.isStar) {
          this.staredProject.push(project);
        }
        if (project.organization) {
          this.organization[project.organization._id] = this.organization[project.organization._id] ? this.organization[project.organization._id] : {
            id: project.organization._id,
            name: project.organization.name,
            projects: []
          };
          this.organization[project.organization._id].projects.push(project);
        }else {
          this.personalProjects.push(project);
        }
      });
    }

    private checkUrlValid(url: string): angular.IPromise<any> {
      return this.ProjectsAPI.checkProjectsInviteUrl(url)
      .then(function(data: string | teambition.IProjectInviteData) {
        if (data === 'notValid') {
          this.showMsg('error', '扫描失败', '不合法的二维码');
        }
        return data;
      });
    }
  }
  angular.module('teambition').controller('ProjectView', ProjectView);
}
