
const comps=[['AB','F','A/B Feminino'],['AB','M','A/B Masculino'],['CD','F','C/D Feminino'],['CD','M','C/D Masculino']];let state={players:[],events:{}},tab='inscricao',selected=0;function id(){return crypto.randomUUID()}function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function eventKey(c){return c[0]+c[1]}function relevant(p,c){return (c[0]==='AB'?'AB'.includes(p.cat):'CD'.includes(p.cat))&&p.sex===c[1]}function labelPair(p){return p?esc(p.names.join(' + ')):'A definir'}function render(){document.getElementById('tabs').innerHTML=[['inscricao','Cadastrar atleta'],['inscritos','Inscritos'],['sorteio','Sorteio e grupos'],['jogos','Jogos e resultados']].map(([k,n])=>`<button class="tab ${tab===k?'active':''}" onclick="tab='${k}';render()">${n}</button>`).join('');let el=document.getElementById('content');el.innerHTML=tab==='inscricao'?registration():tab==='inscritos'?list():tab==='sorteio'?drawPage():gamesPage()}
function registration(){return `<section class="card"><h2>Cadastro pela organização</h2><p class="muted">Após receber o comprovante por WhatsApp, cadastre o atleta e marque o pagamento confirmado. Somente atletas confirmados entram no sorteio.</p><form onsubmit="register(event)"><label>Nome completo</label><input name="name" required maxlength="90" placeholder="Nome do atleta"><div class="grid"><div><label>Categoria individual</label><select name="cat"><option>A</option><option>B</option><option>C</option><option>D</option></select></div><div><label>Modalidade</label><select name="sex"><option value="F">Feminino</option><option value="M">Masculino</option></select></div></div><label style="display:flex;gap:8px;align-items:center"><input style="width:auto" type="checkbox" name="paid"> Pagamento confirmado (R$ 40,00)</label><p><button class="primary">Cadastrar atleta</button></p></form></section><section class="card"><h3>Informações do evento</h3><p>📅 Sábado, 19/12/2026 · ⏰ A partir das 8h<br>📍 Arena Posto 011 · 💰 R$ 40,00 por pessoa, com café da manhã incluso</p><p class="notice">Uso exclusivo dos organizadores. As inscrições e os resultados são compartilhados entre os administradores.</p></section>`}
async function register(e){e.preventDefault();let f=new FormData(e.target),name=String(f.get('name')).trim(),cat=f.get('cat'),sex=f.get('sex');if(!name)return;state.players.push({id:id(),name,cat,sex,paid:f.get('paid')==='on'});if(await save()){e.target.reset();render()}}
function list(){return `<section class="card"><h2>Inscritos (${state.players.length})</h2><p class="pill">Pagamentos confirmados: ${state.players.filter(p=>p.paid).length}</p><p class="pill">Arrecadação confirmada: R$ ${state.players.filter(p=>p.paid).length*40},00</p>${comps.map(c=>{let a=state.players.filter(p=>relevant(p,c));return `<h3>${c[2]} (${a.length})</h3>${a.length?`<div class="scroll"><table><tr><th>Atleta</th><th>Categoria</th><th>Pagamento</th><th>Ações</th></tr>${a.map(p=>`<tr><td>${esc(p.name)}</td><td>${p.cat}</td><td><button class="${p.paid?'primary':''}" onclick="togglePaid('${p.id}')">${p.paid?'✓ Confirmado':'Pendente'}</button></td><td><button onclick="editPlayer('${p.id}')">Editar</button> <button class="danger" onclick="removePlayer('${p.id}')">Excluir</button></td></tr>`).join('')}</table></div>`:'<p class="muted">Nenhuma inscrição.</p>'}`}).join('')}</section>`}async function togglePaid(pid){let p=state.players.find(p=>p.id===pid);if(!p)return;if(Object.keys(state.events).length&&!confirm('Alterar pagamento pode afetar sorteios existentes. Continuar?'))return;p.paid=!p.paid;if(await save())render()}async function editPlayer(pid){let p=state.players.find(p=>p.id===pid);if(!p)return;let n=prompt('Nome do atleta:',p.name);if(n===null)return;n=n.trim();if(!n)return;let c=prompt('Categoria A, B, C ou D:',p.cat);if(c===null)return;c=c.trim().toUpperCase();if(!['A','B','C','D'].includes(c)){alert('Categoria inválida');return}let m=prompt('Modalidade: F (feminino) ou M (masculino):',p.sex);if(m===null)return;m=m.trim().toUpperCase();if(!['F','M'].includes(m)){alert('Modalidade inválida');return}if(Object.keys(state.events).length&&!confirm('Editar atleta pode invalidar sorteios existentes. Continuar?'))return;p.name=n;p.cat=c;p.sex=m;if(await save())render()}async function removePlayer(pid){if(!confirm('Excluir atleta? Isso pode invalidar sorteios existentes.'))return;state.players=state.players.filter(p=>p.id!==pid);if(await save())render()}
function picker(){return `<label>Disputa</label><select onchange="selected=+this.value;render()">${comps.map((c,i)=>`<option value="${i}" ${i===selected?'selected':''}>${c[2]}</option>`).join('')}</select>`}function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function drawPage(){let c=comps[selected],key=eventKey(c),e=state.events[key],a=state.players.filter(p=>p.paid&&p.sex===c[1]&&p.cat===c[0][0]),b=state.players.filter(p=>p.paid&&p.sex===c[1]&&p.cat===c[0][1]);return `<section class="card"><h2>Sorteio de duplas e grupos</h2><p class="notice">Somente pagamentos confirmados participam do sorteio.</p>${picker()}<p><span class="pill">${c[0][0]}: ${a.length} atletas</span><span class="pill">${c[0][1]}: ${b.length} atletas</span></p><p class="muted">Uma dupla reúne um atleta ${c[0][0]} e um atleta ${c[0][1]}. São necessários pelo menos 4 pares para dois grupos com semifinais. Se houver números diferentes de atletas nas duas categorias, os excedentes ficam na lista de espera.</p><button class="primary" onclick="draw()">${e?'Refazer sorteio':'Sortear duplas e grupos'}</button>${e?`<h3>Duplas sorteadas</h3>${e.pairs.map(p=>`<p class="pill">${labelPair(p)}</p>`).join('')}<h3>Grupos</h3>${e.groups.map((g,i)=>`<h3>Grupo ${i?'B':'A'}</h3>${g.map(pid=>`<p>${labelPair(e.pairs.find(p=>p.id===pid))}</p>`).join('')}`).join('')}${e.waiting.length?`<h3>Lista de espera</h3><p>${e.waiting.map(p=>esc(p.name)+' ('+p.cat+')').join(', ')}</p>`:''}`:''}</section>`}
async function draw(){let c=comps[selected],key=eventKey(c),aa=shuffle(state.players.filter(p=>p.paid&&p.sex===c[1]&&p.cat===c[0][0])),bb=shuffle(state.players.filter(p=>p.paid&&p.sex===c[1]&&p.cat===c[0][1])),n=Math.min(aa.length,bb.length);if(n<4){alert('São necessárias pelo menos 4 duplas para formar dois grupos e semifinais.');return}if(state.events[key]&&!confirm('Refazer o sorteio apaga os placares desta disputa. Continuar?'))return;let pairs=Array.from({length:n},(_,i)=>({id:id(),names:[aa[i].name,bb[i].name],ids:[aa[i].id,bb[i].id]}));pairs=shuffle(pairs);let groups=[[],[]];pairs.forEach((p,i)=>groups[i%2].push(p.id));let matches=[];groups.forEach((g,gi)=>{for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++)matches.push({id:id(),stage:'group',group:gi,a:g[i],b:g[j],sa:null,sb:null})});state.events[key]={pairs,groups,matches,waiting:[...aa.slice(n),...bb.slice(n)],semis:[],final:null};if(await save())render()}
function standings(e,gi){let stats=e.groups[gi].map(pid=>({pid,pts:0,w:0,d:0,l:0,for:0,against:0}));e.matches.filter(m=>m.group===gi&&m.sa!==null&&m.sb!==null).forEach(m=>{let a=stats.find(x=>x.pid===m.a),b=stats.find(x=>x.pid===m.b);a.for+=m.sa;a.against+=m.sb;b.for+=m.sb;b.against+=m.sa;if(m.sa>m.sb){a.w++;a.pts+=3;b.l++}else if(m.sa<m.sb){b.w++;b.pts+=3;a.l++}else{a.d++;b.d++;a.pts++;b.pts++}});return stats.sort((a,b)=>b.pts-a.pts||(b.for-b.against)-(a.for-a.against)||b.for-a.for||a.pid.localeCompare(b.pid))}
function matchHtml(m,e){let a=e.pairs.find(p=>p.id===m.a),b=e.pairs.find(p=>p.id===m.b);return `<div class="match"><div class="matchrow"><strong>${labelPair(a)}</strong><input class="score" id="a_${m.id}" type="number" min="0" value="${m.sa??''}" placeholder="0"><span>×</span><input class="score" id="b_${m.id}" type="number" min="0" value="${m.sb??''}" placeholder="0"><strong>${labelPair(b)}</strong><button onclick="score('${m.id}')">Salvar</button></div></div>`}
async function score(mid){let c=comps[selected],e=state.events[eventKey(c)],m=[...e.matches,...e.semis,...(e.final?[e.final]:[])].find(x=>x.id===mid),a=document.getElementById('a_'+mid).value,b=document.getElementById('b_'+mid).value;if(a===''||b===''||!Number.isInteger(+a)||!Number.isInteger(+b)||+a<0||+b<0){alert('Informe dois placares inteiros não negativos.');return}if(m.stage!=='group'&&+a===+b){alert('Semifinais e final precisam ter um vencedor.');return}m.sa=+a;m.sb=+b;if(m.stage==='group'){e.semis=[];e.final=null}else if(m.stage==='semi'){e.final=null}if(await save())render()}
function completed(ms){return ms.every(m=>m.sa!==null&&m.sb!==null)}function winner(m){return m.sa>m.sb?m.a:m.b}
function gamesPage(){let c=comps[selected],e=state.events[eventKey(c)];if(!e)return `<section class="card"><h2>Jogos e resultados</h2>${picker()}<p class="notice">Faça primeiro o sorteio desta disputa.</p></section>`;return `<section class="card"><h2>Jogos e resultados</h2>${picker()}${e.groups.map((g,i)=>`<h3>Grupo ${i?'B':'A'} · jogos</h3>${e.matches.filter(m=>m.group===i).map(m=>matchHtml(m,e)).join('')}<h3>Classificação do Grupo ${i?'B':'A'}</h3><div class="scroll"><table><tr><th>Pos.</th><th>Dupla</th><th>Pts</th><th>V</th><th>E</th><th>D</th><th>Saldo</th></tr>${standings(e,i).map((s,j)=>`<tr><td>${j+1}º</td><td>${labelPair(e.pairs.find(p=>p.id===s.pid))}</td><td>${s.pts}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.for-s.against}</td></tr>`).join('')}</table></div>`).join('')}<p class="muted">Critérios de desempate: pontos, saldo de pontos, pontos marcados. Persistindo empate, ordem técnica interna; a organização deve revisar antes das semifinais.</p>${!e.semis.length?`<button class="primary" onclick="makeSemis()" ${completed(e.matches)?'':'disabled'}>Gerar semifinais</button>`:`<h2>Semifinais</h2>${e.semis.map(m=>matchHtml(m,e)).join('')}${!e.final?`<button class="primary" onclick="makeFinal()" ${completed(e.semis)?'':'disabled'}>Gerar final</button>`:`<h2>Final</h2>${matchHtml(e.final,e)}${completed([e.final])?`<h2>🏆 Campeões: ${labelPair(e.pairs.find(p=>p.id===winner(e.final)))}</h2>`:''}`}`}</section>`}
async function makeSemis(){let e=state.events[eventKey(comps[selected])];if(!completed(e.matches))return;let a=standings(e,0),b=standings(e,1);e.semis=[{id:id(),stage:'semi',a:a[0].pid,b:b[1].pid,sa:null,sb:null},{id:id(),stage:'semi',a:b[0].pid,b:a[1].pid,sa:null,sb:null}];if(await save())render()}async function makeFinal(){let e=state.events[eventKey(comps[selected])];if(!completed(e.semis))return;e.final={id:id(),stage:'final',a:winner(e.semis[0]),b:winner(e.semis[1]),sa:null,sb:null};if(await save())render()}

