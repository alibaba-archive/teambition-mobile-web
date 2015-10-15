/// <reference path='../../../.tmp/typings/tsd.d.ts' />
/// <reference path='../views/project-tabs/TabsView.ts' />
/// <reference path='../views/project/ProjectView.ts' />
/// <reference path='../views/project-home/PanelHomeView.ts' />
/// <reference path='../views/project-tasklist/PanelTasklistView.ts' />
/// <reference path='../views/project-post/PanelPostView.ts' />
/// <reference path='../views/project-work/PanelWorkView.ts' />
/// <reference path='../views/project-event/PanelEventView.ts' />
/// <reference path='../views/detail/DetailView.ts' />
declare module teambition {
  export interface IRootScope extends angular.IScope {
    global: IGlobal;
    loaded: boolean;
    zone: Zone;
    userMe: IUserMe;
    pending: angular.IPromise<any>;
  }

  interface IUserEmail {
    email: string;
    state: number;
    _id: string;
    id: string;
  }

  interface IUserMe {
    _id: string;
    email: string;
    name: string;
    avatarUrl: string;
    title: string;
    birthday: string;
    location: string;
    phone: string;
    isActive: boolean;
    website: string;
    pinyin: string;
    py: string;
    isNew: boolean;
    notification: {
      comment: {
        mobile: boolean;
        email: boolean;
      },
      newpost: {
        mobile: boolean;
        email: boolean;
      },
      newtask: {
        mobile: boolean;
        email: boolean;
      },
      newwork: {
        mobile: boolean;
        email: boolean;
      },
      newevent: {
        mobile: boolean;
        email: boolean;
      },
      involve: {
        mobile: boolean;
        email: boolean;
      },
      update: {
        mobile: boolean;
        email: boolean;
      },
      daily: {
        mobile: boolean;
        email: boolean;
      },
      monthly: {
        mobile: boolean;
        email: boolean;
      }
    };
    aliens: any[];
    strikerAuth: string;
    phoneForLogin: string;
    enabledGoogleTwoFactor: boolean;
    emails: IUserEmail[];
    snapperToken: string;
    hasNew: boolean;
    badge: number;
    inbox: number;
    normal: number;
    ated: number;
    later: number;
    private: number;
    hasNormal: boolean;
    hasAted: boolean;
    hasLater: boolean;
    hasPrivate: boolean;
    calLink: string;
    taskCalLink: string;
    joinedProjectsCount: number;
  }

  interface IGlobal {
    title: String;
  }
}
