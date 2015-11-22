/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  @parentView('TabsView')
  @inject([
    'WorkAPI'
  ])
  class PanelWorkView extends View {

    public ViewName = 'PanelWorkView';

    public works: IFileDataParsed[];
    public collections: ICollectionData[];

    public folderName: string;

    private WorkAPI: IWorkAPI;
    private collectionId: string;

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.zone.run(noop);
    }

    public onInit() {
      projectId = this.$state.params._id;
      return this.initFetch();
    }

    public onAllChangesDone() {
      if (Ding) {
        if (this.$state.params._collectionId) {
          Ding.setLeft('返回', true, true, () => {
            window.history.back();
          });
        }else {
          Ding.setLeft('返回', true, true, () => {
            location.href = location.href.replace(window.location.hash, '') + '#/projects';
          });
        }
        Ding.setRight('新建文件(夹)', true, false, () => {
          this.showOptions();
        });
      }
    }

    public openDetail(_id: string) {
      if (!_id) {
        return;
      }
      window.location.hash = `/detail/work/${_id}`;
    }

    public openCollection(id: string) {
      if (id) {
        window.location.hash = `/project/${projectId}/work/${id}`;
      }
    }

    public fileOptions(type: string, $index: any) {
      this.$ionicActionSheet.show({
        buttons: [{
          text: '<font>重命名</font>'
        },
        {
          text: '<font color="red">删除</font>'
        }],
        cancelText: '取消',
        buttonClicked: (index: number) => {
          switch (index) {
            case 0 :
              this.renameFile(type, $index);
              break;
            case 1 :
              this.deleteFile(type, $index);
              break;
          };
          return true;
        }
      });
    }

    private initFetch() {
      this.collectionId = this.$state.params._collectionId;
      return this.parent.fetchProject(projectId)
      .then((project: IProjectDataParsed) => {
        this.collectionId = this.collectionId || project._rootCollectionId;
        return this.$q.all([
          this.WorkAPI.fetchWorks(projectId, this.collectionId)
          .then((works: IFileDataParsed[]) => {
            this.works = works;
            return works;
          }),
          this.WorkAPI.fetchCollections(projectId, this.collectionId)
          .then((collections: ICollectionData[]) => {
            this.collections = collections;
            return collections;
          })
        ]);
      });
    }

    private showOptions() {
      this.$ionicActionSheet.show({
        buttons: [{
          text: '<font>新建文件</font>'
        },
        {
          text: '<font>新建文件夹</font>'
        }],
        cancelText: '取消',
        buttonClicked: (index: number) => {
          switch (index) {
            case 0 :
              this.createFile();
              break;
            case 1 :
              this.createFolder();
              break;
          };
          return true;
        }
      });
    }

    private createFolder() {
      let popup: any = this.$ionicPopup.show({
        template: '<input type="text" ng-model="PanelWorkCtrl.folderName" placeholder="文件夹名">',
        title: '新建文件夹',
        scope: this.$scope,
        buttons: [{
          text: '取消'
        }, {
          text: '确定',
          onTap: () => {
            if (this.folderName) {
              this.showLoading();
              return this.WorkAPI.createCollection(this.folderName, this.collectionId, projectId)
              .then(() => {
                this.hideLoading();
              })
              .catch((reason: any) => {
                let message = this.getFailureReason(reason);
                this.showMsg('error', '创建失败', message);
                this.hideLoading();
              });
            }
            popup.close();
          }
        }]
      });
    }

    private createFile() {
      console.log('create file');
    }

    private renameFile(type: string, index: number) {
      let name = type === 'collections' ? 'title' : 'fileName';
      let object = this[type][index];
      let cacheName = object[name];
      let popup: any = this.$ionicPopup.show({
        template: `<input type="text" ng-model="PanelWorkCtrl.${type}[${index}].${name}">`,
        title: '重命名',
        scope: this.$scope,
        buttons: [{
          text: '取消'
        }, {
          text: '确定',
          onTap: () => {
            this.showLoading();
            this.WorkAPI.rename(type, this[type][index]._id, this[type][index][name])
            .then(() => {
              this.hideLoading();
            })
            .catch((reason: any) => {
              let message = this.getFailureReason(reason);
              this.showMsg('error', '重命名失败', message);
              this.hideLoading();
              object[name] = cacheName;
            });
            popup.close();
          }
        }]
      });
    }

    private deleteFile(type: string, $index: number) {
      let id = this[type][$index]._id;
      this.WorkAPI.delete(type, id)
      .catch((reason: any) => {
        let message = this.getFailureReason(reason);
        this.showMsg('error', '删除失败', message);
      });
    }
  }

  angular.module('teambition').controller('PanelWorkView', PanelWorkView);
}
