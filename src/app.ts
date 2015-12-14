/// <reference path="./typings.d.ts" />
import {app} from './components/config/config';
import {RunFn, rootZone} from './run';
import {
  RootView,
  ProjectView,
  TabsView,
  PanelHomeView,
  PanelEventView,
  PanelPostView,
  PanelTasklistView,
  PanelWorkView,
  DetailView,
  ActivityView,
  TaskView,
  EditDuedateView,
  EditExectorView,
  EditNoteView,
  EditPriorityView,
  EditRecurrenceView,
  SubtaskView,
  CreateSubtaskView,
  PostView,
  FileView,
  LinkView,
  EditInvolveView,
  EventView,
  EntryView,
  EditContentView,
  TaskPositionSelectorView,
  ChooseProjectsView,
  ChooseStageView,
  ChooseTasklistView,
  CreateEventView,
  CreatePostView,
  CreateProjectView,
  CreateTaskView
} from './components/views/Views';
import {
  Notify,
  InputComponments,
  ProjectHomeActivity,
  TaskFilter
} from './components/et/ETs';

angular.module('et.template')
.service('notify', Notify)
.service('InputComponments', InputComponments)
.service('ProjectHomeActivity', ProjectHomeActivity)
.service('taskFilter', TaskFilter);

angular.module('teambition')
.constant('app', app)
.constant('moment', moment)
.constant('marked', marked)
.run(RunFn)
.controller('RootView', RootView)
.controller('ProjectView', ProjectView)
.controller('TabsView', TabsView)
.controller('PanelHomeView', [PanelHomeView])
.controller('PanelEventView', PanelEventView)
.controller('PanelPostView', PanelPostView)
.controller('PanelTasklistView', PanelTasklistView)
.controller('PanelWorkView', PanelWorkView)
.controller('ActivityView', ActivityView)
.controller('DetailView', DetailView)
.controller('TaskView', TaskView)
.controller('EditDuedateView', EditDuedateView)
.controller('EditExectorView', EditExectorView)
.controller('EditNoteView', EditNoteView)
.controller('EditPriorityView', EditPriorityView)
.controller('EditRecurrenceView', EditRecurrenceView)
.controller('SubtaskView', SubtaskView)
.controller('CreateSubtaskView', CreateSubtaskView)
.controller('PostView', PostView)
.controller('FileView', FileView)
.controller('LinkView', LinkView)
.controller('EditInvolveView', EditInvolveView)
.controller('EventView', EventView)
.controller('EntryView', EntryView)
.controller('EditContentView', EditContentView)
.controller('TaskPositionSelectorView', TaskPositionSelectorView)
.controller('ChooseProjectsView', ChooseProjectsView)
.controller('ChooseStageView', ChooseStageView)
.controller('ChooseTasklistView', ChooseTasklistView)
.controller('CreateEventView', CreateEventView)
.controller('CreatePostView', CreatePostView)
.controller('CreateProjectView', [CreateProjectView])
.controller('CreateTaskView', CreateTaskView);

rootZone.run(() => {
  angular.element(document).ready(() => {
    angular.bootstrap(document, ['teambition']);
  });
});

export * from './components/config/ngConfig';
export * from './components/config/router';
export * from './components/directives/directive';