const login = document.querySelector('#login');
const loginForm = document.querySelector('#login-form');
const panel = document.querySelector('#panel');
const workspace = document.querySelector('#workspace');
const notice = document.querySelector('#notice');
const config = window.confraConfig;
const configured = config.url && config.publishableKey && window.supabase;
const client = configured ? window.supabase.createClient(config.url, config.publishableKey) : null;
let revision = null;
let busy = false;
let sessionEpoch = 0;

function message(text) {
  notice.textContent = text;
}

function clearPanel() {
  sessionEpoch += 1;
  revision = null;
  state = {players: [], events: {}};
  tab = 'inscricao';
  selected = 0;
  panel.hidden = true;
  document.querySelector('#content').replaceChildren();
  login.hidden = false;
}

async function sync(force = false, epoch = sessionEpoch) {
  if (!force && (busy || panel.hidden || document.hidden)) return;
  const startingRevision = revision;
  const {data, error} = await client.from('event_state')
    .select('payload,revision').eq('id', 1).maybeSingle();
  if (epoch !== sessionEpoch || (!force && (busy || revision !== startingRevision))) return;
  if (error) {
    message('Falha ao sincronizar. Verifique a conexão e tente novamente.');
    return;
  }
  if (!data) {
    clearPanel();
    await client.auth.signOut({scope: 'local'});
    message('Este login precisa de autorização da organização.');
    return;
  }
  if (!force && (data.revision === revision || workspace.contains(document.activeElement) &&
      document.activeElement.matches('input, select, textarea'))) return;
  state = data.payload;
  revision = data.revision;
  login.hidden = true;
  panel.hidden = false;
  render();
}

