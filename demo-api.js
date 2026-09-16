/* Demo-only adapter. No Telegram data, wallets or production APIs are accessed.
 * Replace this entire adapter with an authenticated server integration.
 * Production eligibility, rewards and ledger mutations must never run in the UI. */
(() => {
  'use strict';
  const seed = [
    {id:'community',title:'Вступи в сообщество CASE',category:'social',subtitle:'Сообщество',icon:'users',tone:'community',reward:150,state:'verified',description:'Присоединяйся к сообществу CASE и будь в курсе событий. Перед получением награды нужно подтвердить участие.'},
    {id:'channel',title:'Подпишись на канал CASE',category:'social',subtitle:'Официальный канал',icon:'send',tone:'social',reward:250,state:'available',description:'Подпишись на официальный канал CASE, чтобы узнавать о новостях и обновлениях. Затем вернись сюда и проверь выполнение.'},
    {id:'daily',title:'Заходи каждый день',category:'daily',subtitle:'Каждый день',icon:'sun',tone:'daily',reward:100,state:'available',description:'Заходи в CASE каждый день. После подтверждения посещения можно забрать сегодняшние баллы.'},
    {id:'explore',title:'Посмотри коллекцию призов',category:'daily',subtitle:'Знакомство с CASE',icon:'gift',tone:'explore',reward:200,state:'available',description:'Открой коллекцию призов и посмотри, что нового. Условия выполнения и доступность задания определяет CASE.'},
    {id:'welcome',title:'Добро пожаловать в CASE',category:'daily',subtitle:'Первые шаги',icon:'bolt',tone:'daily',reward:100,state:'already_claimed',description:'Твой первый шаг в CASE.'},
    {id:'profile',title:'Познакомься с профилем',category:'daily',subtitle:'Первые шаги',icon:'user',tone:'social',reward:100,state:'already_claimed',description:'Узнай, что есть в твоём профиле.'}
  ];
  let tasks = structuredClone(seed), balance = 1250, scenario = 'verified';
  let ledger = [{title:'Предыдущая демо-активность',amount:1050},{title:'Добро пожаловать в CASE',amount:100},{title:'Познакомься с профилем',amount:100}];
  const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
  const locks = new Set();
  const copy = () => ({tasks:structuredClone(tasks),balance,ledger:structuredClone(ledger),mode:'demo'});
  const task = id => {const value=tasks.find(t=>t.id===id);if(!value)throw new Error('Задание недоступно.');return value;};
  window.CaseTasksDemo = {
    async list(){await sleep(280);return copy();},
    async verify(id){
      const t=task(id);if(locks.has(id))return copy();
      if(['already_claimed','claimed','expired','verified'].includes(t.state))return copy();
      locks.add(id);t.state='verifying';const result=scenario;
      try {await sleep(1100);t.state=result==='server_error'?'verified':result;const response=copy();if(result==='server_error')response.tasks.find(item=>item.id===id).state='server_error';return response;} finally {locks.delete(id);}
    },
    async claim(id){
      const t=task(id);if(locks.has(id))return copy();
      if(['already_claimed','claimed'].includes(t.state))return copy();
      if(t.state!=='verified')throw new Error('Выполнение задания ещё не подтверждено.');
      locks.add(id);t.state='claiming';
      try {await sleep(850);balance+=t.reward;ledger.push({title:t.title,amount:t.reward});t.state='claimed';return copy();} finally {locks.delete(id);}
    },
    setScenario(value){if(!['verified','rejected','expired','retry_available','server_error'].includes(value))throw new Error('Неизвестный сценарий демо.');scenario=value;},
    getScenario(){return scenario;},
    async reset(){if(locks.size)throw new Error('Дождись завершения текущего действия.');tasks=structuredClone(seed);balance=1250;ledger=[{title:'Предыдущая демо-активность',amount:1050},{title:'Добро пожаловать в CASE',amount:100},{title:'Познакомься с профилем',amount:100}];scenario='verified';return copy();}
  };
})();
