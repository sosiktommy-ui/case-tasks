import { mountCaseTasks } from './app.js?v=3';

// No preview fallback. A missing integration never invents account data.
window.caseTasks = mountCaseTasks(document.getElementById('case-tasks-root'), {
  host: window.CASE_TASKS_HOST,
  embedded: window.CASE_TASKS_EMBEDDED === true
});
