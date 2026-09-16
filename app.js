(() => {
  'use strict';
  const paths = {
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    send:'<path d="m21 3-7 18-4-7-7-4 18-7Z"/><path d="m10 14 6-6"/>',
    gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"/>',
    grid:'<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="15" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/>',
    rocket:'<path d="M14 5c4-3 7-2 7-2s1 3-2 7l-8 8-5-5 8-8Z"/><circle cx="16" cy="8" r="1.5"/><path d="m8 11-5 1 2-5 7-1m1 10-1 5 5-2 1-7M6 17l-3 4 4-3"/>',
    craft:'<path d="m14 4 5 5-4 4-5-5 4-4Zm-2 6L3 19l2 2 9-9M13 3l8 8M3 5l2 2m0-4L3 5m14 12 4 4m0-4-4 4"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h10"/>',
    wheel:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2v8m0 4v8M2 12h8m4 0h8M5 5l5.5 5.5m3 3L19 19M5 19l5.5-5.5m3-3L19 5M8 3l3 7m2 4 3 7M3 8l7 3m4 2 7 3M3 16l7-3m4-2 7-3M8 21l3-7m2-4 3-7"/>',
    settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="3" fill="currentColor" stroke="none"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3"/>',
    star:'<path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7Z"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.star}</svg>`;
  const escape = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  const api = window.CaseTasksAPI || window.CaseTasksDemo;
  const demo = api === window.CaseTasksDemo;
  document.querySelector('.demo-label').hidden=!demo;
  document.querySelector('.preview-badge').hidden=!demo;
  const stateLabels={
    available:{label:'Можно начать',action:'Начать',icon:'clock'},
    verified:{label:'Можно забрать',action:'Забрать',icon:'check-circle',tone:'success'},
    verifying:{label:'Проверяем выполнение…',action:'Проверяем…',icon:'refresh',busy:true},
    claiming:{label:'Начисляем награду…',action:'Начисляем…',icon:'refresh',busy:true},
    rejected:{label:'Ещё не выполнено',action:'Повторить',icon:'info',tone:'error'},
    already_claimed:{label:'Награда уже получена',action:'Получено',icon:'check-circle',tone:'success',disabled:true},
    claimed:{label:'Награда получена',action:'Получено',icon:'check-circle',tone:'success',disabled:true},
    expired:{label:'Срок задания истёк',action:'Истекло',icon:'clock',disabled:true},
    retry_available:{label:'Можно проверить ещё раз',action:'Повторить',icon:'refresh'},
    server_error:{label:'Не удалось узнать результат',action:'Обновить',icon:'info',tone:'error'}
  };
  let data={tasks:[],balance:0,ledger:[]}, filter='all', activeTask=null, modalType=null, toastTimer, lastFocus;
  const busy=new Set(),sheet=document.getElementById('sheet'),sheetBody=document.getElementById('sheet-body');
  const done = t => ['claimed','already_claimed'].includes(t.state);
  const num = value => Number(value).toLocaleString('ru-RU');
  function notify(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3800);}
  function card(t){
    const s=stateLabels[t.state]||stateLabels.server_error;
    return `<article class="task-card ${t.state==='verified'?'is-ready':''}" data-task-card="${escape(t.id)}"><div class="task-top"><div class="task-icon ${escape(t.tone)}">${icon(t.icon)}</div><div class="task-text"><span class="task-category">${escape(t.subtitle)}</span><h3>${escape(t.title)}</h3></div><div class="reward">+${num(t.reward)}<span>БАЛЛОВ</span></div></div><div class="task-bottom"><span class="task-status ${s.tone||''}"><span class="${s.busy?'loading-icon':''}">${icon(s.icon)}</span>${s.label}</span><button class="task-button ${t.state==='verified'?'primary':''}" data-task="${escape(t.id)}" ${s.disabled||s.busy?'disabled':''} aria-label="${s.action}: ${escape(t.title)}">${s.action}</button></div></article>`;
  }
  function render(){
    const pending=data.tasks.filter(t=>!done(t)),completed=data.tasks.filter(done),visible=pending.filter(t=>filter==='all'||t.category===filter);
    document.getElementById('balance').textContent=num(data.balance);
    document.getElementById('progress-label').textContent=`${completed.length} / ${data.tasks.length} получено`;
    document.getElementById('progress-fill').style.width=`${data.tasks.length?completed.length/data.tasks.length*100:0}%`;
    const progress=document.querySelector('[role=progressbar]');progress.setAttribute('aria-valuenow',completed.length);progress.setAttribute('aria-valuemax',data.tasks.length||1);
    document.getElementById('available-count').textContent=`Доступно: ${pending.filter(t=>t.state!=='expired').length}`;
    document.getElementById('all-count').textContent=pending.length;
    const list=document.getElementById('tasks');list.setAttribute('aria-busy','false');
    list.innerHTML=visible.length?visible.map(card).join(''):`<div class="empty-state">${icon('check-circle')}<h3>Всё готово!</h3><p>${filter==='all'?'Все задания выполнены. Заглядывай за новыми.':'В этой категории пока нет заданий. Выбери другую.'}</p></div>`;
    document.getElementById('completed-count').textContent=completed.length;
    document.getElementById('completed-list').innerHTML=completed.map(card).join('');
    if(modalType==='task'&&sheet.open)renderTaskSheet();
  }
  function openSheet(type,html){
    modalType=type;sheetBody.innerHTML=html;
    if(!sheet.open){lastFocus=document.activeElement;sheet.showModal();}
  }
  function closeSheet(){sheet.close();modalType=null;activeTask=null;}
  sheet.addEventListener('close',()=>{modalType=null;activeTask=null;if(lastFocus?.isConnected)lastFocus.focus();});
  sheet.addEventListener('click',event=>{if(event.target===sheet){const r=sheet.getBoundingClientRect();if(event.clientY<r.top||event.clientX<r.left||event.clientX>r.right||event.clientY>r.bottom)closeSheet();}});
  function renderTaskSheet(){
    const t=data.tasks.find(t=>t.id===activeTask);if(!t)return;
    const s=stateLabels[t.state]||stateLabels.server_error;
    const focusedAction=sheetBody.contains(document.activeElement)?document.activeElement.dataset.action:null;
    const messages={verified:'Выполнение подтверждено. Теперь можно забрать баллы.',verifying:'Проверяем выполнение. Награда пока не начислена.',claiming:'Начисляем награду. Пожалуйста, подожди.',rejected:'Выполнение не подтверждено. Проверь условия и попробуй ещё раз.',expired:'Срок этого задания истёк. Выбери другое.',retry_available:'Теперь можно повторить проверку задания.',server_error:'Результат пока неизвестен. Обнови статус перед повторной попыткой.',claimed:'Награда добавлена к твоим тестовым баллам.',already_claimed:'Ты уже получил награду за это задание.'};
    const label=t.state==='available'?'Проверить':s.action;
    sheetBody.innerHTML=`<div class="sheet-emblem">${icon(t.icon)}</div><h2 id="sheet-title">${escape(t.title)}</h2><p>${escape(t.description)}</p><div class="sheet-reward"><span>Награда за задание</span><strong>+${num(t.reward)} баллов</strong></div>${messages[t.state]?`<p class="sheet-state" role="status">${messages[t.state]}</p>`:''}${t.state==='available'?'<button class="sheet-secondary" data-action="visit">Открыть задание</button>':''}<button class="sheet-primary" data-action="task-submit" ${s.disabled||s.busy?'disabled':''}>${label}</button><p class="sheet-note">${demo?'Это демо. Настоящих подписок и начислений нет.':'Награда появится только после подтверждения.'}</p>`;
    if(focusedAction){const target=sheetBody.querySelector('[data-action="'+focusedAction+'"]');if(target&&!target.disabled)target.focus({preventScroll:true});else document.querySelector('.sheet-close').focus({preventScroll:true});}
  }
  function showTask(id){activeTask=id;openSheet('task','');renderTaskSheet();}
  async function actTask(id){
    const t=data.tasks.find(t=>t.id===id);if(!t||busy.has(id))return;
    const original=t.state;if(stateLabels[original]?.disabled)return;
    if(original==='server_error')return refresh();
    busy.add(id);t.state=original==='verified'?'claiming':'verifying';render();
    try {
      data=await(original==='verified'?api.claim(id):api.verify(id));render();
      const updated=data.tasks.find(t=>t.id===id);
      if(updated&&done(updated)){notify(`+${num(updated.reward)} ${demo?'тестовых баллов':'баллов'} начислено`);if(sheet.open)closeSheet();document.querySelector(`[data-task]`)?.focus({preventScroll:true});}
      else if(updated?.state==='verified')notify('Задание подтверждено. Можно забрать награду.');
    } catch {
      const failed=data.tasks.find(t=>t.id===id);if(failed)failed.state='server_error';render();notify('Не удалось узнать результат. Обнови статус.');
    } finally {busy.delete(id);}
  }
  async function refresh(){
    try{data=await api.list();render();notify('Статус задания обновлён.');}
    catch{notify('Не удалось загрузить задания. Попробуй ещё раз.');}
  }
  function preview(){
    if(!demo)return;
    openSheet('preview',`<div class="sheet-emblem">${icon('settings')}</div><h2 id="sheet-title">Настройки демо</h2><p>Пройди задание, проверь выполнение и забери тестовые баллы. После перезагрузки страницы всё вернётся к началу.</p><label class="settings-label" for="scenario">Результат следующей проверки</label><select id="scenario"><option value="verified">Подтверждено — награда доступна</option><option value="rejected">Отклонено — задание не выполнено</option><option value="expired">Срок задания истёк</option><option value="retry_available">Можно повторить проверку</option><option value="server_error">Ошибка сервера — обнови статус</option></select><button class="sheet-secondary" data-action="reset">Сбросить демо</button><p class="sheet-note">Задания и суммы — примеры, а не действующие акции CASE.</p>`);
    document.getElementById('scenario').value=api.getScenario();
  }
  const routeNames={main:'Главная',upgrade:'Апгрейд',wheel:'Колесо',craft:'Крафт',weekly:'За неделю',news:'Новости',invite:'Пригласить'};
  function navigate(route){
    document.dispatchEvent(new CustomEvent('case:navigate',{detail:{route}}));
    if(demo)openSheet('navigation',`<div class="sheet-emblem">${icon(route==='wheel'?'wheel':'grid')}</div><h2 id="sheet-title">${escape(routeNames[route]||'Раздел CASE')}</h2><p>В этом демо показаны задания. В полной версии CASE здесь откроется раздел «${escape(routeNames[route]||route)}».</p><button class="sheet-primary" data-action="close">К заданиям</button>`);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.filter){filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b===button));render();return;}
    if(button.dataset.route){navigate(button.dataset.route);return;}
    if(button.dataset.task){const t=data.tasks.find(t=>t.id===button.dataset.task);if(t?.state==='verified')actTask(t.id);else showTask(button.dataset.task);return;}
    if(button.id==='completed-toggle'){const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',expanded);document.getElementById('completed-list').hidden=!expanded;return;}
    switch(button.dataset.action){
      case 'close':closeSheet();break;
      case 'task-submit':if(activeTask)actTask(activeTask);break;
      case 'visit':if(demo){openSheet('visit',`<div class="sheet-emblem">${icon('send')}</div><h2 id="sheet-title">Знакомимся с CASE</h2><p>В приложении эта кнопка откроет канал или нужный раздел. В демо можно посмотреть весь путь задания прямо здесь.</p><button class="sheet-primary" data-action="return-task">Вернуться и проверить</button><p class="sheet-note">Никаких подписок и действий с реальным аккаунтом не было.</p>`);}else{document.dispatchEvent(new CustomEvent('case:open-task',{detail:{taskId:activeTask}}));}break;
      case 'return-task':if(activeTask)showTask(activeTask);break;
      case 'preview':preview();break;
      case 'reload':refresh();break;
      case 'reset':api.reset().then(result=>{data=result;filter='all';document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter==='all'));render();closeSheet();notify('Демо сброшено. Можно начать заново.');}).catch(()=>notify('Дождись завершения текущего действия.'));break;
      case 'help':openSheet('help',`<div class="sheet-emblem">${icon('bolt')}</div><h2 id="sheet-title">Выполняй задания.<br>Получай награды.</h2><ol class="steps"><li><strong>Выбери задание.</strong> Найди то, что тебе интересно.</li><li><strong>Выполни и проверь.</strong> Вернись, чтобы подтвердить выполнение.</li><li><strong>Забери баллы.</strong> После проверки награда будет доступна.</li></ol><button class="sheet-primary" data-action="close">Понятно, начнём</button><p class="sheet-note">${demo?'Это демо: задания и баллы приведены для примера.':'Подробности — в условиях каждого задания.'}</p>`);break;
      case 'balance':openSheet('balance',`<div class="sheet-emblem">${icon('star')}</div><h2 id="sheet-title">${num(data.balance)} ${demo?'демо-баллов':'баллов'}</h2><p>Все подтверждённые начисления в одном месте.</p>${(data.ledger||[]).map(item=>`<div class="sheet-reward"><span>${escape(item.title)}</span><strong>+${num(item.amount)}</strong></div>`).join('')}<p class="sheet-note">${demo?'Тестовый баланс. Его нельзя обменять на деньги или вывести.':''}</p>`);break;
      case 'profile':openSheet('profile',`<div class="sheet-emblem">${icon('user')}</div><h2 id="sheet-title">Привет, Игрок!</h2><p>Это демо-профиль. Аккаунт Telegram, личные данные и кошелёк не подключены.</p><button class="sheet-primary" data-action="close">К заданиям</button>`);break;
      case 'menu':openSheet('menu',`<div class="sheet-emblem">${icon('menu')}</div><h2 id="sheet-title">Меню CASE</h2><div class="sheet-menu"><button data-action="close" class="selected">${icon('check-circle')}Задания<span style="margin-left:auto">Ты здесь</span></button><button data-route="weekly">${icon('bolt')}За неделю</button><button data-action="balance">${icon('star')}Баллы</button><button data-route="news">${icon('send')}Новости</button><button data-route="invite">${icon('users')}Пригласить</button><button data-action="profile">${icon('user')}Профиль</button></div>`);break;
    }
  });
  document.addEventListener('change',event=>{if(event.target.id==='scenario'&&demo){api.setScenario(event.target.value);notify('Сценарий демо обновлён.');}});
  api.list().then(result=>{data=result;render();}).catch(()=>{const list=document.getElementById('tasks');list.setAttribute('aria-busy','false');list.innerHTML='<div class="empty-state"><h3>Не удалось загрузить задания</h3><p>Попробуй ещё раз чуть позже.</p><button class="sheet-secondary" data-action="reload">Повторить</button></div>';});
})();
