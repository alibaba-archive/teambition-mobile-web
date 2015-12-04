/// <reference path="../../../interface/teambition.d.ts" />
module teambition {
  'use strict';

  let projectId: string;

  let fileUploadQueue: {
    progress: string;
    request: angular.IPromise<void>;
    content: any;
  }[];

  let fileContent = [];

  let hide: any;
  let hideOptions: any;

  fileUploadQueue = [];

  @parentView('TabsView')
  @inject([
    'WorkAPI',
    'StrikerAPI',
    'InputComponments'
  ])
  class PanelWorkView extends View {

    public ViewName = 'PanelWorkView';

    public works: IFileDataParsed[];
    public collections: ICollectionData[];

    public folderName: string;

    private WorkAPI: IWorkAPI;
    private StrikerAPI: IStrikerAPI;
    private collectionId: string;
    private InputComponments: EtTemplate.InputComponments;
    private fileContent: any[];

    // @ngInject
    constructor(
      $scope: angular.IScope
    ) {
      super();
      this.$scope = $scope;
      this.zone.run(() => {
        this.fileContent = fileContent;
      });
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
        Ding.setRight('新建', true, false, () => {
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
      if (typeof hide === 'function') {
        hide();
      }
      hide = this.$ionicActionSheet.show({
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

    public uploadFile() {
      let contents = [];
      angular.forEach(this.fileContent, (file: any, index: number) => {
        file.fileType = file.name.split('.').pop();
        if (file.fileType.length > 4) {
          file.fileType = file.fileType.substr(0, 1);
          file.class = 'bigger-bigger';
        }
        if (
          file.fileType.indexOf('png') !== -1 ||
          file.fileType.indexOf('jpg') !== -1 ||
          file.fileType.indexOf('jpeg') !== -1 ||
          file.fileType.indexOf('gif') !== -1 ||
          file.fileType.indexOf('bmp') !== -1
        ) {
          file.thumbnail = URL.createObjectURL(file);
        }
        let content = {
          progress: '0',
          request: null,
          content: file,
          index: index
        };
        content.request = this.StrikerAPI.upload([file], content).then((res: IStrikerRes) => {
          return this.WorkAPI.uploads(this.collectionId, projectId, [res]);
        })
        .then(() => {
          let $index: number;
          angular.forEach(this.fileContent, (_content: any, i: number) => {
            if (_content.index === content.index) {
              $index = i;
            }
          });
          contents.splice($index, 1);
        })
        .catch((reason: any) => {
          let message = this.getFailureReason(reason);
          this.showMsg('error', '上传出错', message);
          let $index: number;
          angular.forEach(this.fileContent, (_content: any, i: number) => {
            if (_content.index === content.index) {
              $index = i;
            }
          });
          contents.splice($index, 1);
        });
        contents.push(content);
      });
      this.fileContent = contents;
      fileContent = contents;
    }

    private initFetch() {
      this.collectionId = this.$state.params._collectionId;
      return this.parent.fetchProject(projectId)
      .then((project: IProjectDataParsed) => {
        this.collectionId = this.collectionId || project._rootCollectionId;
        return this.$q.all([
          this.WorkAPI.fetchWorks(projectId, this.collectionId)
          .then((files: IFileDataParsed[]) => {
            this.works = files;
            return files;
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
      if (typeof hideOptions === 'function') {
        hideOptions();
      }
      hideOptions = this.$ionicActionSheet.show({
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
      if (!this.fileContent || !this.fileContent.length) {
        this.InputComponments.show(this);
      }
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
