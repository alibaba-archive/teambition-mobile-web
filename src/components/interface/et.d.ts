/// <reference path='../et/ETComponents.ts' />
/// <reference path='../et/notify/notify.ts' />

declare module EtTemplate {

  interface IParamData {
    [index: string]: any;
  }

  interface IUpdateParam {
    scope?: IParamData;
    [index: string]: any;
  }

  export interface IETProto {
    update(data: IUpdateParam): void;
    get(): DocumentFragment;
    remove(): void;
    destroy(): void;
  }
}
