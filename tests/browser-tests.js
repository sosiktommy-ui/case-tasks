// Run in a local browser: import('/tests/browser-tests.js').then(m => m.runTests()).
// Every host below is an in-memory test double. No CASE requests are made.
import { mountCaseTasks } from '../scripts/app.js';
import { validateSnapshot, validateOperation, taskAction, rewardText, remaining } from '../scripts/model.js';
import { createPreviewHost } from '../preview/host.js';

export async function runTests() {
  const results=[];
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const wait=async(test)=>{for(let i=0;i<100;i++){if(test())return;await pause(20);}throw new Error('Timed out waiting for UI state');};
  const root=document.createElement('div');document.body.append(root);
  let mounted;
  const prefix=`test-${crypto.randomUUID()}`;
  const base=await createPreviewHost().getSnapshot();
  const sample=()=>{
    const data=structuredClone(base);data.tasks=[{...data.tasks[0],id:prefix,state:'verified',canClaim:true,canVerify:false}];
    data.achievements=[];data.revision=1;return data;
  };
  const hostFor=data=>({
    getSnapshot:async()=>structuredClone(data),
    verifyTask:async()=>structuredClone(data),
    claimReward:async()=>{throw new Error('Not configured');},
    getOperation:async()=>({status:'pending',snapshot:structuredClone(data)}),
    navigate:async()=>{}
  });
  const mount=async(host,opts={})=>{mounted?.destroy();mounted=mountCaseTasks(root,{host,...opts});await wait(()=>root.querySelector('#live-content')?.getAttribute('aria-busy')==='false');};
  const test=async(name,run)=>{await run();results.push({name,passed:true});};
  try {
    await test('Model fails closed for unverified claim, malformed data and false success',async()=>{
      const t=sample().tasks[0];t.state='in_progress';
      assert(taskAction(t,Date.now()).kind!=='claim','Client allowed unverified claim');
      const bad=sample();bad.tasks[0].progress=Infinity;
      let denied=false;try{validateSnapshot(bad);}catch{denied=true;}assert(denied,'Accepted invalid progress');
      denied=false;try{validateOperation({status:'succeeded',snapshot:sample()},prefix);}catch{denied=true;}assert(denied,'Accepted unconfirmed success');
      assert(rewardText({amount:'9007199254740993.123456789',unit:'TON'})==='9,007,199,254,740,993.123456789','Decimal precision lost');
      assert(remaining(new Date(1000).toISOString(),2000)==='Ended','Expired timer wrong');
    });
    await test('Production without host shows no invented tasks or balance',async()=>{
      await mount(undefined);assert(root.querySelectorAll('[data-card]').length===0,'Sample tasks leaked');
      assert(root.querySelector('#balance-value').textContent.includes('—'),'Balance fabricated');
      assert(root.textContent.includes('Open this page inside CASE'),'Missing integration state');
    });
    await test('Review never calls claim or verify',async()=>{
      let mutations=0;const data=sample(),host=hostFor(data);
      host.claimReward=host.verifyTask=async()=>{mutations++;throw Error('Forbidden');};
      await mount(host,{review:true});root.querySelector('[data-task-action]').click();
      assert(root.querySelector('[data-sheet-action]').disabled,'Review enables mutation');
      assert(mutations===0,'Review made a mutation');root.querySelector('dialog').close();
    });
    await test('Double click submits one claim and renders authoritative balance',async()=>{
      let count=0;const data=sample(),host=hostFor(data);
      host.claimReward=async()=>{count++;await pause(60);data.tasks[0].state='claimed';data.tasks[0].canClaim=false;data.balance.amount='7777';data.revision++;return{status:'succeeded',snapshot:structuredClone(data)};};
      await mount(host);root.querySelector('[data-task-action]').click();root.querySelector('[data-task-action]').click();
      await wait(()=>root.querySelector('#balance-value').textContent.includes('7,777'));
      assert(count===1,'Duplicate claim sent');assert(root.querySelector('[data-task-action]').disabled,'Claimed task remains enabled');
    });
    await test('Uncertain claim survives remount and reuses key until confirmed',async()=>{
      const data=sample();data.tasks[0].id=prefix+'-uncertain';const id=data.tasks[0].id,host=hostFor(data);let sentKey,lookups=0,lookupKey;
      host.claimReward=async({idempotencyKey})=>{sentKey=idempotencyKey;throw Error('Connection lost');};
      host.getOperation=async({idempotencyKey})=>{lookupKey=idempotencyKey;lookups++;if(lookups===1)return{status:'pending',snapshot:structuredClone(data)};data.tasks[0].state='claimed';data.tasks[0].canClaim=false;data.balance.amount='1400';data.revision++;return{status:'succeeded',snapshot:structuredClone(data)};};
      await mount(host);root.querySelector('[data-task-action]').click();await wait(()=>root.querySelector('[data-task-action]').textContent.includes('Check status'));
      await mount(host);assert(root.querySelector('[data-task-action]').textContent.includes('Check status'),'Lost uncertain operation on remount');
      root.querySelector('[data-task-action]').click();await wait(()=>root.querySelector('[data-task-action]').textContent.includes('Check status'));
      await pause(30);root.querySelector('[data-task-action]').click();await wait(()=>root.querySelector('#balance-value').textContent.includes('1,400'));
      assert(sentKey===lookupKey&&lookups===2,'Operation identity changed');
      assert(sessionStorage.getItem(`case:pending:${id}`)===null,'Confirmed operation still pending');
    });
    await test('Rejected verification does not grant reward',async()=>{
      const data=sample();data.tasks[0].id=prefix+'-verify';data.tasks[0].state='available';data.tasks[0].canVerify=true;data.tasks[0].canClaim=false;
      const host=hostFor(data);host.verifyTask=async()=>{data.tasks[0].state='rejected';data.revision++;return structuredClone(data);};
      await mount(host);root.querySelector('[data-task-action]').click();await wait(()=>root.textContent.includes('Not verified yet'));
      assert(root.querySelector('#balance-value').textContent.includes('1,250'),'Verification changed balance');
    });
    await test('Stale revisions cannot roll back account data',async()=>{
      const data=sample();data.revision=10;data.balance.amount='2000';const host=hostFor(data);await mount(host);
      host.getSnapshot=async()=>({...sample(),revision:9,balance:{amount:'1',unit:'POINTS'}});
      await mounted.refresh();assert(root.querySelector('#balance-value').textContent.includes('2,000'),'Stale snapshot overwrote latest');
    });
    await test('Changing host ignores old responses and clears old balance',async()=>{
      const data=sample(),host=hostFor(data);await mount(host);
      host.getSnapshot=async()=>{await pause(100);return data;};const old=mounted.refresh();
      const fresh=sample();fresh.balance.amount='8888';await mounted.setHost(hostFor(fresh));await old;await pause(120);
      assert(root.querySelector('#balance-value').textContent.includes('8,888'),'Old host overwrote new host');
    });
    await test('Untrusted title and description are rendered as text',async()=>{
      const data=sample();data.tasks[0].title='<img src=x onerror=alert(1)>';data.tasks[0].description='<script>alert(1)</script>';
      await mount(hostFor(data));assert(!root.querySelector('img[src=x]'),'Title became HTML');
      assert(root.textContent.includes('<script>alert(1)</script>'),'Description was not preserved as text');
    });
    await test('Retry becomes available after server-based retry time',async()=>{
      const data=sample();data.tasks[0].state='retry_available';data.tasks[0].canVerify=true;data.tasks[0].canClaim=false;
      data.serverNow=new Date().toISOString();data.tasks[0].retryAt=new Date(Date.now()+700).toISOString();
      await mount(hostFor(data));assert(root.querySelector('[data-task-action]').disabled,'Retry was early');
      await wait(()=>!root.querySelector('[data-task-action]').disabled);
    });
    await test('Destroy removes mounted UI',async()=>{mounted.destroy();assert(root.children.length===0,'UI leaked after destroy');});
    return results;
  } finally {
    mounted?.destroy();root.remove();
    for(const key of Object.keys(sessionStorage))if(key.includes(prefix))sessionStorage.removeItem(key);
  }
}
