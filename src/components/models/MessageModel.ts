import {IMessageData} from 'teambition';
import BaseModel from '../bases/BaseModel';

class MessageModel extends BaseModel {

  // private DetailModel: IDetailModel;
  // private ActivityModel: IActivityModel;

  public saveOne(data: IMessageData) {
    // if (data._boundToObjectId && data.boundToObjectType && data.latestActivity) {
    //   let cache = this.DetailModel.getDetail(`${data.boundToObjectType}:detail:${data._boundToObjectId}`);
    //   if (!cache) {
    //     this.DetailModel.setDetail(`${data.boundToObjectType}:detail:${data._boundToObjectId}`, data[data.boundToObjectType]);
    //   }else {
    //     this.ActivityModel.addActivity(data._boundToObjectId, data.latestActivity);
    //     this.DetailModel.updateDetail(`${data.boundToObjectType}:detail:${data._boundToObjectId}`, data[data.boundToObjectType]);
    //   }
    // }
  }
}

export default new MessageModel();