async function save() {
  const epoch = sessionEpoch;
  busy = true;
  workspace.disabled = true;
  const {data, error} = await client.rpc('save_event_state', {
    expected_revision: revision,
    new_payload: state
  });
  try {
    if (epoch !== sessionEpoch) return false;
    if (error || data === null) {
      message(error
        ? 'Não foi possível confirmar a gravação. Confira a lista sincronizada antes de tentar novamente.'
        : 'Outro administrador atualizou os dados. A lista foi recarregada. Revise e tente novamente.');
      await sync(true, epoch);
      return false;
    }
    revision = data;
    message('Alteração salva.');
    return true;
  } finally {
    busy = false;
    workspace.disabled = false;
  }
}

function loginIdentifier(value) {
  const identifier = value.trim();
  if (identifier.includes('@')) return {email: identifier};
  if (!/^\+?[0-9\s().-]+$/.test(identifier)) return null;

  const digits = identifier.replace(/\D/g, '');
  if (identifier.startsWith('+')) {
    return /^[1-9]\d{7,14}$/.test(digits) ? {phone: '+' + digits} : null;
  }
  if (/^\d{2}9\d{8}$/.test(digits)) return {phone: '+55' + digits};
  if (/^55\d{2}9\d{8}$/.test(digits)) return {phone: '+' + digits};
  return null;
}

if (client) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const identifier = loginIdentifier(document.querySelector('#login-identifier').value);
    if (!identifier) {
      message('Informe seu e-mail ou um número de celular com DDD.');
      return;
    }
    const button = loginForm.querySelector('button');
    button.disabled = true;
    message('Entrando…');
    try {
      const {error} = await client.auth.signInWithPassword({
        ...identifier,
        password: document.querySelector('#password').value
      });
      loginForm.reset();
      if (error) {
        message('Não foi possível entrar. Confira o e-mail ou celular e a senha e tente novamente.');
        return;
      }
      message('');
      await sync(true);
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector('#logout').addEventListener('click', async () => {
    clearPanel();
    const {error} = await client.auth.signOut({scope: 'local'});
    message(error ? 'Não foi possível encerrar a sessão. Tente novamente.' : '');
  });

  client.auth.getSession().then(({data}) => {
    if (data.session && sessionEpoch === 0) void sync(true);
  });

  window.setInterval(() => void sync(), 5000);
  document.addEventListener('visibilitychange', () => void sync());
} else {
  loginForm.querySelector('button').disabled = true;
  message('A conexão com o banco de dados ainda precisa ser configurada.');
}
