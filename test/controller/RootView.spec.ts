/// <reference path='../../src/components/interface/teambition.d.ts' />
import userMe from '../mock/userme.mock';

declare let sinonChai;

const expect = chai.expect;

chai.should();

export default describe('RootView test', () => {

  let controller: angular.IControllerService;
  let rootScope: teambition.IRootScope;
  let scope: angular.IScope;
  let httpBackend: angular.IHttpBackendService;
  let RootView: teambition.RootView;

  beforeEach(() => {
    angular.mock.inject((
      $rootScope: teambition.IRootScope,
      $controller: angular.IControllerService,
      $httpBackend: angular.IHttpBackendService
    ) => {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      controller = $controller;
      httpBackend = $httpBackend;
      RootView = controller<teambition.RootView>('RootView as RootCtrl', {$scope: scope});
    });
    httpBackend.whenGET('http://project.ci/api/users/me').respond(userMe);
  });

  it('get user me should ok', function (done: Function) {
    expect(RootView.ViewName).to.equal('RootView');
    RootView.onInit().then(() => {
      expect(RootView.userMe).to.have.property('_id');
      expect(RootView.userMe).to.have.property('name');
      expect(RootView.userMe).to.have.property('avatarUrl');
      expect(RootView.userMe).to.have.property('email');
      done();
    });
    httpBackend.flush();
  });

  it('onAllChangesDone should ok', () => {
    let mockListener = sinon.spy();
    RootView.socketListener = mockListener;
    RootView.onAllChangesDone();
    mockListener.should.have.been.calledWith('new', 'message');
    mockListener.should.have.been.calledWith('change', 'message');
  });

  it('init rootScope should ok', (done: Function) => {
    let mockSocket = sinon.spy();
    RootView.socket = mockSocket;
    RootView.onInit().then(() => {
      expect(rootScope.userMe.toJSON()).to.be.deep.equal(userMe);
      mockSocket.should.have.been.calledWith(userMe.snapperToken);
      done();
    });
    httpBackend.flush();
  });

});
