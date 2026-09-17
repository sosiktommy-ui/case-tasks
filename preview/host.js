// Presentation data for index.html and preview.html when no CASE host exists. embed.html never imports this file.
export function createPreviewHost() {
  const now = Date.now();
  const until = hours => new Date(now + hours * 3600000).toISOString();
  const task = (id, title, description, icon, progress, target, amount, extras = {}) => ({
    id, title, description, icon, progress, target, reward:{amount:String(amount), unit:'POINTS'},
    state:progress ? 'in_progress' : 'available', canClaim:false, canVerify:false,
    category:'daily', expiresAt:until(10.82), ...extras
  });
  const data = {
    revision:1, serverNow:new Date(now).toISOString(), balance:{amount:'1250',unit:'POINTS'},
    tasks:[
      task('daily-rounds','Complete 5 rounds','Play your favourite games. Each completed round counts.','rocket',2,5,50,{route:'home'}),
      task('daily-crash','Explore Crash','Complete 3 rounds in Crash.','gamepad',0,3,30,{route:'crash'}),
      task('daily-invite','Invite a friend','Invite someone new to discover CASE.','users',0,1,100,{route:'invite'}),
      task('daily-cases','Open 2 cases','Discover something new in the case collection.','case',0,2,75,{route:'cases'}),
      task('limited-collection','Complete the collection','Collect all 10 items in the featured set.','gift',4,10,500,{category:'limited',route:'collection',expiresAt:until(82),featured:true}),
      task('social-channel','Join the CASE channel','Stay close to new releases and community updates.','send',1,1,150,{category:'social',state:'verified',canClaim:true,canVerify:false,expiresAt:null}),
      task('social-news','Catch up with CASE','Read the latest community update.','star',0,1,100,{category:'social',route:'channel',expiresAt:null})
    ],
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
