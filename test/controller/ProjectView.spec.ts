import projects from '../mock/projects.mock';
import {Ding} from '../../src/run';
import {ProjectView, fields, app} from '../../src/app';
import {IRootScope, IProjectData} from 'teambition';

declare let sinonChai;

const expect = chai.expect;

chai.should();
export default describe('ProjectView test', () => {

  let controller: angular.IControllerService;
  let rootScope: IRootScope;
  let scope: angular.IScope;
  let httpBackend: angular.IHttpBackendService;
  let ProjectView: ProjectView;

  let ProjectsAPIHost: string;

  ProjectsAPIHost = `${app.apiHost}/projects?fields=${fields.projectFileds}`;

  beforeEach(() => {
    angular.mock.inject((
      $rootScope: IRootScope,
      $controller: angular.IControllerService,
      $httpBackend: angular.IHttpBackendService
    ) => {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      controller = $controller;
      httpBackend = $httpBackend;
      ProjectView = controller<ProjectView>('ProjectView as ProjectCtrl', {$scope: scope});
      httpBackend.whenGET(ProjectsAPIHost).respond(projects);
    });
  });

  describe('onInit should ok', () => {
    it('public property should ok', (done: Function) => {
      ProjectView.onInit().then(() => {
        expect(ProjectView.projects).to.be.an.instanceof(Array);
        expect(ProjectView.staredProject).to.be.an.instanceof(Array);
        expect(ProjectView.personalProjects).to.be.an.instanceof(Array);
        angular.forEach(ProjectView.organization, (val: any, key: string) => {
          let organizationId = key;
          let organizationName = val.name;
          expect(organizationId).to.equal(val.id);
          angular.forEach(val.projects, (
            project: IProjectData,
            index: number
          ) => {
            expect(project.organization._id).to.equal(organizationId);
            expect(project.organizationId).to.equal(organizationId);
            expect(project.organization.name).to.equal(organizationName);
            expect(project.organizationName).to.equal(organizationName);
          });
        });
        done();
      });
      httpBackend.flush();
    });

    it ('project parsed should have no effect to raw data', (done: Function) => {
      ProjectView.onInit().then(() => {
        angular.forEach(ProjectView.projects, (
          project: IProjectData
        ) => {
          angular.forEach(projects, (rawProject: IProjectData) => {
            if (rawProject._id === project._id) {
              angular.forEach(rawProject, (val: any, key: string) => {
                expect(project[key]).to.deep.equal(val);
              });
            }
          });
        });
        done();
      });
      httpBackend.flush();
    });
  });

  it('onAllChangesDone should ok', () => {
    let mockSetLeft = sinon.spy(Ding, 'setLeft');
    let mockRight = sinon.spy(Ding, 'setRight');
    ProjectView.onAllChangesDone();
    mockSetLeft.should.have.been.calledWith('关闭', true, true);
    mockRight.should.have.been.calledWith('创建项目', true, true);
  });

  it('starProject should ok', (done: Function) => {
    let isStar: boolean;
    let project: IProjectData;
    ProjectView.onInit().then(() => {
      project = ProjectView.projects[1];
      isStar = project.isStar;
      httpBackend
      .when('PUT', `${app.apiHost}/projects/${project._id}/star`)
      .respond({
        _id: project._id,
        isStar: true,
        starsCount: 1
      });
      httpBackend
      .when('DELETE', `${app.apiHost}/projects/${project._id}/star`)
      .respond({
        _id: project._id,
        isStar: false,
        starsCount: 0
      });
      return ProjectView.starProject(project);
    })
    .then(() => {
      expect(project.isStar).to.equal(!isStar);
      return ProjectView.unStarProject(project);
    })
    .then(() => {
      expect(project.isStar).to.equal(isStar);
      done();
    });
    httpBackend.flush();
  });

  it('countStar should ok', (done: Function) => {
    ProjectView.onInit().then(() => {
      let result = ProjectView.countStar();
      expect(result).to.be.true;
      ProjectView.organizationId = 'test';
      let newResult = ProjectView.countStar();
      expect(newResult).to.be.false;
      done();
    });
    httpBackend.flush();
  });

  it('countProject should ok', (done: Function) => {
    ProjectView.onInit().then(() => {
      let result = ProjectView.countProject();
      expect(result).to.equal(7);
      ProjectView.organizationId = 'test';
      let newResult = ProjectView.countProject();
      expect(newResult).to.equal(0);
      done();
    });
    httpBackend.flush();
  });

});
