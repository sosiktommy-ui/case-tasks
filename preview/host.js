import {missionCatalog} from './catalog.js?v=12';
export function createPreviewHost() {
  const now = Date.now();
  const until = hours => new Date(now + hours * 3600000).toISOString();
  const task = (id, title, description, icon, progress, target, amount, extras = {}) => ({
    id, title, description, icon, progress, target, reward:{amount:String(amount), unit:'TON'},
    state:progress ? 'in_progress' : 'available', canClaim:false, canVerify:false,
    category:'daily', expiresAt:until(10.82), ...extras
  });
  const data = {
    revision:1, serverNow:new Date(now).toISOString(), balance:{amount:'0.066',unit:'TON'},
    tasks:missionCatalog.map(m=>task(m.id,m.title,m.description,m.icon,m.progress,m.target,m.amount,{
      category:m.category,route:m.route,featured:!!m.featured,icon:({"daily-signal":"bear","daily-explorer":"golden","daily-code":"spooky","daily-quiz":"bunny","daily-save":"duck","daily-profile":"helmet","limited-streak":"genie","limited-crew":"fighters","limited-curator":"witch","social-partner":"backpack","social-invite":"friends","social-read":"ghost","social-vote":"lamp"})[m.id]||m.icon,visual:({'limited-passport':'passport','limited-streak':'reactor','limited-crew':'crew'})[m.id]||'path',
      state:m.state||(m.progress?'in_progress':'available'),canClaim:m.state==='verified',
      expiresAt:m.category==='social'?null:until(m.category==='limited'?120:10.82),
      steps:m.steps.map(([title,description])=>({title,description}))
    })),
    achievements:[
      task('ach-first','First steps','Complete your first task.','star',1,1,50,{state:'already_claimed',expiresAt:null}),
      task('ach-explorer','Case explorer','Discover 10 different cases.','case',3,10,250,{expiresAt:null}),
      task('ach-social','Better together','Invite 5 friends to CASE.','users',1,5,300,{expiresAt:null}),
      task('ach-collector','The collector','Complete a featured collection.','crown',0,1,500,{expiresAt:null}),
      task('ach-regular','Make it a habit','Complete 20 daily tasks.','bolt',7,20,400,{expiresAt:null}),
      task('ach-master','Task master','Complete 100 tasks.','trophy',12,100,1000,{expiresAt:null})
    ]
  };
  const unavailable = () => { throw new Error('This read-only design review is not connected to CASE.'); };
  return {
    async getSnapshot() { return structuredClone({...data, serverNow:new Date().toISOString()}); },
    verifyTask:unavailable, claimReward:unavailable, getOperation:unavailable, navigate:unavailable
  };
}
