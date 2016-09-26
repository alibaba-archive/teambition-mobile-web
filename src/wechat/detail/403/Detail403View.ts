import { IProjectData } from 'teambition';
import { inject, View, ProjectsAPI } from '../../index';

@inject([
  '$window',
  'ProjectsAPI'
])
export class Detail403View extends View {

  public invited = false;
  public inviterName: string;
  public projectName: string;

  protected $state: angular.ui.IStateService;

  private $window: angular.IWindowService;
  private ProjectsAPI: ProjectsAPI;
  private inviterId: string;
  private projectId: string;
  private signCode: string;
  private nextUrl: string;

  public onInit() {
    const {
      projectId,
      projectName,
      inviterId,
      inviterName,
      signCode,
      nextUrl
    } = this.$state.params;
    this.projectId = projectId;
    this.projectName = projectName;
    this.inviterId = inviterId;
    this.inviterName = inviterName;
    this.signCode = signCode;
    this.nextUrl = nextUrl;
    this.invited = !!(projectId && inviterId && signCode);
    return this.$q.resolve();
  }

  public join() {

    // 加入项目
    this.showLoading();
    this.ProjectsAPI
      .joinByCode(
        this.projectId,
        this.signCode,
        this.inviterId
      )
      .finally(() => this.hideLoading())
      .then((project: IProjectData) => {

        // 成功提示
        const message = (project && project._id) ?
            '加入项目成功' :
            '您已加入项目';
        this.showMsg('success', message, (project && project.name));

        // 路由跳转
        if (this.nextUrl) {
          // 进入详情页面
          this.$window.location.replace(this.nextUrl);
        } else {
          // 进入项目首页
          this.$state.go('project.home', {
            _id: this.projectId
          }, {
            location: 'replace'
          });
        }
      })

      // 失败提示
      .catch(error => {
        const message = this.getFailureReason(error);
        this.showMsg('error', '加入项目失败', message);
      });
  }
}

angular.module('teambition').controller('Detail403View', Detail403View);
