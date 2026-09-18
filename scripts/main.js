import { mountCaseTasks } from './app.js?v=13';

window.caseTasks = mountCaseTasks(document.getElementById('case-tasks-root'), {
  host: window.CASE_TASKS_HOST,
  embedded: window.CASE_TASKS_EMBEDDED === true
});
