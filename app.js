/* ===== js/base.js ===== */
/* Base: conexão, estado, utilitários de data/texto, ícones e cálculo dos feriados */
const db = supabase.createClient(CFG.url, CFG.key);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MOTIVOS = ['Falta sem justificativa','Atestado médico','Problema pessoal','Atraso','Folga compensada','Outro'];
const p2 = n => String(n).padStart(2,'0');
const iso = d => d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const parse = s => { const [a,b,c] = s.split('-'); return new Date(+a,b-1,+c); };
const fmt = s => parse(s).toLocaleDateString('pt-BR');
const monday = d => { const x = new Date(d); x.setDate(x.getDate() - (x.getDay()+6)%7); x.setHours(0,0,0,0); return x; };
const ck = async q => { const r = await q; if (r.error) throw r.error; return r; };
const hhmm = t => (t||'').slice(0,5);
let S = { tab:'inicio', dias:[], saldo:[], notas:{}, v4Erro:false, hist:[], histOk:false, sf:'', dsOk:false, fmodo:{}, fmErro:false, fm:iso(new Date()).slice(0,7), sm:iso(new Date()).slice(0,7), emps:[], esc:[], faltas:[], extras:[], day:iso(new Date()), month:iso(new Date()).slice(0,7), year:new Date().getFullYear(), verInativos:false };
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1;return new Date(y,mes-1,dia);}
function feriadosAno(y){
  const m = {}, add = (d,n) => m[iso(d)] = n, off = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
  [[1,1,'Confraternização Universal'],[4,21,'Tiradentes'],[5,1,'Dia do Trabalho'],[9,7,'Independência'],[10,12,'Nossa Sra. Aparecida'],[11,2,'Finados'],[11,15,'Proclamação da República'],[11,20,'Consciência Negra'],[12,25,'Natal']].forEach(([mm,dd,n]) => add(new Date(y,mm-1,dd),n));
  const p = pascoa(y);
  add(off(p,-48),'Carnaval (segunda)'); add(off(p,-47),'Carnaval (terça)'); add(off(p,-2),'Sexta-feira Santa'); add(p,'Páscoa'); add(off(p,60),'Corpus Christi');
  return m;
}
function feriados(...anos){
  const m = {}; anos.forEach(y => Object.assign(m, feriadosAno(y)));
  S.extras.forEach(e => m[e.data] = e.nome + ' (extra)');
  return m;
}
const IC={home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4v2h6V4M9 11h6M9 15h4"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18 14.4c2.2.7 3.5 2.6 3.5 5.6"/>',more:'<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',uplus:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6 1.4 0 2.6.3 3.6.9M18 8v6M15 11h6"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',out:'<path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M16 8l4 4-4 4M20 12H9"/>',chev:'<path d="M9 6l6 6-6 6"/>',download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',history:'<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',alert:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',palette:'<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="7.8" r="1" fill="currentColor"/><circle cx="15.7" cy="10.5" r="1" fill="currentColor"/><path d="M12 21a2.4 2.4 0 010-4.8h1.6a2 2 0 000-4"/>'};
const ic=n=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const horas=(en,sa)=>{const [a,b]=en.split(':').map(Number),[c,d]=sa.split(':').map(Number);return Math.max(0,(c*60+d)-(a*60+b))/60};
const fh=h=>{const m=Math.round(h*60);return Math.floor(m/60)+'h'+(m%60?p2(m%60):'')};
const sabadosDoMes=ym=>{const [y,m]=ym.split('-').map(Number),r=[],d=new Date(y,m-1,1);while(d.getMonth()===m-1){if(d.getDay()===6)r.push(iso(d));d.setDate(d.getDate()+1)}return r};
const DIAS_L=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const dm=k=>fmt(k).slice(0,5);
const slug=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'')||'relatorio';
const diasEntre=(de,ate)=>{const r=[],d=parse(de),f=parse(ate);while(d<=f&&r.length<400){r.push(iso(d));d.setDate(d.getDate()+1)}return r};
const mesRange=ym=>{const [y,m]=ym.split('-').map(Number);return [ym+'-01',ym+'-'+p2(new Date(y,m,0).getDate())]};
function rotulo(de,ate){const [a,b]=mesRange(de.slice(0,7));return de===a&&ate===b?de.slice(5,7)+'/'+de.slice(0,4):fmt(de)+' a '+fmt(ate)}
const mesNome=ym=>{const [y,m]=ym.split('-').map(Number),t=new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});return t.charAt(0).toUpperCase()+t.slice(1)};
// Minutos desde 00:00 ("08:30" -> 510) e soma de dias em uma data "aaaa-mm-dd"
const minutos=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const addDias=(k,n)=>{const d=parse(k);d.setDate(d.getDate()+n);return iso(d)};
// Números e dias no formato brasileiro: 1,5 / "1 dia" / "4 dias"
const fn=n=>String(Math.round(n*100)/100).replace('.',',');
const fd=n=>fn(n)+(Math.abs(Math.round(n*100)/100)===1?' dia':' dias');

/* ===== js/regras.js ===== */
/* Regras de negócio: quem trabalha em cada dia (escala fixa, por dia, feriados) e dados do relatório */
function situ(e,k){
  const f=S.faltas.find(x=>x.funcionario_id===e.id&&x.data===k),cb=S.faltas.filter(x=>x.cobertura_id===e.id&&x.data===k),t=turnoDia(e,k),md=modoFer(k);
  const sc=S.esc.find(x=>x.funcionario_id===e.id&&x.dia_semana===parse(k).getDay());
  let sub,tag='',work=false;
  if(t){sub=`${t.en} às ${t.sa}`;work=true}
  else if(e.tipo==='flexivel')sub='Não escalada neste dia';
  else if(md==='fechado'){sub='Fechado (feriado)';tag='<span class="tag gr">Fechado</span>'}
  else if(md==='especial')sub='Fora da escala do feriado';
  else if(!sc)sub='Sem escala';
  else{sub='Folga';tag='<span class="tag gr">Folga</span>'}
  if(f){tag=`<span class="tag bad">${f.atestado?'Atestado':'Faltou'}</span>`;sub=f.cobertura_id?`Coberto por ${esc(nome(f.cobertura_id))}`:'Sem cobertura';work=false}
  else if(cb.length)tag=`<span class="tag ok">Cobre ${esc(nome(cb[0].funcionario_id))}</span>`;
  if(work&&!tag)tag='<span class="tag ok">Escala</span>';
  return {sub,tag,work};
}
const rel=(e,k)=>S.faltas.some(f=>f.funcionario_id===e.id&&f.data===k)||!!turnoDia(e,k);
const _fc={};
function ferMapa(y){const sig=y+'|'+S.extras.map(e=>e.data+e.nome).join(',');if(!_fc[y]||_fc[y].sig!==sig)_fc[y]={sig,m:feriados(y)};return _fc[y].m}
const modoFer=k=>ferMapa(+k.slice(0,4))[k]?(S.fmodo[k]||'especial'):null;
function turnoDia(e,k){
  const md=modoFer(k);
  if(md==='fechado'&&e.tipo!=='flexivel')return null;
  const ov=S.dias.find(x=>x.funcionario_id===e.id&&x.data===k);
  if(ov)return {en:hhmm(ov.entrada),sa:hhmm(ov.saida)};
  if(e.tipo==='flexivel'||md==='especial')return null;
  const sc=S.esc.find(x=>x.funcionario_id===e.id&&x.dia_semana===parse(k).getDay());
  return sc&&!sc.folga&&sc.entrada&&sc.saida?{en:hhmm(sc.entrada),sa:hhmm(sc.saida)}:null;
}
const horasPrev=(e,k)=>{const t=turnoDia(e,k);return t?horas(t.en,t.sa):0};
function setSemana(n){const m=monday(new Date());m.setDate(m.getDate()+7*n);const f=new Date(m);f.setDate(f.getDate()+6);S.rp.de=iso(m);S.rp.ate=iso(f)}
function setMes(n){const d=new Date(),a=new Date(d.getFullYear(),d.getMonth()+n,1),[de,ate]=mesRange(iso(a).slice(0,7));S.rp.de=de;S.rp.ate=ate}
function relDados(de,ate,empId){
  const days=diasEntre(de,ate),H=feriados(...new Set(days.map(k=>+k.slice(0,4))));
  const fm0=S.faltas.filter(f=>f.data>=de&&f.data<=ate).sort((a,b)=>a.data.localeCompare(b.data));
  let emps=S.emps.filter(e=>e.ativo||fm0.some(f=>f.funcionario_id===e.id||f.cobertura_id===e.id)||S.dias.some(x=>x.funcionario_id===e.id&&x.data>=de&&x.data<=ate));
  if(empId)emps=emps.filter(e=>e.id===empId);
  const fm=empId?fm0.filter(f=>f.funcionario_id===empId||f.cobertura_id===empId):fm0,pr=empId?fm.filter(f=>f.funcionario_id===empId):fm;
  const sab=days.filter(k=>parse(k).getDay()===6).map(k=>({k,itens:emps.map(e=>{const t=turnoDia(e,k);return t&&{id:e.id,nome:e.nome,en:t.en,sa:t.sa,h:horas(t.en,t.sa),falta:fm0.some(f=>f.funcionario_id===e.id&&f.data===k)}}).filter(Boolean).sort((a,b)=>a.en.localeCompare(b.en))}));
  const func=emps.map(e=>{
    const fe=fm0.filter(f=>f.funcionario_id===e.id),ce=fm0.filter(f=>f.cobertura_id===e.id),dd=days.map(k=>({k,t:turnoDia(e,k)})).filter(x=>x.t);
    const prev=dd.reduce((s,x)=>s+horas(x.t.en,x.t.sa),0),falt=fe.reduce((s,f)=>s+horasPrev(e,f.data),0);
    const cob=ce.map(f=>{const q=S.emps.find(x=>x.id===f.funcionario_id);return {k:f.data,quem:q?q.nome:'—',h:q?horasPrev(q,f.data):0}}),cobH=cob.reduce((s,c)=>s+c.h,0);
    return {e,fe,cob,cobH,prev,falt,trab:prev-falt+cobH,dias:dd,sabs:dd.filter(x=>parse(x.k).getDay()===6),
      pendTotal:S.faltas.filter(f=>f.funcionario_id===e.id&&!f.horas_quitadas).reduce((s,f)=>s+ +f.horas_devidas,0),devMes:fe.reduce((s,f)=>s+ +f.horas_devidas,0),
      saldo:saldoDe(e.id),movs:S.saldo.filter(x=>x.funcionario_id===e.id&&x.data>=de&&x.data<=ate).sort((a,b)=>a.data.localeCompare(b.data))};
  });
  const mesInteiro=de===de.slice(0,7)+'-01'&&ate===mesRange(de.slice(0,7))[1],chave=(!empId&&mesInteiro)?'rel:'+de.slice(0,7):`relp:${empId||'todos'}:${de}:${ate}`;
  return {de,ate,empId,chave,nota:nota(chave),fm,fer:days.filter(k=>H[k]).map(k=>({k,n:H[k]})),ferEsc:days.filter(k=>H[k]).map(k=>{const fe=S.fmodo[k]==='fechado',itens=fe?[]:emps.map(e=>{const t=turnoDia(e,k);return t&&{id:e.id,nome:e.nome,en:t.en,sa:t.sa,h:horas(t.en,t.sa),falta:fm0.some(f=>f.funcionario_id===e.id&&f.data===k)}}).filter(Boolean).sort((a,b)=>a.en.localeCompare(b.en));return {k,n:H[k],modo:fe?'fechado':itens.length?'especial':'vazio',itens}}),sab,func,
    tot:{faltas:pr.filter(f=>!f.atestado).length,atest:pr.filter(f=>f.atestado).length,cob:empId?fm.filter(f=>f.cobertura_id===empId).length:fm.filter(f=>f.cobertura_id).length,
      pend:S.faltas.filter(f=>!f.horas_quitadas&&(!empId||f.funcionario_id===empId)).reduce((s,f)=>s+ +f.horas_devidas,0)}};
}
function diaria(x){
  const R=[];
  x.dias.forEach(d=>{const f=x.fe.find(f=>f.data===d.k);R.push({k:d.k,txt:f?`Faltou · ${f.motivo}${f.atestado?' (atestado)':''}`:`${d.t.en}-${d.t.sa} · ${fh(horas(d.t.en,d.t.sa))}${feriados(+d.k.slice(0,4))[d.k]?' · Feriado':''}`,h:f?0:horas(d.t.en,d.t.sa)})});
  x.fe.filter(f=>!x.dias.some(d=>d.k===f.data)).forEach(f=>R.push({k:f.data,txt:`Falta registrada · ${f.motivo}`,h:0}));
  x.cob.forEach(c=>R.push({k:c.k,txt:`Cobriu ${c.quem} · +${fh(c.h)}`,h:c.h}));
  return R.sort((a,b)=>a.k.localeCompare(b.k));
}
const diasTrab=x=>x.dias.filter(d=>!x.fe.some(f=>f.data===d.k)).length;

// ---------- Conflitos de escala: o app avisa, mas quem decide é o gerente ----------
const DESCANSO_IDEAL=11*60;
function conflitos(e,k,en,sa){
  const out=[];
  const f=S.faltas.find(x=>x.funcionario_id===e.id&&x.data===k);
  if(f)out.push(`${e.nome} tem ${f.atestado?'atestado':'falta'} registrada em ${fmt(k)}.`);
  const ant=turnoDia(e,addDias(k,-1)),dep=turnoDia(e,addDias(k,1));
  if(ant){const g=1440-minutos(ant.sa)+minutos(en);if(g<DESCANSO_IDEAL)out.push(`${e.nome} teria só ${fh(g/60)} de descanso desde o turno de ontem (terminou às ${ant.sa}). O ideal é ${DESCANSO_IDEAL/60}h.`)}
  if(dep){const g=1440-minutos(sa)+minutos(dep.en);if(g<DESCANSO_IDEAL)out.push(`${e.nome} teria só ${fh(g/60)} de descanso até o turno de amanhã (começa às ${dep.en}). O ideal é ${DESCANSO_IDEAL/60}h.`)}
  let seq=1;for(let i=1;i<=7&&turnoDia(e,addDias(k,-i));i++)seq++;for(let i=1;i<=7&&turnoDia(e,addDias(k,i));i++)seq++;
  if(seq>=7)out.push(`${e.nome} ficaria ${seq} dias seguidos trabalhando, sem folga.`);
  return out;
}

// ---------- Saldo de folgas ----------
const saldoDe=id=>S.saldo.filter(x=>x.funcionario_id===id).reduce((s,x)=>s+(x.tipo==='credito'?1:-1)*(+x.dias),0);

// Dias de uma falta de vários dias: o primeiro e os seguintes em que a pessoa trabalharia
function diasDaFalta(e,de,ate){
  const r=[de];
  if(ate&&ate>de)diasEntre(addDias(de,1),ate).forEach(k=>{if(turnoDia(e,k))r.push(k)});
  return r;
}

// ---------- Pendências mostradas na tela Início ----------
function pendencias(){
  const hoje=iso(new Date()),L=[],at=S.emps.filter(e=>e.ativo);
  const sabs=[];for(let i=0;i<35;i++){const k=addDias(hoje,i);if(parse(k).getDay()===6&&!at.some(e=>turnoDia(e,k)))sabs.push(k)}
  if(sabs.length)L.push({t:'Sábados sem escala: '+sabs.map(dm).join(', '),ir:()=>{S.sm=sabs[0].slice(0,7);S.tab='sabados'}});
  const fer=[];for(let i=0;i<=45;i++){const k=addDias(hoje,i),n=ferMapa(+k.slice(0,4))[k];if(n&&S.fmodo[k]!=='fechado'&&!at.some(e=>turnoDia(e,k)))fer.push([k,n.replace(' (extra)','')])}
  if(fer.length)L.push({t:'Feriados a definir: '+fer.map(([k,n])=>dm(k)+' '+n).join(', '),ir:()=>{S.fm=fer[0][0].slice(0,7);S.tab='ferescala'}});
  const dow=new Date().getDay();
  if(dow===0||dow>=3){
    const mon=monday(new Date()),sem=[...Array(7)].map((_,i)=>{const d=new Date(mon);d.setDate(d.getDate()+i);return iso(d)});
    at.filter(e=>e.tipo==='flexivel').forEach(e=>{const n=sem.filter(k=>S.dias.some(x=>x.funcionario_id===e.id&&x.data===k)).length;if(n<e.dias_semana)L.push({t:`${e.nome}: ${n} de ${e.dias_semana} dias nesta semana`,ir:()=>{S.pe=e.id;S.tab='ponto'}})});
  }
  S.faltas.filter(f=>f.data>=hoje&&!f.cobertura_id).forEach(f=>L.push({t:`Falta sem cobertura: ${nome(f.funcionario_id)} em ${dm(f.data)}`,ir:()=>{S.month=f.data.slice(0,7);S.tab='faltas'}}));
  const pend=at.map(e=>[e,S.faltas.filter(f=>f.funcionario_id===e.id&&!f.horas_quitadas).reduce((s,f)=>s+ +f.horas_devidas,0)]).filter(x=>x[1]>0);
  if(pend.length)L.push({t:'Horas devidas pendentes: '+pend.map(([e,h])=>e.nome+' '+fh(h)).join(', '),ir:()=>{S.tab='resumo'}});
  return L;
}

/* ===== js/dados.js ===== */
/* Carregamento dos dados do Supabase e histórico de exclusões */
S.rp={emp:'',de:'',ate:''};setSemana(0);

// Lê uma tabela inteira, de 1000 em 1000 (o Supabase devolve no máximo 1000 linhas por pedido)
async function tudo(tabela,ordem){
  let todos=[],a=0;
  for(;;){
    const r=await db.from(tabela).select('*').order(ordem).range(a,a+999);
    if(r.error)return r;
    todos=todos.concat(r.data);
    if(r.data.length<1000)return {data:todos,error:null};
    a+=1000;
  }
}
async function load(){
  try{
    const rs=await Promise.all([tudo('funcionarios','nome'),tudo('escalas','id'),tudo('faltas','data'),tudo('feriados_extras','data'),tudo('escalas_dia','data')]);
    rs.forEach(r=>{if(r.error)throw r.error});
    S.emps=rs[0].data;S.esc=rs[1].data;S.faltas=rs[2].data.reverse();S.extras=rs[3].data;S.dias=rs[4].data;
    // tabelas das migrações 003 e 004: se faltarem, as telas que as usam avisam
    const fr=await tudo('feriado_modo','data');
    S.fmErro=!!fr.error;S.fmodo=fr.error?{}:Object.fromEntries(fr.data.map(r=>[r.data,r.modo]));
    const sf=await tudo('saldo_folgas','data'),an=await tudo('anotacoes','chave');
    S.v4Erro=!!(sf.error||an.error);S.saldo=sf.error?[]:sf.data;S.notas=an.error?{}:Object.fromEntries(an.data.map(r=>[r.chave,r.texto]));
    S.histOk=false;
    if(!S.dsOk){S.dsOk=true;await carregaDS()}
  }catch(e){alert('Erro ao carregar: '+e.message)}
  render();
}
const nome=id=>(S.emps.find(e=>e.id===id)||{}).nome||'—';

// Registra no histórico o que foi apagado (com uma cópia, para poder restaurar)
async function logar(acao,entidade,resumo,detalhe){
  try{await db.from('historico').insert({usuario:(S.user&&S.user.email)||null,acao,entidade,resumo,detalhe:detalhe||null})}catch(e){}
}
// Apaga escalas de dia guardando cópia no histórico
async function removeDias(rows,rotulo){
  if(!rows.length)return;
  await logar('apagou','escala_dia',`${rotulo}: ${rows.slice(0,5).map(r=>nome(r.funcionario_id)+' '+dm(r.data)).join(', ')}${rows.length>5?'…':''}`,{dias:rows});
  await ck(db.from('escalas_dia').delete().in('id',rows.map(r=>r.id)));
}

/* ===== js/ui-comum.js ===== */
/* Interface comum: janelas, navegação, cabeçalho e linhas de funcionário */
function modal(title, body, onSave, label){
  const d = document.createElement('dialog');
  d.innerHTML = `<form method="dialog"><h3>${title}</h3>${body}<div class="row end"><button class="ghost" value="x">Cancelar</button><button type="button" id="sv">${label||'Salvar'}</button></div></form>`;
  document.body.append(d); d.showModal();
  d.addEventListener('close', () => d.remove());
  d.querySelector('#sv').onclick = async () => { try{ await onSave(d); d.close(); await load(); }catch(e){ if(!e.silencioso)alert(e.message); } };
}
const opts = (list, sel) => list.map(([v,t]) => `<option value="${esc(v)}" ${v===sel?'selected':''}>${esc(t)}</option>`).join('');
const NAV=[['inicio','Início','home'],['escala','Escala','cal'],['faltas','Faltas','clip'],['func','Equipe','users'],['mais','Mais','more']];
const SUB={feriados:'Feriados',resumo:'Relatório',conta:'Minha conta',sabados:'Escala dos sábados',ponto:'Folha de ponto',relper:'Relatório por período',design:'Design',ferescala:'Escala dos feriados',saldo:'Saldo de folgas',saldoemp:'Extrato de folgas',historico:'Histórico',backup:'Backup'};
const BACK={sabados:['escala','Escala'],ponto:['func','Equipe'],relper:['resumo','Relatório'],saldoemp:['saldo','Saldo de folgas']};
const bind = {};
function hdr(t,sub,u){
  const dt=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  const lk=()=>{const p=(DS.nome||'').trim().split(/\s+/),l1=p.shift()||'',l2=p.join(' ');return `<div class="mf"><b>${esc(l1)}</b>${l2?`<b>${esc(l2)}</b>`:''}${DS.sub?`<i>${esc(DS.sub)}</i>`:''}</div>`};
  const logo=DS.logo?`<img class="logo" src="${DS.logo}" alt="logo">`:(DS.nome?lk():'');
  if(t==='inicio')return `<div class="hd big"><div class="hd-in"><div><small>${dt}</small><h1>Olá, <span class="acc">${esc(u.nome||'gerente')}</span></h1><p>${esc(DS.frase)}</p></div>${logo}</div></div>`;
  const tit={escala:'Escala',faltas:'Faltas',func:'Equipe',mais:'Mais'};
  return `<div class="hd"><div class="hd-in"><div>${sub?`<button class="bk" id="bk">‹ ${(BACK[t]||['mais','Mais'])[1]}</button><br>`:''}<small>${dt}</small><h1>${sub||tit[t]}</h1></div></div></div>`;
}
function render(){
  const t=S.tab, sub=SUB[t], nav=BACK[t]&&NAV.some(n=>n[0]===BACK[t][0])?BACK[t][0]:sub?'mais':t, u=(S.user&&S.user.user_metadata)||{};
  const V={inicio:vInicio,escala:vEscala,faltas:vFaltas,func:vFunc,mais:vMais,feriados:vFeriados,resumo:vResumo,conta:vConta,sabados:vSabados,ponto:vPonto,relper:vRelPer,design:vDesign,ferescala:vFerEscala,saldo:vSaldo,saldoemp:vSaldoEmp,historico:vHistorico,backup:vBackup};
  $('#app').innerHTML=`${hdr(t,sub,u)}
  <main>${V[t]()}</main>${(t==='faltas'||t==='func')?'<button class="fab" id="fab">+</button>':''}
  <nav class="bn">${NAV.map(([k,n,i])=>`<button class="${nav===k?'on':''}" data-t="${k}"><i>${ic(i)}</i>${n}</button>`).join('')}</nav>`;
  document.querySelectorAll('.bn button').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;render();scrollTo(0,0)});
  if($('#bk'))$('#bk').onclick=()=>{S.tab=(BACK[t]||['mais'])[0];render()};
  if($('#fab'))$('#fab').onclick=()=>t==='faltas'?faltaForm(null):empForm(null);
  bind[t]&&bind[t]();if($('#nosat'))$('#nosat').onclick=semSabadoFixo;
}
function sheet(title,btns){
  const d=document.createElement('dialog');
  d.innerHTML=`<h3 style="margin-top:0">${title}</h3>${btns.map((b,i)=>`<button class="ghost ${b[2]||''}" style="width:100%;margin:5px 0" data-i="${i}">${b[0]}</button>`).join('')}<button class="ghost" style="width:100%;margin-top:5px" data-i="x">Fechar</button>`;
  document.body.append(d);d.showModal();d.onclose=()=>d.remove();
  d.querySelectorAll('button').forEach(b=>b.onclick=async()=>{d.close();if(b.dataset.i!=='x')await btns[b.dataset.i][1]()});
}
const banFer=(k,nm,btn)=>{const tx=S.fmodo[k]==='fechado'?' · Fechado':'';return `<div class="ban">Feriado · ${esc(nm)}${tx}${btn?' <button class="ghost sm" id="fer" style="margin-left:8px">Montar escala</button>':''}</div>`};
const item=(e,k)=>{const s=situ(e,k);return `<div class="it" data-e="${e.id}"><div class="av">${esc((e.nome[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(e.nome)}</b><br><small>${s.sub}</small></div>${s.tag}<span class="chv">${ic('chev')}</span></div>`};
const kv=(l,v)=>`<div class="kv"><span>${l}</span><b>${v}</b></div>`;

// Mostra os avisos de conflito de uma escala; o gerente pode manter mesmo assim
function confirmaConflitos(itens){
  const m=[];
  itens.forEach(x=>{if(x.e)conflitos(x.e,x.k,x.en,x.sa).forEach(t=>m.push('• '+t))});
  if(m.length&&!confirm('ATENÇÃO — veja antes de salvar:\n\n'+m.join('\n')+'\n\nManter a escala mesmo assim?'))
    throw Object.assign(Error('cancelado'),{silencioso:true});
}

/* ===== js/notas.js ===== */
/* Anotações livres: o gerente escreve o que quiser nos relatórios, sábados e feriados */
const nota=chave=>S.notas[chave]||'';
const notaHtml=chave=>nota(chave)?`<div class="note">${esc(nota(chave))}</div>`:'';
function editaNota(chave,titulo){
  if(S.v4Erro)return alert('Para usar anotações, rode a migração 004 no Supabase (SQL Editor). O passo a passo está no README.');
  modal(titulo,`<label>Anotação (escreva o que quiser)<textarea name="tx" rows="7" placeholder="Ex.: Well usou 1 dia do saldo; lembrar de...">${esc(nota(chave))}</textarea></label>`,async d=>{
    const t=d.querySelector('[name="tx"]').value.trim();
    if(t)await ck(db.from('anotacoes').upsert({chave,texto:t,atualizado_em:new Date().toISOString()}));
    else await ck(db.from('anotacoes').delete().eq('chave',chave));
  });
}

/* ===== js/tela-inicio.js ===== */
/* Telas: Início e Mais */
function vInicio(){
  const k=iso(new Date()),y=new Date().getFullYear(),H=feriados(y,y+1),at=S.emps.filter(e=>e.ativo);
  const trab=at.filter(e=>situ(e,k).work).length,fal=S.faltas.filter(f=>f.data===k).length;
  const pend=S.faltas.filter(f=>!f.horas_quitadas).reduce((s,f)=>s+ +f.horas_devidas,0);
  const prox=Object.entries(H).filter(([d])=>d>k).sort()[0],pd=pendencias();
  const qk=(q,i,t,d)=>`<button class="qk" data-q="${q}"><span class="qi">${ic(i)}</span><b>${t}</b><small>${d}</small><span class="chv">${ic('chev')}</span></button>`;
  return `<div class="qa">${qk('falta','user','Registrar falta','Marque a ausência de um colaborador')}${qk('emp','uplus','Novo funcionário','Cadastre um novo colaborador')}${qk('escala','cal','Ver escala','Confira a escala da equipe')}${qk('resumo','chart','Relatório','Acompanhe os resultados do mês')}</div>
  <div class="stats"><div class="stat u1">${ic('cal')}<b>${trab}</b>trabalham hoje</div><div class="stat u2">${ic('alert')}<b>${fal}</b>faltas hoje</div><div class="stat u3">${ic('clock')}<b>${fh(pend)}</b>horas devidas</div></div>
  ${pd.length?`<div class="card"><b>Pendências</b>${pd.slice(0,6).map((p,i)=>`<div class="it" data-pd="${i}"><span class="hi" style="color:var(--warn)">${ic('alert')}</span><div class="grow">${esc(p.t)}</div><span class="chv">${ic('chev')}</span></div>`).join('')}</div>`:''}
  <div class="card"><div class="row" style="margin:0 0 4px"><span class="hi">${ic('cal')}</span><b class="grow" style="font-size:18px">Hoje</b><a class="lk" id="vt">Ver toda a escala ${ic('chev')}</a></div>${H[k]?banFer(k,H[k]):''}${at.filter(e=>rel(e,k)).map(e=>item(e,k)).join('')||'<p class="mut">Ninguém escalado hoje.</p>'}</div>
  ${prox?`<div class="card"><b>Próximo feriado</b>${esc(prox[1])} · ${fmt(prox[0])}</div>`:''}`;
}
bind.inicio=()=>{
  document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const q=b.dataset.q;if(q==='falta')faltaForm(null);else if(q==='emp')empForm(null);else{S.tab=q;render()}});
  document.querySelectorAll('.it[data-e]').forEach(l=>l.onclick=()=>empForm(S.emps.find(e=>e.id===l.dataset.e)));
  if($('#vt'))$('#vt').onclick=()=>{S.tab='escala';render()};
  document.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>{pendencias()[+b.dataset.pd].ir();render();scrollTo(0,0)});
};
function vMais(){
  return `<div class="card">${[['sabados','cal','Escala dos sábados','Planeje o mês inteiro'],['ferescala','star','Escala dos feriados','Aberto, fechado ou horário especial'],['feriados','star','Feriados','Nacionais e extras'],['saldo','cal','Saldo de folgas','Dias de folga de cada um, com anotações'],['resumo','chart','Relatório','Tudo do mês para os donos'],['historico','history','Histórico','Veja e restaure o que foi apagado'],['backup','download','Backup','Baixe ou restaure todos os dados'],['design','palette','Design','Cores, foto de topo e logo'],['conta','user','Minha conta','Perfil, senha e instalar app']].map(([k,i,t,d],n)=>`<div class="it" data-go="${k}"><div class="av">${ic(i)}</div><div class="grow"><b>${t}</b><br><small>${d}</small></div>${ic('chev')}</div>`).join('')}
  <div class="it" id="so"><div class="av t4">${ic('out')}</div><div class="grow"><b>Sair</b></div></div></div>`;
}
bind.mais=()=>{
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{S.tab=b.dataset.go;render();scrollTo(0,0)});
  $('#so').onclick=async()=>{await db.auth.signOut();start()};
};

/* ===== js/tela-escala.js ===== */
/* Tela: Escala (dia a dia) */
function vEscala(){
  const wk=monday(parse(S.day)),dias=[...Array(7)].map((_,i)=>new Date(wk.getFullYear(),wk.getMonth(),wk.getDate()+i)),H=feriados(dias[0].getFullYear(),dias[6].getFullYear()),k=S.day,at=S.emps.filter(e=>e.ativo),flex=at.filter(e=>e.tipo==='flexivel');
  const lista=at.filter(e=>rel(e,k)),folga=at.filter(e=>e.tipo!=='flexivel'&&!rel(e,k));
  const semana=flex.map(e=>{const dd=dias.filter(d=>S.dias.some(x=>x.funcionario_id===e.id&&x.data===iso(d))),ok=dd.length>=e.dias_semana;
    return `<div class="it" data-e="${e.id}"><div class="av">${esc((e.nome[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(e.nome)}</b><br><small>${dd.length} de ${e.dias_semana} dias · ${dd.map(d=>DIAS[d.getDay()]).join(', ')||'nenhum dia escalado'}</small></div><span class="tag ${ok?'ok':'warn'}">${ok?'Completo':'Faltam '+(e.dias_semana-dd.length)}</span></div>`}).join('');
  return `<div class="card" style="padding:10px"><div class="row" style="margin:0"><button class="ghost sm" id="pv">‹</button><b class="grow" style="text-align:center;margin:0">${dias[0].toLocaleDateString('pt-BR',{day:'numeric',month:'short'})} a ${dias[6].toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}</b><button class="ghost sm" id="nx">›</button></div></div>
  <div class="days">${dias.map(d=>{const q=iso(d);return `<button class="dc ${q===k?'on':''}" data-d="${q}">${DIAS[d.getDay()]}<b>${d.getDate()}</b><span style="${H[q]?'':'visibility:hidden'}"></span></button>`}).join('')}</div>
  <div class="card tint soft t2"><b>${parse(k).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</b>${H[k]?banFer(k,H[k],true):''}${lista.map(e=>item(e,k)).join('')||'<p class="mut">Ninguém escalado neste dia.</p>'}${folga.length&&!H[k]?`<p class="mut"><small>De folga: ${folga.map(e=>esc(e.nome)).join(', ')}</small></p>`:''}<div class="row"><button class="ghost grow" id="esd">Escalar neste dia</button><button class="ghost grow" id="sbd">Sábados do mês</button></div></div>
  ${semana?`<div class="card tint soft t1"><b>Semana · funcionários flexíveis</b>${semana}</div>`:''}`;
}
bind.escala=()=>{
  const k=S.day,mv=n=>{const d=parse(S.day);d.setDate(d.getDate()+n);S.day=iso(d);render()};
  $('#pv').onclick=()=>mv(-7);$('#nx').onclick=()=>mv(7);$('#esd').onclick=()=>diaForm(k,null);if($('#fer'))$('#fer').onclick=()=>feriadoSheet(k);$('#sbd').onclick=()=>{S.tab='sabados';render()};
  document.querySelectorAll('.dc').forEach(b=>b.onclick=()=>{S.day=b.dataset.d;render()});
  document.querySelectorAll('.it[data-e]').forEach(l=>l.onclick=()=>{
    const e=S.emps.find(x=>x.id===l.dataset.e),ov=S.dias.find(x=>x.funcionario_id===e.id&&x.data===k),b=[[ov?'Alterar horário deste dia':'Escalar neste dia',()=>diaForm(k,e)]];
    if(ov)b.push(['Remover escala deste dia',async()=>{await removeDias([ov],'Escala do dia');load()},'red']);
    if(e.tipo==='flexivel')b.push(['Folha de ponto',()=>{S.pe=e.id;S.tab='ponto';render()}]);
    b.push(['Editar cadastro e escala fixa',()=>empForm(e)]);
    sheet(esc(e.nome)+' · '+fmt(k),b);
  });
};
function diaForm(k,e0,livre,fer){
  const l=S.emps.filter(e=>e.ativo).map(e=>[e.id,e.nome]);if(!l.length)return alert('Cadastre funcionários primeiro.');
  const ov=e0&&S.dias.find(x=>x.funcionario_id===e0.id&&x.data===k);
  modal(livre?'Registrar dia trabalhado':'Escalar em '+fmt(k),`<label>Funcionário<select name="fu">${opts(l,e0&&e0.id)}</select></label>${livre?`<label>Data<input type="date" name="dt" value="${k}"></label>`:''}<div class="row"><label class="grow">${livre?'Chegada':'Entrada'}<input type="time" name="en" value="${hhmm(ov&&ov.entrada)||'07:00'}"></label><label class="grow">Saída<input type="time" name="sa" value="${hhmm(ov&&ov.saida)||'12:00'}"></label></div><p class="mut"><small>${livre?'Digite os horários da folhinha dela.':'Para funcionário flexível, a saída é calculada pelas horas por dia (você pode ajustar).'}</small></p>`,async d=>{
    const g=n=>d.querySelector(`[name="${n}"]`),dt=livre?g('dt').value:k;
    if(!dt)throw Error('Informe a data.');
    if(!g('en').value||!g('sa').value)throw Error('Informe entrada e saída.');
    if(g('sa').value<=g('en').value)throw Error('A saída precisa ser depois da entrada.');
    if(!livre)confirmaConflitos([{e:S.emps.find(x=>x.id===g('fu').value),k:dt,en:g('en').value,sa:g('sa').value}]);
    await ck(db.from('escalas_dia').upsert({funcionario_id:g('fu').value,data:dt,entrada:g('en').value,saida:g('sa').value},{onConflict:'funcionario_id,data'}));
    if(fer)await marcaEspecial(dt);
  });
  const d=[...document.querySelectorAll('dialog')].pop(),g=n=>d.querySelector(`[name="${n}"]`);
  const auto=()=>{const e=S.emps.find(x=>x.id===g('fu').value);if(e&&e.tipo==='flexivel'&&g('en').value){const [h,m]=g('en').value.split(':').map(Number),t=h*60+m+Math.round(e.horas_dia*60);g('sa').value=p2(Math.floor(t/60)%24)+':'+p2(t%60)}};
  g('en').oninput=auto;g('fu').onchange=auto;if(!ov&&!livre)auto();
}

/* ===== js/tela-sabados.js ===== */
/* Tela: Escala dos sábados */
function vSabados(){
  const H=feriados(+S.sm.slice(0,4));
  return `<div class="card" style="padding:10px"><input type="month" id="sm" value="${S.sm}"></div>
  <div class="row"><button class="grow" id="spdf">Baixar PDF do mês</button><button class="ghost grow" id="stxt">Copiar texto</button></div>
  ${sabadosDoMes(S.sm).map(k=>{const es=S.dias.filter(x=>x.data===k).sort((a,b)=>a.entrada.localeCompare(b.entrada));
    return `<div class="card"><div class="row" style="margin:0"><b class="grow" style="margin:0">Sábado ${fmt(k)}</b>${H[k]?`<span class="tag warn">${esc(H[k])}</span>`:''}</div>
    ${es.map(x=>`<div class="it" data-sx="${x.id}"><div class="av">${esc((nome(x.funcionario_id)[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(nome(x.funcionario_id))}</b><br><small>${hhmm(x.entrada)} às ${hhmm(x.saida)}</small></div></div>`).join('')||'<p class="mut"><small>Nada escalado ainda.</small></p>'}
    ${notaHtml('sab:'+k)}
    <div class="row"><button class="ghost grow sm" data-t2="${k}">Escalar dois turnos</button><button class="ghost grow sm" data-t1="${k}">Adicionar pessoa</button></div>
    <div class="row"><button class="ghost grow sm" data-cp="${k}">Copiar de outro sábado</button><button class="ghost grow sm" data-nt="${k}">${nota('sab:'+k)?'Editar anotação':'Anotação'}</button></div></div>`}).join('')}`;
}
bind.sabados=()=>{
  $('#sm').onchange=e=>{S.sm=e.target.value||S.sm;render()};
  $('#spdf').onclick=()=>escolheQuem(ids=>baixarSabadosPDF(S.sm,ids),'Baixar PDF');
  $('#stxt').onclick=()=>escolheQuem(async ids=>{const t=textoSabados(S.sm,ids);try{await navigator.clipboard.writeText(t);alert('Escala copiada. É só colar no WhatsApp.')}catch{prompt('Copie o texto:',t)}},'Copiar');
  document.querySelectorAll('[data-t2]').forEach(b=>b.onclick=()=>turnosForm(b.dataset.t2));
  document.querySelectorAll('[data-t1]').forEach(b=>b.onclick=()=>diaForm(b.dataset.t1,null));
  document.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>copiaSabado(b.dataset.cp));
  document.querySelectorAll('[data-nt]').forEach(b=>b.onclick=()=>editaNota('sab:'+b.dataset.nt,'Anotação do sábado '+fmt(b.dataset.nt)));
  document.querySelectorAll('.it[data-sx]').forEach(l=>l.onclick=()=>{const x=S.dias.find(y=>y.id===l.dataset.sx),e=S.emps.find(y=>y.id===x.funcionario_id);
    sheet(esc(e.nome)+' · '+fmt(x.data),[['Alterar horário',()=>diaForm(x.data,e)],['Remover deste sábado',async()=>{await removeDias([x],'Sábado');load()},'red']])});
};
function turnosForm(k,fer){
  const fix=S.emps.filter(e=>e.ativo&&e.tipo!=='flexivel'),l=[['','Ninguém'],...fix.map(e=>[e.id,e.nome])],ids=fix.map(e=>e.id);
  const cur=S.dias.filter(x=>x.data===k&&ids.includes(x.funcionario_id)).sort((a,b)=>a.entrada.localeCompare(b.entrada)),a=cur[0],b=cur[1];
  const t=(n,x,en,sa,tt)=>`<b>${tt}</b><label>Funcionário<select name="${n}">${opts(l,x?x.funcionario_id:'')}</select></label><div class="row"><label class="grow">Entrada<input type="time" name="${n}e" value="${x?hhmm(x.entrada):en}"></label><label class="grow">Saída<input type="time" name="${n}s" value="${x?hhmm(x.saida):sa}"></label></div>`;
  modal('Sábado '+fmt(k),t('a',a,'07:00','12:00','1º turno')+t('b',b,'12:00','17:00','2º turno')+'<p class="mut"><small>Salvar substitui os turnos dos funcionários fixos neste sábado.</small></p>',async d=>{
    const g=n=>d.querySelector(`[name="${n}"]`),rows=[];
    for(const n of ['a','b']){const fu=g(n).value;if(!fu)continue;const en=g(n+'e').value,sa=g(n+'s').value;if(!en||!sa||sa<=en)throw Error('Confira os horários do '+(n==='a'?'1º':'2º')+' turno.');rows.push({funcionario_id:fu,data:k,entrada:en,saida:sa})}
    if(rows.length===2&&rows[0].funcionario_id===rows[1].funcionario_id)throw Error('Escolha pessoas diferentes em cada turno.');
    confirmaConflitos(rows.map(r=>({e:S.emps.find(x=>x.id===r.funcionario_id),k,en:r.entrada,sa:r.saida})));
    if(ids.length)await ck(db.from('escalas_dia').delete().eq('data',k).in('funcionario_id',ids));
    if(rows.length)await ck(db.from('escalas_dia').insert(rows));
    if(fer)await marcaEspecial(k);
  });
}

// Copia a escala de um sábado anterior, igual ou invertendo os turnos (quem abriu passa a fechar)
function copiaSabado(k){
  const fix=S.emps.filter(e=>e.ativo&&e.tipo!=='flexivel'),ids=fix.map(e=>e.id),fontes=[];
  for(let i=1;i<=10;i++){const d=addDias(k,-7*i),rows=S.dias.filter(x=>x.data===d&&ids.includes(x.funcionario_id));if(rows.length)fontes.push({k:d,rows})}
  if(!fontes.length)return alert('Não achei um sábado anterior já escalado para copiar.');
  modal('Copiar escala para '+fmt(k),`<label>Copiar de<select name="src">${fontes.map(f=>`<option value="${f.k}">${fmt(f.k)} — ${esc(f.rows.map(r=>nome(r.funcionario_id)).join(', '))}</option>`).join('')}</select></label>
  <label>Como copiar<select name="md"><option value="igual">Igual (mesmas pessoas e horários)</option><option value="inverte">Invertendo os turnos (quem abriu fecha e quem fechou abre)</option></select></label>
  <p class="mut"><small>Substitui os turnos dos funcionários fixos neste sábado.</small></p>`,async d=>{
    const f=fontes.find(x=>x.k===d.querySelector('[name="src"]').value),inv=d.querySelector('[name="md"]').value==='inverte';
    const src=[...f.rows].sort((a,b)=>a.entrada.localeCompare(b.entrada)),tempos=src.map(r=>[hhmm(r.entrada),hhmm(r.saida)]);
    const nov=src.map((r,i)=>{const t=inv?tempos[tempos.length-1-i]:tempos[i];return {funcionario_id:r.funcionario_id,data:k,entrada:t[0],saida:t[1]}});
    confirmaConflitos(nov.map(r=>({e:S.emps.find(x=>x.id===r.funcionario_id),k,en:r.entrada,sa:r.saida})));
    await ck(db.from('escalas_dia').delete().eq('data',k).in('funcionario_id',ids));
    await ck(db.from('escalas_dia').insert(nov));
  },'Copiar');
}

/* ===== js/tela-ponto.js ===== */
/* Tela: Folha de ponto (funcionário flexível) */
function vPonto(){
  const e=S.emps.find(x=>x.id===S.pe);if(!e)return '<div class="card mut">Funcionário não encontrado.</div>';
  const l=S.dias.filter(x=>x.funcionario_id===e.id&&x.data.startsWith(S.month)).sort((a,b)=>a.data.localeCompare(b.data)),tot=l.reduce((s,x)=>s+horas(x.entrada,x.saida),0);
  return `<div class="card" style="padding:10px"><input type="month" id="pm" value="${S.month}"></div>
  <div class="stats"><div class="stat tint t1"><b>${l.length}</b>dias no mês</div><div class="stat tint t2"><b>${fh(tot)}</b>horas no mês</div><div class="stat tint t3"><b>${e.dias_semana}×${e.horas_dia}h</b>combinado por semana</div></div>
  <div class="card"><b>${esc(e.nome)}</b>${l.map(x=>{const h=horas(x.entrada,x.saida);return `<div class="it" data-px="${x.id}"><div class="grow"><b>${fmt(x.data)}</b> <small>${DIAS[parse(x.data).getDay()]}</small><br><small>${hhmm(x.entrada)} às ${hhmm(x.saida)}</small></div><span class="tag ${h>=e.horas_dia?'ok':'warn'}">${fh(h)}</span></div>`}).join('')||'<p class="mut">Nenhum dia registrado neste mês.</p>'}<button id="pa" style="width:100%;margin-top:10px">Registrar dia trabalhado</button><button class="ghost" id="pr2" style="width:100%;margin-top:8px">Relatório / PDF por período</button></div>`;
}
bind.ponto=()=>{
  const e=S.emps.find(x=>x.id===S.pe);
  $('#pm').onchange=ev=>{S.month=ev.target.value||S.month;render()};
  $('#pr2').onclick=()=>{S.rp.emp=S.pe;setSemana(0);S.tab='relper';render()};
  $('#pa').onclick=()=>{const h=iso(new Date());diaForm(h.startsWith(S.month)?h:S.month+'-01',e,true)};
  document.querySelectorAll('.it[data-px]').forEach(l=>l.onclick=()=>{const x=S.dias.find(y=>y.id===l.dataset.px);
    sheet(esc(e.nome)+' · '+fmt(x.data),[['Alterar horários',()=>diaForm(x.data,e,true)],['Remover este dia',async()=>{await removeDias([x],'Folha de ponto');load()},'red']])});
};

/* ===== js/tela-equipe.js ===== */
/* Tela: Equipe e cadastro de funcionário */
async function semSabadoFixo(){
  if(!confirm('Tirar o sábado da escala fixa de todos os funcionários? Os sábados alternados que você já escalou continuam.'))return;
  try{await ck(db.from('escalas').update({folga:true}).eq('dia_semana',6).eq('folga',false))}catch(e){return alert(e.message)}
  load();
}
function vFunc(){
  const l=[...S.emps].sort((a,b)=>b.ativo-a.ativo);
  return `${S.esc.some(x=>x.dia_semana===6&&!x.folga)?'<div class="card"><b>Sábado na escala fixa</b><small>Alguns funcionários ainda têm sábado como dia fixo de trabalho.</small><button class="ghost" id="nosat" style="width:100%;margin-top:8px">Tirar sábado da escala fixa de todos</button></div>':''}<div class="card"><b>${S.emps.filter(e=>e.ativo).length} funcionários ativos</b>${l.map(e=>`<div class="it" data-e="${e.id}"><div class="av">${esc((e.nome[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(e.nome)}</b><br><small>${e.tipo==='flexivel'?`Flexível · ${e.dias_semana} dias por semana · ${e.horas_dia}h`:esc(e.cargo||'Sem cargo')}${e.telefone?' · '+esc(e.telefone):''}</small></div>${e.ativo?'':'<span class="tag gr">inativo</span>'}</div>`).join('')||'<p class="mut">Toque no + para adicionar o primeiro funcionário.</p>'}</div>`;
}
bind.func=()=>document.querySelectorAll('.it[data-e]').forEach(l=>l.onclick=()=>{
  const e=S.emps.find(x=>x.id===l.dataset.e);
  sheet(esc(e.nome),[...(e.tipo==='flexivel'?[['Folha de ponto (registrar horários)',()=>{S.pe=e.id;S.tab='ponto';render()}]]:[]),['Relatório por período',()=>{S.rp.emp=e.id;S.tab='relper';render()}],['Saldo de folgas',()=>{S.sf=e.id;S.tab='saldoemp';render()}],['Editar dados e escala',()=>empForm(e)],[e.ativo?'Desativar (mantém histórico)':'Reativar',async()=>{await ck(db.from('funcionarios').update({ativo:!e.ativo}).eq('id',e.id));load()}],['Excluir tudo dele',async()=>{if(!confirm(`Excluir ${e.nome} e TODO o histórico dele? (Uma cópia fica em Mais > Histórico, para restaurar.)`))return;try{await logar('apagou','funcionario',`Funcionário ${e.nome} (com todo o histórico)`,{func:e,escalas:S.esc.filter(x=>x.funcionario_id===e.id),dias:S.dias.filter(x=>x.funcionario_id===e.id),faltas:S.faltas.filter(x=>x.funcionario_id===e.id),saldo:S.saldo.filter(x=>x.funcionario_id===e.id)});await ck(db.from('funcionarios').delete().eq('id',e.id))}catch(x){alert(x.message)}load()},'red']]);
});
function empForm(e){
  const sc=e?S.esc.filter(x=>x.funcionario_id===e.id):[];
  const rows=[1,2,3,4,5,6,0].map(i=>{const r=sc.find(x=>x.dia_semana===i),on=r?!r.folga:(i>=1&&i<=5);
    return `<div class="dia"><label class="dl"><input type="checkbox" name="f${i}" ${on?'checked':''}><b>${DIAS_L[i]}</b></label><div class="hrs"><input type="time" name="e${i}" value="${hhmm(r&&r.entrada)||'08:00'}"><input type="time" name="s${i}" value="${hhmm(r&&r.saida)||'17:00'}"></div></div>`}).join('');
  const fx=e&&e.tipo==='flexivel';
  modal(e?'Editar funcionário':'Novo funcionário',
    `<label>Nome<input name="nome" value="${esc(e&&e.nome)}"></label><label>Cargo<input name="cargo" value="${esc(e&&e.cargo)}"></label><label>Telefone<input name="tel" value="${esc(e&&e.telefone)}"></label>
    <label>Tipo de escala<select name="tp"><option value="fixo" ${fx?'':'selected'}>Fixa: dias e horários da semana</option><option value="flexivel" ${fx?'selected':''}>Flexível: X dias por semana, horário livre</option></select></label>
    <div id="bx"><h4 style="margin:10px 0 2px">Dias fixos de trabalho</h4><p class="mut" style="margin:0 0 6px"><small>Marque só os dias em que ele trabalha toda semana. Sábado alternado: deixe desmarcado e use a Escala dos sábados.</small></p>${rows}</div>
    <div id="bf" style="display:none"><div class="row"><label class="grow">Dias por semana<input type="number" min="1" max="7" name="ds" value="${e?e.dias_semana:3}"></label><label class="grow">Horas por dia<input type="number" step="0.25" min="1" name="hd" value="${e?e.horas_dia:5}"></label></div><p class="mut"><small>Você escolhe o dia e a hora de entrada de cada semana na aba Escala.</small></p></div>`,
    async d=>{
      const g=n=>d.querySelector(`[name="${n}"]`),flex=g('tp').value==='flexivel';
      if(!g('nome').value.trim())throw Error('Informe o nome.');
      const p={nome:g('nome').value.trim(),cargo:g('cargo').value.trim()||null,telefone:g('tel').value.trim()||null,tipo:g('tp').value,dias_semana:+g('ds').value||3,horas_dia:+g('hd').value||5};
      let id=e&&e.id;
      if(id)await ck(db.from('funcionarios').update(p).eq('id',id));else id=(await ck(db.from('funcionarios').insert(p).select().single())).data.id;
      if(!flex){const l=[0,1,2,3,4,5,6].map(i=>({funcionario_id:id,dia_semana:i,folga:!g('f'+i).checked,entrada:g('e'+i).value||null,saida:g('s'+i).value||null}));await ck(db.from('escalas').upsert(l,{onConflict:'funcionario_id,dia_semana'}))}
    });
  const d=[...document.querySelectorAll('dialog')].pop(),tg=()=>{const f=d.querySelector('[name="tp"]').value==='flexivel';d.querySelector('#bx').style.display=f?'none':'';d.querySelector('#bf').style.display=f?'':'none'};
  d.querySelector('[name="tp"]').onchange=tg;tg();
  d.querySelectorAll('.dia input[type=checkbox]').forEach(c=>{const t=()=>c.closest('.dia').classList.toggle('off',!c.checked);c.onchange=t;t()});
}

/* ===== js/tela-faltas.js ===== */
/* Tela: Faltas, atestados e anexos */
function vFaltas(){
  const l=S.faltas.filter(f=>f.data.startsWith(S.month));
  return `<div class="card" style="padding:10px"><input type="month" id="mm" value="${S.month}"></div>
  ${l.map(f=>`<div class="card tint soft ${f.atestado?'t1':'t4'}" data-f="${f.id}" style="cursor:pointer"><div class="row" style="margin:0"><b class="grow" style="margin:0">${esc(nome(f.funcionario_id))}</b><span class="tag ${f.atestado?'ok':'bad'}">${f.atestado?'Com atestado':'Sem atestado'}</span></div>
  <small>${fmt(f.data)} · ${esc(f.motivo)}</small>
  ${+f.horas_devidas>0?`<div style="margin-top:6px">Deve ${f.horas_devidas}h ${f.horas_quitadas?'<span class="tag ok">quitadas</span>':'<span class="tag warn">pendentes</span>'}</div>`:''}
  ${f.cobertura_id?`<div style="margin-top:4px">Coberto por <b>${esc(nome(f.cobertura_id))}</b></div>`:''}${f.observacao?`<div class="mut" style="margin-top:4px"><small>${esc(f.observacao)}</small></div>`:''}${(f.anexos||[]).length?`<div style="margin-top:6px"><span class="tag gr">${f.anexos.length} anexo(s)</span></div>`:''}</div>`).join('')||'<div class="card mut">Nenhuma falta neste mês. Toque no + para registrar.</div>'}`;
}
bind.faltas=()=>{
  $('#mm').onchange=e=>{S.month=e.target.value||S.month;render()};
  document.querySelectorAll('[data-f]').forEach(c=>c.onclick=()=>{
    const f=S.faltas.find(x=>x.id===c.dataset.f),b=[...((f.anexos||[]).length?[['Ver atestado / anexos',()=>verAnexos(f)]]:[]),['Editar',()=>faltaForm(f)]];
    if(+f.horas_devidas>0)b.push([f.horas_quitadas?'Reabrir horas':'Marcar horas como quitadas',async()=>{await ck(db.from('faltas').update({horas_quitadas:!f.horas_quitadas}).eq('id',f.id));load()}]);
    b.push(['Apagar registro',async()=>{if(!confirm('Apagar este registro? Dá para restaurar em Mais > Histórico.'))return;await logar('apagou','falta',`Falta de ${nome(f.funcionario_id)} em ${fmt(f.data)} (${f.motivo})`,{falta:f,saldo:S.saldo.filter(x=>x.falta_id===f.id)});await ck(db.from('faltas').delete().eq('id',f.id));load()},'red']);
    sheet(esc(nome(f.funcionario_id))+' · '+fmt(f.data),b);
  });
};
async function verAnexos(f){
  const ax=f.anexos||[];if(!ax.length)return alert('Esta falta não tem anexos.');
  const r=await db.storage.from('atestados').createSignedUrls(ax.map(a=>a.path),600);
  if(r.error)return alert('Não foi possível abrir: '+r.error.message);
  const d=document.createElement('dialog');
  d.innerHTML=`<h3 style="margin-top:0">${esc(nome(f.funcionario_id))} · ${fmt(f.data)}</h3>`+r.data.map((u,i)=>{const a=ax[i],img=(a.tipo||'').startsWith('image/');
    return `<div style="margin:12px 0"><b>${esc(a.nome)}</b>${img&&u.signedUrl?`<img src="${u.signedUrl}" style="width:100%;border-radius:14px;margin:6px 0;display:block" alt="anexo">`:''}<a href="${u.signedUrl}" target="_blank" rel="noopener"><button type="button" class="ghost" style="width:100%">${img?'Abrir em tela cheia':'Abrir PDF'}</button></a></div>`}).join('')+`<button class="ghost" style="width:100%" id="fx">Fechar</button>`;
  document.body.append(d);d.showModal();d.onclose=()=>d.remove();d.querySelector('#fx').onclick=()=>d.close();
}
function faltaForm(f){
  const ativos=S.emps.filter(e=>e.ativo||(f&&(e.id===f.funcionario_id||e.id===f.cobertura_id))).map(e=>[e.id,e.nome]);
  if(!ativos.length)return alert('Cadastre funcionários primeiro.');
  const ax=(f&&f.anexos)||[],lig=f&&S.saldo.find(x=>x.falta_id===f.id);
  modal(f?'Editar registro':'Registrar falta',
    `<label>Funcionário que faltou<select name="fu">${opts(ativos,f&&f.funcionario_id)}</select></label>
     <label>Data<input type="date" name="dt" value="${(f&&f.data)||iso(new Date())}"></label>
     ${f?'':'<label>Até (só se for mais de um dia, ex.: atestado de 3 dias)<input type="date" name="ate"></label>'}
     <label>Motivo<select name="mo">${opts(MOTIVOS.map(m=>[m,m]),f&&f.motivo)}</select></label>
     <div id="sfb"><label style="color:var(--ink);display:flex;align-items:center"><input type="checkbox" name="sf" ${(!f||lig)?'checked':''}> Descontar 1 dia do saldo de folgas</label></div>
     <label><input type="checkbox" name="at" ${f&&f.atestado?'checked':''}> Trouxe atestado</label>
     <div id="axb"><label>Anexar atestado ou comprovante (foto ou PDF)<input type="file" name="ax" accept="image/*,application/pdf" multiple></label>${ax.map((a,i)=>`<label><input type="checkbox" name="rm${i}"> Tirar este anexo da falta: ${esc(a.nome)} (o arquivo continua guardado)</label>`).join('')}</div>
     <label>Horas devidas${f?'':' (por dia)'} — 0 se não deve<input type="number" step="0.25" min="0" name="hd" value="${(f&&f.horas_devidas)||0}"></label>
     <label>Quem cobriu a falta<select name="cb"><option value="">Ninguém</option>${opts(ativos,f&&f.cobertura_id)}</select></label>
     <label>Observação (escreva o que quiser)<textarea name="ob" rows="3">${esc(f&&f.observacao)}</textarea></label>`,
    async d=>{
      const g=n=>d.querySelector(`[name="${n}"]`);
      const dt=g('dt').value,ate=f?'':g('ate').value;
      if(!dt)throw Error('Informe a data.');
      if(ate&&ate<dt)throw Error('A data final precisa ser depois da inicial.');
      if(g('cb').value&&g('cb').value===g('fu').value)throw Error('Quem cobriu não pode ser a mesma pessoa que faltou.');
      const fu=g('fu').value,emp=S.emps.find(e=>e.id===fu),mo=g('mo').value,descontar=mo==='Folga compensada'&&g('sf').checked;
      if(descontar&&S.v4Erro)throw Error('Para descontar do saldo de folgas, rode a migração 004 no Supabase (veja o README).');
      const datas=f?[dt]:diasDaFalta(emp,dt,ate);
      if(datas.length>1&&!confirm(`Vai criar ${datas.length} registros, só nos dias em que ${emp.nome} trabalharia:\n${datas.map(dm).join(', ')}\n\nContinuar?`))throw Object.assign(Error('cancelado'),{silencioso:true});
      const anexos=ax.filter((a,i)=>!g('rm'+i).checked);
      for(const file of [...g('ax').files]){
        const ext=((file.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,5))||'bin',path=`${fu}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`;
        const up=await db.storage.from('atestados').upload(path,file,{contentType:file.type||undefined});
        if(up.error)throw Error('Não foi possível enviar o anexo: '+up.error.message);
        anexos.push({path,nome:file.name,tipo:file.type});
      }
      const base={funcionario_id:fu,motivo:mo,atestado:g('at').checked,horas_devidas:+g('hd').value||0,cobertura_id:g('cb').value||null,observacao:g('ob').value.trim()||null},anota=base.observacao||'Folga compensada';
      if(f){
        await ck(db.from('faltas').update({...base,data:dt,anexos}).eq('id',f.id));
        if(descontar&&!lig)await ck(db.from('saldo_folgas').insert({funcionario_id:fu,tipo:'uso',dias:1,data:dt,anotacao:anota,falta_id:f.id}));
        if(descontar&&lig)await ck(db.from('saldo_folgas').update({funcionario_id:fu,data:dt}).eq('id',lig.id));
        if(!descontar&&lig)await ck(db.from('saldo_folgas').delete().eq('id',lig.id));
      }else{
        const r=await ck(db.from('faltas').insert(datas.map((k,i)=>({...base,data:k,anexos:i===0?anexos:[]}))).select());
        if(descontar)await ck(db.from('saldo_folgas').insert(r.data.map(x=>({funcionario_id:fu,tipo:'uso',dias:1,data:x.data,anotacao:anota,falta_id:x.id}))));
      }
      S.month=dt.slice(0,7);
    });
  const d=[...document.querySelectorAll('dialog')].pop(),mostra=()=>{
    d.querySelector('#axb').style.display=(d.querySelector('[name="at"]').checked||ax.length)?'':'none';
    d.querySelector('#sfb').style.display=d.querySelector('[name="mo"]').value==='Folga compensada'?'':'none';
  };
  d.querySelector('[name="at"]').onchange=mostra;d.querySelector('[name="mo"]').onchange=mostra;mostra();
}

/* ===== js/tela-feriados.js ===== */
/* Telas: Feriados e Escala dos feriados */
function vFeriados(){
  const m = feriados(S.year), lista = Object.entries(m).filter(([k]) => k.startsWith(S.year)).sort();
  return `<div class="card"><div class="row"><button class="ghost sm" id="ya">‹</button><b>${S.year}</b><button class="ghost sm" id="yp">›</button><span class="grow"></span><button id="nfe">+ Feriado extra</button></div><button class="ghost" id="fesc" style="width:100%;margin:2px 0 8px">Montar escala dos feriados</button>
  ${lista.map(([k,n]) => { const ex = S.extras.find(e => e.data===k); return `<div class="row" style="border-top:1px solid var(--line)"><span class="w" style="width:90px">${fmt(k)}</span><span>${DIAS[parse(k).getDay()]}</span><span class="grow">${esc(n)}</span>${ex?`<button class="red sm" data-xd="${ex.id}">×</button>`:''}</div>`; }).join('')}
  <p class="mut"><small>Feriados nacionais são calculados automaticamente. Use "feriado extra" para municipais ou recesso da empresa.</small></p></div>`;
}
bind.feriados = () => {
  $('#ya').onclick = () => { S.year--; render(); }; $('#yp').onclick = () => { S.year++; render(); };
  $('#fesc').onclick=()=>{S.fm=(S.year===new Date().getFullYear()?iso(new Date()).slice(0,7):S.year+'-01');S.tab='ferescala';render()};
  $('#nfe').onclick = () => modal('Feriado extra', `<label>Data<input type="date" name="dt"></label><label>Nome<input name="nm"></label>`, async d => {
    const dt = d.querySelector('[name="dt"]').value, nm = d.querySelector('[name="nm"]').value.trim();
    if (!dt || !nm) throw Error('Informe data e nome.');
    await ck(db.from('feriados_extras').insert({ data:dt, nome:nm })); S.year = +dt.slice(0,4);
  });
  document.querySelectorAll('[data-xd]').forEach(b => b.onclick = async () => { await ck(db.from('feriados_extras').delete().eq('id',b.dataset.xd)); load(); });
};
async function marcaEspecial(k){if(S.fmErro||S.fmodo[k]!=='fechado')return;try{await db.from('feriado_modo').delete().eq('data',k);delete S.fmodo[k]}catch(e){}}
async function setModo(k,modo){
  if(S.fmErro){alert('Antes de montar a escala dos feriados, rode a migração 003 no Supabase (SQL Editor; veja o README).');return false}
  try{await ck(db.from('feriado_modo').upsert({data:k,modo}))}catch(e){alert(e.message);return false}
  S.fmodo[k]=modo;return true;
}
async function voltaNormal(k){
  if(!confirm('Limpar a escala deste feriado? Todos os escalados serão removidos e ele volta a ficar em branco.'))return;
  const ids=S.emps.filter(e=>e.tipo!=='flexivel').map(e=>e.id);
  try{if(!S.fmErro)await ck(db.from('feriado_modo').delete().eq('data',k));await removeDias(S.dias.filter(x=>x.data===k&&ids.includes(x.funcionario_id)),'Feriado limpo')}catch(e){return alert(e.message)}
  load();
}
function feriadoSheet(k){
  const nm=feriados(+k.slice(0,4))[k]||'Feriado';
  sheet(fmt(k)+' · '+esc(nm),[
    ['Escalar dois turnos (manhã e tarde)',()=>turnosForm(k,true)],
    ['Escalar várias pessoas no mesmo horário',()=>multiForm(k)],
    ['Adicionar ou alterar uma pessoa',()=>diaForm(k,null,false,true)],
    ['Marcar como fechado (ninguém trabalha)',async()=>{if(await setModo(k,'fechado'))load()}],
    ['Limpar escala do feriado (deixar em branco)',()=>voltaNormal(k),'red']]);
}
function multiForm(k){
  const at=S.emps.filter(e=>e.ativo);if(!at.length)return alert('Cadastre funcionários primeiro.');
  modal('Escalar em '+fmt(k),`<div class="row"><button type="button" class="ghost sm" data-pp="07:00|12:00">Manhã</button><button type="button" class="ghost sm" data-pp="12:00|17:00">Tarde</button><button type="button" class="ghost sm" data-pp="07:00|17:00">Dia inteiro</button></div>
  <div class="row"><label class="grow">Entrada<input type="time" name="en" value="07:00"></label><label class="grow">Saída<input type="time" name="sa" value="12:00"></label></div>
  <div class="row" style="justify-content:space-between"><b>Quem trabalha</b><button type="button" class="ghost sm" id="mt">Marcar todos</button></div>
  ${at.map(e=>`<label style="color:var(--ink);display:flex;align-items:center;margin:8px 0;font-size:15px"><input type="checkbox" name="q_${e.id}">${esc(e.nome)}</label>`).join('')}`,async d=>{
    const g=n=>d.querySelector(`[name="${n}"]`),en=g('en').value,sa=g('sa').value;
    if(!en||!sa||sa<=en)throw Error('Confira a entrada e a saída.');
    const ids=at.filter(e=>g('q_'+e.id).checked).map(e=>e.id);if(!ids.length)throw Error('Marque pelo menos uma pessoa.');
    confirmaConflitos(ids.map(id=>({e:S.emps.find(x=>x.id===id),k,en,sa})));
    await ck(db.from('escalas_dia').upsert(ids.map(id=>({funcionario_id:id,data:k,entrada:en,saida:sa})),{onConflict:'funcionario_id,data'}));
    await marcaEspecial(k);
  },'Salvar escala');
  const d=[...document.querySelectorAll('dialog')].pop();
  d.querySelectorAll('[data-pp]').forEach(b=>b.onclick=()=>{const [a,z]=b.dataset.pp.split('|');d.querySelector('[name="en"]').value=a;d.querySelector('[name="sa"]').value=z});
  d.querySelector('#mt').onclick=()=>{const cs=[...d.querySelectorAll('input[type=checkbox]')],todos=cs.every(c=>c.checked);cs.forEach(c=>c.checked=!todos)};
}
function vFerEscala(){
  const H=feriados(+S.fm.slice(0,4)),lista=Object.entries(H).filter(([k])=>k.startsWith(S.fm)).sort(),at=S.emps.filter(e=>e.ativo);
  const tg={vazio:['gr','A definir'],especial:['ok','Escalado'],fechado:['bad','Fechado']};
  return `<div class="card" style="padding:10px"><input type="month" id="fm" value="${S.fm}"></div>
  <div class="row"><button class="grow" id="fpdf">Baixar PDF do mês</button><button class="ghost grow" id="ftxt">Copiar texto</button></div>
  ${S.fmErro?'<div class="card"><b>Para usar "Fechado"</b><small>Rode a migração 003 no Supabase (SQL Editor; veja o README). Montar a escala dos feriados já funciona sem isso.</small></div>':''}
  ${lista.map(([k,nm])=>{const fe=S.fmodo[k]==='fechado',itens=fe?[]:at.map(e=>({e,t:turnoDia(e,k)})).filter(x=>x.t).sort((a,b)=>a.t.en.localeCompare(b.t.en)),md=fe?'fechado':itens.length?'especial':'vazio',[c,t]=tg[md];
    return `<div class="card"><div class="row" style="margin:0"><div class="grow"><b>${fmt(k)} · ${DIAS[parse(k).getDay()]}</b><br><small>${esc(nm)}</small></div><span class="tag ${c}">${t}</span></div>
    ${md==='fechado'?'<p class="mut"><small>Ninguém trabalha neste feriado.</small></p>':itens.map(x=>`<div class="it" data-fk="${k}"><div class="av">${esc((x.e.nome[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(x.e.nome)}</b><br><small>${x.t.en} às ${x.t.sa} · ${fh(horas(x.t.en,x.t.sa))}</small></div><span class="chv">${ic('chev')}</span></div>`).join('')||'<p class="mut"><small>Ninguém escalado.</small></p>'}
    ${notaHtml('fer:'+k)}
    <div class="row"><button class="grow" data-fs="${k}">${md==='vazio'?'Montar escala do feriado':'Editar escala do feriado'}</button></div><div class="row"><button class="ghost grow sm" data-fp="${k}">Baixar PDF deste feriado</button><button class="ghost grow sm" data-ft="${k}">Copiar texto</button></div><div class="row"><button class="ghost grow sm" data-fn="${k}">${nota('fer:'+k)?'Editar anotação':'Anotação'}</button></div></div>`}).join('')||'<div class="card mut">Nenhum feriado neste mês.</div>'}`;
}
bind.ferescala=()=>{
  $('#fm').onchange=e=>{S.fm=e.target.value||S.fm;render()};
  $('#fpdf').onclick=()=>escolheQuem(ids=>baixarFeriadosPDF(S.fm,ids),'Baixar PDF');
  $('#ftxt').onclick=()=>escolheQuem(async ids=>{const t=textoFeriados(S.fm,ids);try{await navigator.clipboard.writeText(t);alert('Escala copiada. É só colar no WhatsApp.')}catch{prompt('Copie o texto:',t)}},'Copiar');
  document.querySelectorAll('[data-fs],[data-fk]').forEach(b=>b.onclick=()=>feriadoSheet(b.dataset.fs||b.dataset.fk));
  document.querySelectorAll('[data-fn]').forEach(b=>b.onclick=()=>editaNota('fer:'+b.dataset.fn,'Anotação do feriado '+fmt(b.dataset.fn)));
  const todos=()=>{const at=S.emps.filter(e=>e.ativo);return (DS.sabSel||at.filter(e=>e.tipo!=='flexivel').map(e=>e.id)).filter(id=>at.some(e=>e.id===id))};
  document.querySelectorAll('[data-fp]').forEach(b=>b.onclick=()=>baixarFeriadosPDF(S.fm,todos(),b.dataset.fp));
  document.querySelectorAll('[data-ft]').forEach(b=>b.onclick=async()=>{const t=textoFeriados(S.fm,todos(),b.dataset.ft);try{await navigator.clipboard.writeText(t);alert('Escala copiada. É só colar no WhatsApp.')}catch{prompt('Copie o texto:',t)}});
};

/* ===== js/tela-saldo.js ===== */
/* Telas: Saldo de folgas (lista da equipe e extrato de cada funcionário) */
const avisoV4=()=>S.v4Erro?'<div class="card"><b>Falta uma atualização no banco</b><small>Rode a migração 004 no Supabase (SQL Editor) para usar saldo de folgas, anotações, histórico e o design salvo no banco. O passo a passo está no README.</small></div>':'';
function vSaldo(){
  const at=S.emps.filter(e=>e.ativo);
  return `${avisoV4()}<div class="card"><b>Saldo de folgas</b><p class="mut" style="margin:0 0 6px"><small>Dias de folga que cada um tem a receber. Toque em um nome para ver o extrato e escrever anotações.</small></p>
  ${at.map(e=>{const s=saldoDe(e.id);return `<div class="it" data-sf="${e.id}"><div class="av">${esc((e.nome[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(e.nome)}</b></div><span class="tag ${s>0?'ok':s<0?'bad':'gr'}">${fd(s)}</span><span class="chv">${ic('chev')}</span></div>`}).join('')||'<p class="mut">Cadastre funcionários primeiro.</p>'}</div>`;
}
bind.saldo=()=>document.querySelectorAll('[data-sf]').forEach(b=>b.onclick=()=>{S.sf=b.dataset.sf;S.tab='saldoemp';render();scrollTo(0,0)});
function vSaldoEmp(){
  const e=S.emps.find(x=>x.id===S.sf);if(!e)return '<div class="card mut">Funcionário não encontrado.</div>';
  const mv=S.saldo.filter(x=>x.funcionario_id===e.id).sort((a,b)=>b.data.localeCompare(a.data)||String(b.criado_em).localeCompare(String(a.criado_em)));
  const cred=mv.filter(x=>x.tipo==='credito').reduce((s,x)=>s+ +x.dias,0),uso=mv.filter(x=>x.tipo==='uso').reduce((s,x)=>s+ +x.dias,0);
  return `${avisoV4()}<div class="stats"><div class="stat u3"><b>${fn(cred-uso)}</b>dias de saldo</div><div class="stat u1"><b>${fn(cred)}</b>recebidos</div><div class="stat u2"><b>${fn(uso)}</b>usados</div></div>
  <div class="row"><button class="grow" id="sfc">Dar folga</button><button class="ghost grow" id="sfu">Usar folga</button></div>
  <div class="card"><b>Extrato · ${esc(e.nome)}</b>${mv.map(x=>`<div class="it" data-sm="${x.id}"><div class="grow"><b>${fmt(x.data)}</b> <small>${x.tipo==='credito'?'Folga recebida':'Folga usada'}</small>${x.anotacao?`<br><small>${esc(x.anotacao)}</small>`:''}</div><span class="tag ${x.tipo==='credito'?'ok':'warn'}">${x.tipo==='credito'?'+':'-'}${fn(+x.dias)}</span></div>`).join('')||'<p class="mut">Nenhum movimento ainda.</p>'}</div>`;
}
function saldoForm(e,tipo,x){
  if(S.v4Erro)return alert('Rode a migração 004 no Supabase para usar o saldo de folgas (veja o README).');
  modal(x?'Editar movimento':(tipo==='credito'?'Dar folga a '+e.nome:'Usar folga de '+e.nome),
    `<label>Quantos dias<input type="number" step="0.5" min="0.5" name="di" value="${x?x.dias:1}"></label><label>Data<input type="date" name="dt" value="${x?x.data:iso(new Date())}"></label><label>Anotação (escreva o que quiser)<textarea name="an" rows="3" placeholder="Ex.: trabalhou na eleição, usou na sexta...">${esc(x&&x.anotacao)}</textarea></label>`,async d=>{
      const g=n=>d.querySelector(`[name="${n}"]`),di=+g('di').value,tp=x?x.tipo:tipo;
      if(!(di>0))throw Error('Informe quantos dias.');
      if(!g('dt').value)throw Error('Informe a data.');
      if(tp==='uso'&&saldoDe(e.id)-(x?+x.dias:0)-di<0&&!confirm(`O saldo de ${e.nome} ficará negativo. Manter mesmo assim?`))throw Object.assign(Error('cancelado'),{silencioso:true});
      const p={funcionario_id:e.id,tipo:tp,dias:di,data:g('dt').value,anotacao:g('an').value.trim()||null};
      if(x)await ck(db.from('saldo_folgas').update(p).eq('id',x.id));else await ck(db.from('saldo_folgas').insert(p));
    });
}
bind.saldoemp=()=>{
  const e=S.emps.find(x=>x.id===S.sf);if(!e)return;
  $('#sfc').onclick=()=>saldoForm(e,'credito');$('#sfu').onclick=()=>saldoForm(e,'uso');
  document.querySelectorAll('[data-sm]').forEach(l=>l.onclick=()=>{const x=S.saldo.find(y=>y.id===l.dataset.sm);
    sheet(esc(e.nome)+' · '+fmt(x.data),[['Editar',()=>saldoForm(e,x.tipo,x)],['Apagar',async()=>{if(!confirm('Apagar este movimento? Dá para restaurar em Mais > Histórico.'))return;await logar('apagou','saldo',`Saldo de ${e.nome}: ${x.tipo==='credito'?'+':'-'}${fn(+x.dias)} em ${fmt(x.data)}`,{saldo:[x]});await ck(db.from('saldo_folgas').delete().eq('id',x.id));load()},'red']])});
};

/* ===== js/tela-historico.js ===== */
/* Tela: Histórico (o que foi apagado, com opção de restaurar) */
const RESTAURAVEL=['falta','funcionario','escala_dia','saldo'];
async function carregaHist(){
  const r=await db.from('historico').select('*').order('quando',{ascending:false}).limit(80);
  S.hist=r.error?[]:r.data;if(r.error)S.v4Erro=true;
}
function vHistorico(){
  return `${avisoV4()}<div class="card"><b>Histórico</b><p class="mut" style="margin:0 0 6px"><small>O que foi apagado fica guardado aqui. Toque em Restaurar para trazer de volta.</small></p>
  ${S.hist.map(h=>`<div class="it" style="cursor:default"><div class="grow"><b>${esc(h.acao)} · ${esc(h.entidade.replace('_',' '))}</b><br><small>${esc(h.resumo||'')}</small><br><small>${new Date(h.quando).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}${h.usuario?' · '+esc(h.usuario):''}</small></div>${h.restaurado?'<span class="tag ok">restaurado</span>':(h.acao==='apagou'&&RESTAURAVEL.includes(h.entidade)&&h.detalhe)?`<button class="ghost sm" data-hr="${h.id}">Restaurar</button>`:''}</div>`).join('')||'<p class="mut">Nada por aqui ainda.</p>'}</div>`;
}
bind.historico=()=>{
  if(!S.histOk){S.histOk=true;carregaHist().then(()=>render())}
  document.querySelectorAll('[data-hr]').forEach(b=>b.onclick=()=>{const h=S.hist.find(x=>x.id===b.dataset.hr);if(h&&confirm('Restaurar: '+(h.resumo||h.entidade)+'?'))restaurar(h)});
};
async function restaurar(h){
  const d=h.detalhe||{},up=(t,rows,conf)=>rows&&rows.length?ck(db.from(t).upsert(rows,conf?{onConflict:conf}:undefined)):null;
  try{
    if(h.entidade==='funcionario'){await up('funcionarios',[d.func]);await up('escalas',d.escalas);await up('escalas_dia',d.dias,'funcionario_id,data');await up('faltas',d.faltas);await up('saldo_folgas',d.saldo)}
    else if(h.entidade==='falta'){await up('faltas',[d.falta]);await up('saldo_folgas',d.saldo)}
    else if(h.entidade==='escala_dia')await up('escalas_dia',d.dias,'funcionario_id,data');
    else if(h.entidade==='saldo')await up('saldo_folgas',d.saldo);
    await ck(db.from('historico').update({restaurado:true}).eq('id',h.id));
    await logar('restaurou',h.entidade,h.resumo,null);
  }catch(e){return alert('Não foi possível restaurar: '+e.message)}
  S.histOk=false;load();
}

/* ===== js/tela-backup.js ===== */
/* Tela: Backup (baixar e restaurar todos os dados) */
const TABELAS_BACKUP=[['funcionarios','id'],['escalas','id'],['escalas_dia','id'],['faltas','id'],['feriados_extras','id'],['feriado_modo','data'],['saldo_folgas','id'],['anotacoes','chave'],['config_app','id']];
function vBackup(){
  return `<div class="card"><b>Baixar backup</b><p class="mut" style="margin:0 0 10px"><small>Salva um arquivo com tudo: funcionários, escalas, faltas, feriados, saldo de folgas, anotações e o design. Guarde no Google Drive ou no e-mail. Os arquivos dos atestados ficam guardados no Supabase e não entram neste arquivo.</small></p><button id="bkd" style="width:100%">Baixar backup agora</button></div>
  <div class="card"><b>Restaurar de um backup</b><p class="mut" style="margin:0 0 6px"><small>Soma os dados do arquivo aos que já existem (não apaga nada). Serve para um banco novo ou para recuperar algo.</small></p><input type="file" id="bkr" accept="application/json,.json"></div>`;
}
bind.backup=()=>{$('#bkd').onclick=baixarBackup;$('#bkr').onchange=restauraBackup};
async function baixarBackup(){
  const bk={app:'escala-equipe',versao:1,gerado:new Date().toISOString(),tabelas:{}},aus=[];
  for(const [t,o] of TABELAS_BACKUP){const r=await tudo(t,o);if(r.error)aus.push(t);else bk.tabelas[t]=r.data}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(bk)],{type:'application/json'}));a.download='backup-escala-'+iso(new Date())+'.json';a.click();
  alert('Backup baixado.'+(aus.length?'\n\nTabelas que não existem no banco e ficaram de fora: '+aus.join(', ')+'.':''));
}
async function restauraBackup(e){
  const f=e.target.files[0];if(!f)return;
  let bk;try{bk=JSON.parse(await f.text())}catch{return alert('Esse arquivo não é um backup válido.')}
  if(!bk||bk.app!=='escala-equipe'||!bk.tabelas)return alert('Esse arquivo não é um backup deste app.');
  const resumo=TABELAS_BACKUP.filter(([t])=>bk.tabelas[t]&&bk.tabelas[t].length).map(([t])=>t.replace('_',' ')+': '+bk.tabelas[t].length).join('\n');
  if(!confirm('Restaurar este backup?\n\n'+resumo+'\n\nOs dados do arquivo são somados aos que já existem (nada é apagado).'))return;
  try{
    for(const [t,o] of TABELAS_BACKUP){const rows=bk.tabelas[t]||[];for(let i=0;i<rows.length;i+=200)await ck(db.from(t).upsert(rows.slice(i,i+200),{onConflict:o}))}
  }catch(x){return alert('Não consegui restaurar tudo: '+x.message)}
  await logar('restaurou','backup','Backup de '+(bk.gerado||'').slice(0,10),null);
  alert('Backup restaurado.');S.dsOk=false;load();
}

/* ===== js/relatorio.js ===== */
/* Telas: Relatório (mês, funcionário e período) */
function detalhe(x){
  const e=x.e,flex=e.tipo==='flexivel',L=[];
  L.push(kv('Horas trabalhadas',fh(x.trab)),kv('Previstas na escala',fh(x.prev)));
  if(x.falt>0)L.push(kv('Descontadas por faltas','−'+fh(x.falt)));
  if(x.cobH>0)L.push(kv('Somadas por coberturas','+'+fh(x.cobH)));
  L.push(kv(flex?'Dias trabalhados':'Dias escalados',x.dias.length));
  if(flex&&x.dias.length)L.push(kv('Registros',x.dias.map(d=>`${dm(d.k)} ${d.t.en}–${d.t.sa}`).join('<br>')));
  if(!flex&&x.sabs.length)L.push(kv('Sábados',x.sabs.map(s=>`${dm(s.k)} ${s.t.en}–${s.t.sa}`).join('<br>')));
  if(x.fe.length)L.push(kv('Faltas',x.fe.map(f=>`${dm(f.data)} ${esc(f.motivo)}${f.atestado?' (atestado)':''}`).join('<br>')));
  if(x.cob.length)L.push(kv('Coberturas feitas',x.cob.map(c=>`${dm(c.k)} cobriu ${esc(c.quem)} (${fh(c.h)})`).join('<br>')));
  if(x.devMes>0||x.pendTotal>0)L.push(kv('Horas devendo',`${fh(x.devMes)} no período<br>${fh(x.pendTotal)} pendentes no total`));
  if(x.saldo!==0||x.movs.length)L.push(kv('Saldo de folgas',fd(x.saldo)+(x.movs.length?'<br>'+x.movs.map(m=>`${dm(m.data)} ${m.tipo==='credito'?'+':'-'}${fn(+m.dias)}${m.anotacao?' '+esc(m.anotacao):''}`).join('<br>'):'')));
  return `<details class="card"><summary><div class="av">${esc((e.nome[0]||'?').toUpperCase())}</div><div class="grow"><b>${esc(e.nome)}</b><br><small>${fh(x.trab)} trabalhadas · ${x.fe.length} falta(s)</small></div>${ic('chev')}</summary>${L.join('')}</details>`;
}
const notaRel=D=>`<p class="mut"><small>Horas contadas da entrada até a saída, sem descontar intervalo. Feriados só contam para quem foi escalado neles.</small></p>`;
function faltasCard(D){
  return `<div class="card"><b>Faltas e coberturas</b>${D.fm.map(f=>`<div style="padding:10px 0;border-top:1px solid var(--line)"><div class="row" style="margin:0"><b class="grow">${esc(nome(f.funcionario_id))} · ${fmt(f.data)}</b><span class="tag ${f.atestado?'ok':'bad'}">${f.atestado?'Com atestado':'Sem atestado'}</span></div><small>${esc(f.motivo)}${+f.horas_devidas>0?` · deve ${fh(+f.horas_devidas)} (${f.horas_quitadas?'quitadas':'pendentes'})`:''}${f.cobertura_id?` · coberto por ${esc(nome(f.cobertura_id))}`:' · sem cobertura'}</small>${f.observacao?`<br><small>${esc(f.observacao)}</small>`:''}${(f.anexos||[]).length?`<br><button class="ghost sm" data-ax="${f.id}" style="margin-top:6px">Ver anexos (${f.anexos.length})</button>`:''}</div>`).join('')||'<p class="mut">Nenhuma falta neste período.</p>'}</div>`;
}
function ferCard(D){
  if(!D.ferEsc||!D.ferEsc.length)return '';
  const tg={vazio:['gr','A definir'],especial:['ok','Escalado'],fechado:['bad','Fechado']};
  return `<div class="card"><b>Feriados</b>${D.ferEsc.map(f=>{const [c,t]=tg[f.modo];return `<div style="padding:10px 0;border-top:1px solid var(--line)"><div class="row" style="margin:0"><b class="grow">${fmt(f.k)} · ${esc(f.n)}</b><span class="tag ${c}">${t}</span></div>${f.modo==='fechado'?'<small class="mut">Ninguém trabalha.</small>':f.itens.map(i=>kv(esc(i.nome)+(i.falta?' · faltou':''),`${i.en}–${i.sa} · ${fh(i.h)}`)).join('')||'<small class="mut">Ninguém escalado.</small>'}</div>`}).join('')}</div>`;
}
const notaCard=D=>`<div class="card"><div class="row" style="margin:0"><b class="grow" style="margin:0">Anotações</b><button class="ghost sm" data-nr="1">${D.nota?'Editar':'Escrever'}</button></div>${D.nota?`<div class="note" style="margin-top:8px">${esc(D.nota)}</div>`:'<small class="mut">Escreva aqui o que quiser. Aparece no PDF e no texto do relatório.</small>'}</div>`;
const saldoCard=x=>`<div class="card"><b>Saldo de folgas</b>${x.movs.map(m=>kv(`${dm(m.data)} · ${m.tipo==='credito'?'recebida':'usada'}`,`${m.tipo==='credito'?'+':'-'}${fn(+m.dias)}`+(m.anotacao?`<br><small>${esc(m.anotacao)}</small>`:''))).join('')}${kv('Saldo atual',fd(x.saldo))}</div>`;
function corpoEquipe(D){
  return `<div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat tint t4"><b>${D.tot.faltas}</b>faltas sem atestado</div><div class="stat tint t1"><b>${D.tot.atest}</b>atestados</div><div class="stat tint t2"><b>${D.tot.cob}</b>coberturas</div><div class="stat tint t3"><b>${fh(D.tot.pend)}</b>horas devidas pendentes</div></div>
  <div class="card"><b>Sábados</b>${D.sab.map(s=>`<div style="padding:10px 0;border-top:1px solid var(--line)"><b>${fmt(s.k)}</b>${s.itens.map(i=>kv(esc(i.nome)+(i.falta?' · faltou':''),`${i.en}–${i.sa} · ${fh(i.h)}`)).join('')||'<br><small class="mut">Ninguém escalado.</small>'}</div>`).join('')||'<p class="mut">Nenhum sábado neste período.</p>'}</div>
  ${ferCard(D)}${faltasCard(D)}<b style="display:block;margin:4px 6px 8px">Por funcionário</b>${D.func.map(detalhe).join('')||'<div class="card mut">Nenhum funcionário.</div>'}${notaRel(D)}`;
}
function corpoFunc(D){
  const x=D.func[0];if(!x)return '<div class="card mut">Sem dados deste funcionário no período.</div>';
  const rows=diaria(x);
  return `<div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat tint t1"><b>${diasTrab(x)}</b>dias trabalhados</div><div class="stat tint t2"><b>${fh(x.trab)}</b>horas trabalhadas</div><div class="stat tint t4"><b>${x.fe.length}</b>faltas</div><div class="stat tint t3"><b>${fh(x.pendTotal)}</b>horas devendo</div></div>
  <div class="card tint soft t2"><b>${esc(x.e.nome)} · dia a dia</b>${rows.map(r=>kv(`${dm(r.k)} ${DIAS[parse(r.k).getDay()]}`,esc(r.txt))).join('')||'<p class="mut">Nenhum dia neste período.</p>'}${kv('Total',`${diasTrab(x)} dias · ${fh(x.trab)}`)}</div>
  ${(x.saldo!==0||x.movs.length)?saldoCard(x):''}${D.fm.length?faltasCard(D):''}${notaRel(D)}`;
}
const nomeArq=D=>{const x=D.empId&&D.func[0];return `Relatorio_${slug(x?x.e.nome:'equipe')}_${D.de}_a_${D.ate}`};
function escolheQuem(acao,label){
  const at=S.emps.filter(e=>e.ativo),sel=(DS.sabSel||at.filter(e=>e.tipo!=='flexivel').map(e=>e.id)).filter(id=>at.some(e=>e.id===id));
  if(!at.length)return alert('Cadastre funcionários primeiro.');
  modal('Quem aparece na escala',`<p class="mut" style="margin-top:0"><small>Marque as pessoas que entram no arquivo (ex.: só os professores).</small></p>${at.map(e=>`<label style="color:var(--ink);display:flex;align-items:center;margin:10px 0;font-size:15px"><input type="checkbox" name="q_${e.id}" ${sel.includes(e.id)?'checked':''}>${esc(e.nome)}${e.tipo==='flexivel'?' <small style="margin-left:6px">(flexível)</small>':''}</label>`).join('')}`,async d=>{
    const ids=at.filter(e=>d.querySelector(`[name="q_${e.id}"]`).checked).map(e=>e.id);
    if(!ids.length)throw Error('Marque pelo menos uma pessoa.');
    DS.sabSel=ids;salvarDS();await acao(ids);
  },label);
}
async function copiarRel(D){const t=textoRel(D);try{await navigator.clipboard.writeText(t);alert('Relatório copiado.')}catch{prompt('Copie o texto:',t)}}
const botoesRel=()=>`<div class="row"><button class="grow" id="pdf">Baixar PDF</button><button class="ghost grow" id="cp">Copiar texto</button><button class="ghost grow" id="csv">CSV</button></div>`;
function ligaRel(getD){
  $('#pdf').onclick=()=>baixarPDF(getD());$('#cp').onclick=()=>copiarRel(getD());$('#csv').onclick=()=>csvRel(getD());
  document.querySelectorAll('[data-ax]').forEach(b=>b.onclick=()=>verAnexos(S.faltas.find(f=>f.id===b.dataset.ax)));
  document.querySelectorAll('[data-nr]').forEach(b=>b.onclick=()=>editaNota(getD().chave,'Anotações do relatório'));
}

// Relatório do mês (equipe inteira)
function vResumo(){
  const D=relDados(...mesRange(S.month));
  return `<div class="card" style="padding:10px"><input type="month" id="mm" value="${S.month}"></div>
  <button class="ghost" id="rp" style="width:100%;margin-bottom:12px">Relatório por funcionário ou período</button>${botoesRel()}${notaCard(D)}${corpoEquipe(D)}`;
}
bind.resumo=()=>{
  $('#mm').onchange=e=>{S.month=e.target.value||S.month;render()};
  $('#rp').onclick=()=>{S.rp.emp='';setMes(0);S.tab='relper';render()};
  ligaRel(()=>relDados(...mesRange(S.month)));
};

// Relatório por funcionário e período (ex.: semana da limpeza)
const perD=()=>{const r=S.rp;return r.de&&r.ate&&r.de<=r.ate?relDados(r.de,r.ate,r.emp||null):null};
function vRelPer(){
  const r=S.rp,D=perD(),lista=[['','Toda a equipe'],...S.emps.map(e=>[e.id,e.nome+(e.ativo?'':' (inativo)')])];
  return `<div class="card"><label>Funcionário<select id="rpe">${opts(lista,r.emp)}</select></label>
  <div class="row"><label class="grow">De<input type="date" id="rpd" value="${r.de}"></label><label class="grow">Até<input type="date" id="rpa" value="${r.ate}"></label></div>
  <div class="row"><button class="ghost sm" data-w="0">Esta semana</button><button class="ghost sm" data-w="-1">Semana passada</button><button class="ghost sm" data-m="0">Este mês</button><button class="ghost sm" data-m="-1">Mês passado</button></div></div>
  ${D?botoesRel()+notaCard(D)+(D.empId?corpoFunc(D):corpoEquipe(D)):'<div class="card mut">A data inicial precisa ser antes da data final.</div>'}`;
}
bind.relper=()=>{
  const r=S.rp;
  $('#rpe').onchange=e=>{r.emp=e.target.value;render()};
  $('#rpd').onchange=e=>{r.de=e.target.value||r.de;render()};
  $('#rpa').onchange=e=>{r.ate=e.target.value||r.ate;render()};
  document.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{setSemana(+b.dataset.w);render()});
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{setMes(+b.dataset.m);render()});
  if(perD())ligaRel(perD);
};

/* ===== js/textos.js ===== */
/* Textos para copiar (WhatsApp) das escalas e relatórios */
function linhasRel(D){
  const x=D.empId&&D.func[0],t=D.tot,L=[`## RELATÓRIO ${x?'DE '+x.e.nome.toUpperCase():'DA EQUIPE'} — ${rotulo(D.de,D.ate)}`,''];
  if(D.empId&&!x)L.push('Sem dados deste funcionário no período.');
  else if(x){
    L.push(`Dias trabalhados: ${diasTrab(x)} | Horas trabalhadas: ${fh(x.trab)} | Faltas: ${x.fe.length} | Horas devendo: ${fh(x.pendTotal)}`,'','## DIA A DIA');
    const rows=diaria(x);if(!rows.length)L.push('Nenhum dia no período.');
    rows.forEach(r=>L.push(`${fmt(r.k)} ${DIAS[parse(r.k).getDay()]}: ${r.txt}`));
    L.push('',`TOTAL: ${diasTrab(x)} dias, ${fh(x.trab)}`);
  }else{
    L.push(`Faltas sem atestado: ${t.faltas} | Atestados: ${t.atest} | Coberturas: ${t.cob} | Horas devidas pendentes: ${fh(t.pend)}`,'','## SÁBADOS');
    D.sab.forEach(s=>L.push(`${fmt(s.k)}: `+(s.itens.map(i=>`${i.nome} ${i.en}-${i.sa} (${fh(i.h)})${i.falta?' FALTOU':''}`).join('; ')||'ninguém escalado')));
    if(D.ferEsc&&D.ferEsc.length){L.push('','## FERIADOS');D.ferEsc.forEach(f=>L.push(`${fmt(f.k)} ${f.n} (${f.modo==='fechado'?'fechado':f.modo==='especial'?'escalado':'a definir'}): `+(f.modo==='fechado'?'ninguém trabalha':(f.itens.map(i=>`${i.nome} ${i.en}-${i.sa} (${fh(i.h)})`).join('; ')||'ninguém escalado'))))}
  }
  L.push('','## FALTAS E COBERTURAS');
  if(!D.fm.length)L.push('Nenhuma falta no período.');
  D.fm.forEach(f=>L.push(`${fmt(f.data)} — ${nome(f.funcionario_id)}: ${f.motivo}${f.atestado?' (com atestado)':' (sem atestado)'}${+f.horas_devidas>0?`, deve ${fh(+f.horas_devidas)}${f.horas_quitadas?' (quitadas)':' (pendentes)'}`:''}${f.cobertura_id?`, coberto por ${nome(f.cobertura_id)}`:', sem cobertura'}${f.observacao?` — ${f.observacao}`:''}`));
  if(!D.empId){L.push('','## POR FUNCIONÁRIO');D.func.forEach(y=>L.push(`${y.e.nome}: ${fh(y.trab)} trabalhadas (previstas ${fh(y.prev)}${y.falt>0?`, -${fh(y.falt)} por faltas`:''}${y.cobH>0?`, +${fh(y.cobH)} por coberturas`:''}) | ${y.dias.length} dias | ${y.fe.length} falta(s) | devendo ${fh(y.pendTotal)}`))}
  const sd=D.func.filter(y=>y.saldo!==0||y.movs.length);
  if(sd.length){L.push('','## SALDO DE FOLGAS');sd.forEach(y=>{L.push(`${y.e.nome}: saldo ${fd(y.saldo)}`);y.movs.forEach(m=>L.push(`  ${fmt(m.data)} ${m.tipo==='credito'?'+':'-'}${fn(+m.dias)}${m.anotacao?' - '+m.anotacao:''}`))})}
  if(D.nota)L.push('','## ANOTAÇÕES',D.nota);
  L.push('','Horas contadas da entrada até a saída, sem descontar intervalo.');
  return L;
}
const textoRel=D=>linhasRel(D).map(l=>l.replace(/^## /,'')).join('\n');
const difer=it=>it.length>1&&it[0].en!==it[it.length-1].en;
function textoSabados(ym,ids){
  const [de,ate]=mesRange(ym),D=relDados(de,ate),L=['ESCALA DOS SÁBADOS - '+mesNome(ym).toUpperCase(),''];
  D.sab.forEach(s=>{const it=s.itens.filter(i=>ids.includes(i.id));L.push('Sábado '+dm(s.k));if(!it.length)L.push('  sem escala definida');it.forEach((i,n)=>L.push(`  ${i.en} às ${i.sa} - ${i.nome}${difer(it)?(n===0?' (abre)':n===it.length-1?' (fecha)':''):''}`));if(nota('sab:'+s.k))L.push('  Obs.: '+nota('sab:'+s.k));L.push('')});
  return L.join('\n').trim();
}
function textoFeriados(ym,ids,only){
  const [de,ate]=mesRange(ym),D=relDados(de,ate),L=[only?'ESCALA DO FERIADO':'ESCALA DOS FERIADOS - '+mesNome(ym).toUpperCase(),''];
  if(!D.ferEsc.length)L.push('Nenhum feriado neste mês.');
  D.ferEsc.filter(f=>!only||f.k===only).forEach(f=>{const it=f.itens.filter(i=>ids.includes(i.id));L.push(`${fmt(f.k)} ${DIAS[parse(f.k).getDay()]} - ${f.n}`);
    if(f.modo==='fechado')L.push('  FECHADO - ninguém trabalha');
    else{if(!it.length)L.push('  sem escala definida');it.forEach((i,n)=>L.push(`  ${i.en} às ${i.sa} - ${i.nome}${difer(it)?(n===0?' (abre)':n===it.length-1?' (fecha)':''):''}`))}
    if(nota('fer:'+f.k))L.push('  Obs.: '+nota('fer:'+f.k));
    L.push('')});
  return L.join('\n').trim();
}

/* ===== js/pdf.js ===== */
/* Geração de PDF e CSV */
function pdfCtx(doc){
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  return {hex,W:210,PH:297,M:14,CW:182,
    K:{ink:[28,34,44],mut:[107,114,128],line:[226,229,234],zebra:[247,248,250],head:[238,240,244],pri:hex(DS.cores.pri),dark:[11,14,17],white:[255,255,255],ok:[22,163,74],okb:[220,252,231],bad:[220,38,38],badb:[254,226,226],info:[37,99,235],infob:[219,234,254],warn:[217,119,6],warnb:[254,243,199],gr:[75,85,99],grb:[229,231,235]},
    L:t=>String(t==null?'':t).replace(/[–—−]/g,'-').replace(/[^\x00-\xFF]/g,''),
    F:c=>doc.setFillColor(...c),T:c=>doc.setTextColor(...c),S:c=>doc.setDrawColor(...c),
    ft:(sz,b)=>{doc.setFont('helvetica',b?'bold':'normal');doc.setFontSize(sz)}};
}
function cabecalhoPDF(doc,c,kicker,titulo,sub){
  const {K,F,T,ft,L,hex,W,M}=c,claro=DS.relTema==='claro',fg=claro?K.ink:K.white;
  F(claro?[243,244,246]:K.dark);doc.rect(0,0,W,36,'F');F(K.pri);doc.rect(0,36,W,1.6,'F');
  ft(8,true);T(K.pri);doc.text(L(kicker),M,12);
  ft(19,true);T(fg);doc.text(L(titulo),M,22);
  ft(10,false);T(claro?K.mut:[190,196,205]);doc.text(L(sub),M,30);
  try{
    const lg=DS.logoRel&&DS.logoRelInfo?{u:DS.logoRel,i:DS.logoRelInfo}:(DS.logo&&DS.logoInfo?{u:DS.logo,i:DS.logoInfo}:null);
    if(lg){const r=lg.i.w/lg.i.h;let h=20,w=h*r;if(w>60){w=60;h=w/r}doc.addImage(lg.u,'PNG',W-M-w,(36-h)/2,w,h)}
    else if(DS.nome){const p=DS.nome.trim().split(/\s+/),l1=p.shift()||'',l2=p.join(' ');ft(12,true);T(fg);doc.text(L(l1.toUpperCase()),W-M,13,{align:'right'});if(l2)doc.text(L(l2.toUpperCase()),W-M,19.5,{align:'right'});
      if(DS.sub){ft(7,true);const bw=doc.getTextWidth(L(DS.sub.toUpperCase()))+8,by=l2?22.5:16;F(hex('#F7B932'));doc.roundedRect(W-M-bw,by,bw,5,0.8,0.8,'F');T(K.white);doc.text(L(DS.sub.toUpperCase()),W-M-bw/2,by+3.5,{align:'center'})}}
  }catch(e){}
}
function baixarSabadosPDF(ym,ids){
  const J=window.jspdf&&window.jspdf.jsPDF;
  if(!J){alert('Não consegui carregar o gerador de PDF (precisa de internet). Tente de novo com internet.');return}
  const doc=new J({unit:'mm',format:'a4'}),c=pdfCtx(doc),{K,F,T,S,ft,L,hex,W,PH,M,CW}=c;
  cabecalhoPDF(doc,c,'ESCALA DOS SÁBADOS',mesNome(ym),'Gerado em '+new Date().toLocaleDateString('pt-BR'));
  const [de,ate]=mesRange(ym),D=relDados(de,ate),fer={};D.fer.forEach(f=>fer[f.k]=f.n);
  const onp=lum(DS.cores.pri)>.62?K.ink:K.white;let y=47;
  const pill=(px,py,t,fg,bg)=>{ft(7.5,true);const w=doc.getTextWidth(L(t))+6;F(bg);doc.roundedRect(px,py-3.9,w,5.4,2.7,2.7,'F');T(fg);doc.text(L(t),px+3,py);return w};
  D.sab.forEach(s=>{
    const it=s.itens.filter(i=>ids.includes(i.id)),n=Math.max(1,it.length),rh=Math.max(28,10+n*10),nt=nota('sab:'+s.k),nl=(ft(8,false),nt?doc.splitTextToSize(L(nt),CW-34-16):[]),h=rh+(nl.length?nl.length*3.8+2:0);
    if(y+h>PH-18){doc.addPage();y=M}
    F(K.white);S(K.line);doc.setLineWidth(.3);doc.roundedRect(M,y,CW,h,3,3,'FD');
    F(K.pri);doc.roundedRect(M,y,34,h,3,3,'F');doc.rect(M+20,y,14,h,'F');
    const [yy,mm,dd]=s.k.split('-').map(Number),cy=y+rh/2;
    T(onp);ft(7.5,true);doc.text(L('SÁBADO'),M+17,cy-7.5,{align:'center'});
    ft(24,true);doc.text(String(dd),M+17,cy+3,{align:'center'});
    ft(8.5,true);doc.text(L(new Date(yy,mm-1,dd).toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()),M+17,cy+9,{align:'center'});
    const rx=M+34+8;
    if(fer[s.k]){ft(7.5,true);const hw=doc.getTextWidth(L(fer[s.k]))+6;pill(M+CW-hw-4,y+6.5,fer[s.k],K.warn,K.warnb)}
    if(!it.length){ft(10.5,false);T(K.mut);doc.text('Sem escala definida',rx,cy+1.2)}
    it.forEach((i,k)=>{
      const base=y+(rh-n*10)/2+7+k*10;
      ft(12,true);T(K.ink);doc.text(L(i.en+' - '+i.sa),rx,base);
      ft(12,false);let nm=L(i.nome);const mw=CW-34-8-44-34;while(nm.length>1&&doc.getTextWidth(nm)>mw)nm=nm.slice(0,-1);doc.text(nm,rx+44,base);
      if(difer(it)&&(k===0||k===it.length-1)){const lab=k===0?'Abre':'Fecha';ft(7.5,true);const pw=doc.getTextWidth(lab)+6;pill(M+CW-pw-4,base,lab,k===0?K.ok:K.info,k===0?K.okb:K.infob)}
    });
    if(nl.length){ft(8,false);T(K.mut);nl.forEach((t,i)=>doc.text(t,rx,y+rh-2+i*3.8))}
    y+=h+5;
  });
  const nn=doc.getNumberOfPages();
  for(let i=1;i<=nn;i++){doc.setPage(i);S(K.line);doc.setLineWidth(.3);doc.line(M,PH-12,W-M,PH-12);ft(7.5,false);T(K.mut);doc.text('Escala dos sábados',M,PH-7.5);doc.text(L('Página '+i+' de '+nn),W-M,PH-7.5,{align:'right'})}
  doc.save('Escala_Sabados_'+ym+'.pdf');
}
function baixarFeriadosPDF(ym,ids,only){
  const J=window.jspdf&&window.jspdf.jsPDF;
  if(!J){alert('Não consegui carregar o gerador de PDF (precisa de internet). Tente de novo com internet.');return}
  const [de,ate]=mesRange(ym),D=relDados(de,ate);
  const lista=D.ferEsc.filter(f=>!only||f.k===only);
  if(!lista.length)return alert('Não há feriados neste mês.');
  if(only&&lista[0].modo!=='fechado'&&!lista[0].itens.some(i=>ids.includes(i.id)))return alert('Esse feriado ainda não tem ninguém escalado (entre as pessoas escolhidas para os PDFs). Monte a escala antes de baixar.');
  const doc=new J({unit:'mm',format:'a4'}),c=pdfCtx(doc),{K,F,T,S,ft,L,W,PH,M,CW}=c;
  cabecalhoPDF(doc,c,only?'ESCALA DO FERIADO':'ESCALA DOS FERIADOS',only?lista[0].n:mesNome(ym),(only?fmt(only)+'   ·   ':'')+'Gerado em '+new Date().toLocaleDateString('pt-BR'));
  const onp=lum(DS.cores.pri)>.62?K.ink:K.white,SEM=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];let y=47;
  const pill=(px,py,t,fg,bg)=>{ft(7.5,true);const w=doc.getTextWidth(L(t))+6;F(bg);doc.roundedRect(px,py-3.9,w,5.4,2.7,2.7,'F');T(fg);doc.text(L(t),px+3,py);return w};
  lista.forEach(f=>{
    const it=f.itens.filter(i=>ids.includes(i.id)),fech=f.modo==='fechado',n=Math.max(1,fech?1:it.length),rh=Math.max(32,20+n*10),nt=nota('fer:'+f.k),nl=(ft(8,false),nt?doc.splitTextToSize(L(nt),CW-34-16):[]),h=rh+(nl.length?nl.length*3.8+2:0);
    if(y+h>PH-18){doc.addPage();y=M}
    F(K.white);S(K.line);doc.setLineWidth(.3);doc.roundedRect(M,y,CW,h,3,3,'FD');
    F(K.pri);doc.roundedRect(M,y,34,h,3,3,'F');doc.rect(M+20,y,14,h,'F');
    const [yy,mm,dd]=f.k.split('-').map(Number),cy=y+rh/2;
    T(onp);ft(7.5,true);doc.text(L(SEM[new Date(yy,mm-1,dd).getDay()]),M+17,cy-7.5,{align:'center'});
    ft(24,true);doc.text(String(dd),M+17,cy+3,{align:'center'});
    ft(8.5,true);doc.text(L(new Date(yy,mm-1,dd).toLocaleDateString('pt-BR',{month:'short'}).replace('.','').toUpperCase()),M+17,cy+9,{align:'center'});
    const rx=M+34+8,lab=fech?'Fechado':f.modo==='especial'?'Escalado':'A definir',fg=fech?K.bad:f.modo==='especial'?K.ok:K.gr,bg=fech?K.badb:f.modo==='especial'?K.okb:K.grb;
    ft(7.5,true);const pw=doc.getTextWidth(L(lab))+6;pill(M+CW-pw-4,y+8,lab,fg,bg);
    ft(11,true);T(K.ink);let nm=L(f.n);const mw=CW-34-8-pw-12;while(nm.length>1&&doc.getTextWidth(nm)>mw)nm=nm.slice(0,-1);doc.text(nm,rx,y+8);
    if(fech){ft(10.5,true);T(K.bad);doc.text('Fechado - ninguém trabalha',rx,y+20)}
    else if(!it.length){ft(10.5,false);T(K.mut);doc.text('Sem escala definida',rx,y+20)}
    else it.forEach((i,k)=>{
      const base=y+19+k*10;
      ft(12,true);T(K.ink);doc.text(L(i.en+' - '+i.sa),rx,base);
      ft(12,false);let nn=L(i.nome);const m2=CW-34-8-44-34;while(nn.length>1&&doc.getTextWidth(nn)>m2)nn=nn.slice(0,-1);doc.text(nn,rx+44,base);
      if(difer(it)&&(k===0||k===it.length-1)){const lb=k===0?'Abre':'Fecha';ft(7.5,true);const p2=doc.getTextWidth(lb)+6;pill(M+CW-p2-4,base,lb,k===0?K.ok:K.info,k===0?K.okb:K.infob)}
    });
    if(nl.length){ft(8,false);T(K.mut);nl.forEach((t,i)=>doc.text(t,rx,y+rh-2+i*3.8))}
    y+=h+5;
  });
  const nn=doc.getNumberOfPages();
  for(let i=1;i<=nn;i++){doc.setPage(i);S(K.line);doc.setLineWidth(.3);doc.line(M,PH-12,W-M,PH-12);ft(7.5,false);T(K.mut);doc.text('Escala dos feriados',M,PH-7.5);doc.text(L('Página '+i+' de '+nn),W-M,PH-7.5,{align:'right'})}
  doc.save(only?'Escala_Feriado_'+only+'.pdf':'Escala_Feriados_'+ym+'.pdf');
}
function baixarPDF(D){
  const J=window.jspdf&&window.jspdf.jsPDF;
  if(!J){alert('Não consegui carregar o gerador de PDF (precisa de internet). Vou abrir a impressão: escolha "Salvar como PDF".');document.querySelectorAll('details').forEach(d=>d.open=true);window.print();return}
  const doc=new J({unit:'mm',format:'a4'}),W=210,PH=297,M=14,CW=W-2*M,x=D.empId&&D.func[0];
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const K={ink:[28,34,44],mut:[107,114,128],line:[226,229,234],zebra:[247,248,250],head:[238,240,244],pri:hex(DS.cores.pri),dark:[11,14,17],white:[255,255,255],
    ok:[22,163,74],okb:[220,252,231],bad:[220,38,38],badb:[254,226,226],info:[37,99,235],infob:[219,234,254],warn:[217,119,6],warnb:[254,243,199],gr:[75,85,99],grb:[229,231,235]};
  const L=t=>String(t==null?'':t).replace(/[–—−]/g,'-').replace(/[^\x00-\xFF]/g,'');
  const F=c=>doc.setFillColor(...c),T=c=>doc.setTextColor(...c),S=c=>doc.setDrawColor(...c);
  const ft=(sz,b)=>{doc.setFont('helvetica',b?'bold':'normal');doc.setFontSize(sz)};
  let y=M;
  const ensure=h=>{if(y+h>PH-16){doc.addPage();y=M}};
  cabecalhoPDF(doc,{K,F,T,ft,L,hex,W,M},'RELATÓRIO',x?x.e.nome:'Equipe','Período: '+rotulo(D.de,D.ate)+'   ·   gerado em '+new Date().toLocaleDateString('pt-BR'));
  y=47;
  const kpis=items=>{const n=items.length,g=4,w=(CW-g*(n-1))/n,h=25;ensure(h+6);
    items.forEach((it,i)=>{const bx=M+i*(w+g);F(K.white);S(K.line);doc.setLineWidth(.3);doc.roundedRect(bx,y,w,h,2.5,2.5,'FD');F(it.c);doc.roundedRect(bx,y,w,2.4,1.2,1.2,'F');
      ft(18,true);T(it.c);doc.text(L(it.n),bx+w/2,y+14,{align:'center'});ft(7.5,false);T(K.mut);doc.splitTextToSize(L(it.l),w-4).slice(0,2).forEach((t,j)=>doc.text(t,bx+w/2,y+19+j*3.4,{align:'center'}))});
    y+=h+9;if(D.nota)y=pdfNotaBox(doc,{K,F,T,S,ft,L,M,CW,PH},y,D.nota)};
  const secao=t=>{ensure(18);F(K.pri);doc.roundedRect(M,y,2.2,6.5,1,1,'F');ft(12,true);T(K.ink);doc.text(L(t),M+5,y+5);y+=11};
  const pill=(px,py,t,fg,bg)=>{ft(7.5,true);const w=doc.getTextWidth(L(t))+6;F(bg);doc.roundedRect(px,py-3.9,w,5.4,2.7,2.7,'F');T(fg);doc.text(L(t),px+3,py);return w};
  const tabela=(cols,rows)=>{
    const rh=7.4,hh=8;
    const cab=()=>{F(K.head);doc.rect(M,y,CW,hh,'F');ft(7.5,true);T(K.mut);let cx=M;cols.forEach(c=>{doc.text(L(c.t).toUpperCase(),c.al==='r'?cx+c.w-3:cx+3,y+5.3,{align:c.al==='r'?'right':'left'});cx+=c.w});y+=hh};
    ensure(hh+rh*2);cab();
    rows.forEach((r,i)=>{
      if(y+rh>PH-16){doc.addPage();y=M;cab()}
      if(i%2){F(K.zebra);doc.rect(M,y,CW,rh,'F')}
      if(r.top){S(K.line);doc.setLineWidth(.4);doc.line(M,y,M+CW,y)}
      let cx=M;
      r.c.forEach((cell,j)=>{const col=cols[j],o=(cell&&typeof cell==='object')?cell:{t:cell};
        ft(8.5,!!o.b);T(o.k||K.ink);let t=L(o.t);const mw=col.w-6;
        if(doc.getTextWidth(t)>mw){while(t.length>1&&doc.getTextWidth(t+'...')>mw)t=t.slice(0,-1);t+='...'}
        doc.text(t,col.al==='r'?cx+col.w-3:cx+3,y+5,{align:col.al==='r'?'right':'left'});cx+=col.w});
      y+=rh});
    S(K.line);doc.setLineWidth(.3);doc.line(M,y,M+CW,y);y+=9};
  const cartoes=fm=>fm.forEach(f=>{
    ft(8,false);const obs=f.observacao?doc.splitTextToSize(L(f.observacao),CW-14):[],h=23+obs.length*3.8+(obs.length?1.5:0),cor=f.atestado?K.ok:K.bad;
    ensure(h+4);F(K.white);S(K.line);doc.setLineWidth(.3);doc.roundedRect(M,y,CW,h,2.5,2.5,'FD');F(cor);doc.roundedRect(M,y,2.8,h,1.4,1.4,'F');
    ft(10.5,true);T(K.ink);doc.text(L(nome(f.funcionario_id)),M+7,y+6.5);
    ft(7.5,true);const lab=f.atestado?'Com atestado':'Sem atestado',pw=doc.getTextWidth(L(lab))+6;pill(M+CW-pw-4,y+6.5,lab,cor,f.atestado?K.okb:K.badb);
    ft(8.5,false);T(K.mut);doc.text(L(fmt(f.data)+'   ·   '+f.motivo),M+7,y+12.2);
    let px=M+7;const py=y+18.6;
    px+=pill(px,py,f.cobertura_id?'Coberto por '+nome(f.cobertura_id):'Sem cobertura',f.cobertura_id?K.ok:K.gr,f.cobertura_id?K.okb:K.grb)+2;
    if(+f.horas_devidas>0)px+=pill(px,py,'Deve '+fh(+f.horas_devidas)+(f.horas_quitadas?' (quitadas)':' (pendentes)'),K.warn,K.warnb)+2;
    if((f.anexos||[]).length)pill(px,py,f.anexos.length+' anexo(s)',K.info,K.infob);
    if(obs.length){ft(8,false);T(K.mut);obs.forEach((t,i)=>doc.text(t,M+7,y+25.2+i*3.8))}
    y+=h+4});
  if(D.empId&&!x){ft(11,false);T(K.mut);doc.text('Sem dados deste funcionário no período.',M,y);y+=10}
  else if(x){
    kpis([{n:diasTrab(x),l:'dias trabalhados',c:K.ok},{n:fh(x.trab),l:'horas trabalhadas',c:K.info},{n:x.fe.length,l:'faltas',c:K.bad},{n:fh(x.pendTotal),l:'horas devendo',c:K.warn}]);
    secao('Dia a dia');
    const rows=diaria(x).map(r=>{const bad=/^Falt/.test(r.txt),cob=/^Cobriu/.test(r.txt);return {c:[fmt(r.k),DIAS[parse(r.k).getDay()],{t:r.txt,k:bad?K.bad:cob?K.ok:K.ink,b:bad||cob},{t:bad?'-':fh(r.h),b:true}]}});
    tabela([{t:'Data',w:30},{t:'Dia',w:20},{t:'Situação',w:96},{t:'Horas',w:36,al:'r'}],rows.length?rows:[{c:['','','Nenhum dia no período.','']}]);
    ensure(14);F(K.dark);doc.roundedRect(M,y-4,CW,10,2,2,'F');ft(9.5,true);T(K.white);doc.text('TOTAL DO PERÍODO',M+5,y+2.3);doc.text(L(diasTrab(x)+' dias   ·   '+fh(x.trab)),M+CW-5,y+2.3,{align:'right'});y+=16;
    if(x.saldo!==0||x.movs.length){secao('Saldo de folgas');tabela([{t:'Data',w:30},{t:'Tipo',w:36},{t:'Dias',w:24,al:'r'},{t:'Anotação',w:92}],[...x.movs.map(m=>({c:[fmt(m.data),m.tipo==='credito'?'Folga recebida':'Folga usada',{t:(m.tipo==='credito'?'+':'-')+fn(+m.dias),b:true,k:m.tipo==='credito'?K.ok:K.warn},m.anotacao||'']})),{c:[{t:'Saldo atual',b:true},'',{t:fd(x.saldo),b:true},'']}])}
  }else{
    const t=D.tot;kpis([{n:t.faltas,l:'faltas sem atestado',c:K.bad},{n:t.atest,l:'atestados',c:K.ok},{n:t.cob,l:'coberturas',c:K.info},{n:fh(t.pend),l:'horas devidas pendentes',c:K.warn}]);
    secao('Sábados');
    const rows=[];D.sab.forEach(s=>{if(!s.itens.length)rows.push({top:true,c:[fmt(s.k),{t:'Ninguém escalado',k:K.mut},'','']});else s.itens.forEach((i,n)=>rows.push({top:n===0,c:[n===0?{t:fmt(s.k),b:true}:'',{t:i.nome+(i.falta?'  (faltou)':''),k:i.falta?K.bad:K.ink,b:i.falta},i.en+' - '+i.sa,{t:fh(i.h),b:true}]}))});
    tabela([{t:'Sábado',w:34},{t:'Funcionário',w:72},{t:'Horário',w:46},{t:'Horas',w:30,al:'r'}],rows.length?rows:[{c:['','Nenhum sábado no período.','','']}]);
    if(D.ferEsc.length){secao('Feriados');const fr=[];D.ferEsc.forEach(f=>{const lb=f.modo==='fechado'?' (fechado)':f.modo==='vazio'?' (a definir)':'';
      if(f.modo==='fechado'||!f.itens.length)fr.push({top:true,c:[{t:fmt(f.k),b:true},f.n+lb,{t:f.modo==='fechado'?'Ninguém trabalha':'Ninguém escalado',k:f.modo==='fechado'?K.bad:K.mut},'','']});
      else f.itens.forEach((i,n)=>fr.push({top:n===0,c:[n===0?{t:fmt(f.k),b:true}:'',n===0?f.n+lb:'',{t:i.nome+(i.falta?'  (faltou)':''),k:i.falta?K.bad:K.ink,b:i.falta},i.en+' - '+i.sa,{t:fh(i.h),b:true}]}))});
      tabela([{t:'Data',w:26},{t:'Feriado',w:50},{t:'Funcionário',w:46},{t:'Horário',w:34},{t:'Horas',w:26,al:'r'}],fr)}
  }
  secao('Faltas e coberturas');
  if(!D.fm.length){ft(9.5,false);T(K.mut);doc.text('Nenhuma falta neste período.',M,y);y+=10}else cartoes(D.fm);
  if(!D.empId){
    secao('Por funcionário');
    tabela([{t:'Funcionário',w:44},{t:'Previstas',w:24,al:'r'},{t:'Faltas',w:28,al:'r'},{t:'Cobertas',w:24,al:'r'},{t:'Trabalhadas',w:28,al:'r'},{t:'Dias',w:14,al:'r'},{t:'Devendo',w:20,al:'r'}],
      D.func.map(y2=>({c:[{t:y2.e.nome,b:true},fh(y2.prev),y2.fe.length?{t:y2.fe.length+' (-'+fh(y2.falt)+')',k:K.bad,b:true}:'-',y2.cobH>0?{t:'+'+fh(y2.cobH),k:K.ok,b:true}:'-',{t:fh(y2.trab),b:true},String(y2.dias.length),y2.pendTotal>0?{t:fh(y2.pendTotal),k:K.warn,b:true}:'-']})));
    const sd=D.func.filter(q=>q.saldo!==0||q.movs.length);
    if(sd.length){secao('Saldo de folgas');tabela([{t:'Funcionário',w:44},{t:'Saldo',w:26,al:'r'},{t:'Movimentos no período',w:112}],sd.map(q=>({c:[{t:q.e.nome,b:true},{t:fd(q.saldo),b:true,k:q.saldo<0?K.bad:q.saldo>0?K.ok:K.ink},q.movs.map(m=>`${dm(m.data)} ${m.tipo==='credito'?'+':'-'}${fn(+m.dias)}${m.anotacao?' '+m.anotacao:''}`).join('  ·  ')||'-']})))}
  }
  ft(7.5,false);T(K.mut);const nota=doc.splitTextToSize(L('Horas contadas da entrada até a saída, sem descontar intervalo. Feriados só contam para quem foi escalado neles.'),CW);ensure(nota.length*3.6+2);nota.forEach((t,i)=>doc.text(t,M,y+i*3.6));
  const n=doc.getNumberOfPages();
  for(let i=1;i<=n;i++){doc.setPage(i);S(K.line);doc.setLineWidth(.3);doc.line(M,PH-12,W-M,PH-12);ft(7.5,false);T(K.mut);doc.text('Escala da Equipe',M,PH-7.5);doc.text(L('Página '+i+' de '+n),W-M,PH-7.5,{align:'right'})}
  doc.save(nomeArq(D)+'.pdf');
}
function baixarCSV(linhas,nomeA){
  const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+linhas.map(l=>l.map(q).join(';')).join('\n')],{type:'text/csv'}));a.download=nomeA+'.csv';a.click();
}
function csvRel(D){
  const x=D.empId&&D.func[0];
  if(x)baixarCSV([['Data','Dia','Situação','Horas']].concat(diaria(x).map(r=>[fmt(r.k),DIAS[parse(r.k).getDay()],r.txt,String(Math.round(r.h*100)/100).replace('.',',')])),nomeArq(D));
  else baixarCSV([['Data','Funcionário','Motivo','Atestado','Horas devidas','Quitadas','Coberta por','Anexos','Observação']].concat(D.fm.map(f=>[fmt(f.data),nome(f.funcionario_id),f.motivo,f.atestado?'Sim':'Não',f.horas_devidas,f.horas_quitadas?'Sim':'Não',f.cobertura_id?nome(f.cobertura_id):'',(f.anexos||[]).length,f.observacao])),nomeArq(D));
}

// Caixa de anotações do gerente no começo do relatório em PDF
function pdfNotaBox(doc,c,y,texto){
  const {K,F,T,S,ft,L,M,CW,PH}=c;
  ft(8.5,false);const ls=doc.splitTextToSize(L(texto),CW-12),h=12+ls.length*4.2;
  if(y+h>PH-16){doc.addPage();y=M}
  F(K.warnb);S(K.warn);doc.setLineWidth(.3);doc.roundedRect(M,y,CW,h,2.5,2.5,'FD');
  ft(7.5,true);T(K.warn);doc.text(L('ANOTAÇÕES'),M+6,y+6);
  ft(8.5,false);T(K.ink);ls.forEach((t,i)=>doc.text(t,M+6,y+11+i*4.2));
  return y+h+7;
}

/* ===== js/tela-design.js ===== */
/* Tela: Design (cores, foto de topo e logos) */
const TEMA0={pri:'#E63946',bg:'#0B0E11',card:'#1A1F26',mut:'#9CA3AF',ink:'#FFFFFF',ok:'#22C55E',info:'#3B82F6',bad:'#EF4444'};
const PRESETS={escuro:TEMA0,azul:{...TEMA0,pri:'#3B82F6'},claro:{pri:'#E63946',bg:'#F5F6F8',card:'#FFFFFF',mut:'#6B7280',ink:'#111827',ok:'#16A34A',info:'#2563EB',bad:'#DC2626'}};
const DS0={nome:'Muscle Factory',sub:'Academia',logoRel:'',logoRelInfo:null,relTema:'escuro',sabSel:null,frase:'Gestão na sua mão. Mais controle, mais resultados.',foto:'',fotoInfo:null,logo:'',logoInfo:null,esc:45,pos:'center'};
const CORES=[['pri','Cor principal (destaques e botões)'],['bg','Fundo da tela'],['card','Cartões'],['ink','Texto principal'],['mut','Texto secundário'],['ok','Sucesso'],['info','Informação'],['bad','Alerta']];
function lerDS(){try{const j=JSON.parse(localStorage.getItem('escala_design')||'null')||{};return {...DS0,...j,cores:{...TEMA0,...(j.cores||{})}}}catch{return {...DS0,cores:{...TEMA0}}}}
let DS=lerDS(),_fotoSrc='',_fotoUrl='none';
let _svDS=null;
// Salva no aparelho na hora e no banco logo depois (assim o design vale em qualquer celular)
function salvarDS(){
  try{localStorage.setItem('escala_design',JSON.stringify(DS))}catch(e){alert('Não foi possível salvar o design neste aparelho (sem espaço). Tente uma foto menor.')}
  clearTimeout(_svDS);
  _svDS=setTimeout(()=>{try{db.from('config_app').upsert({id:1,dados:DS,atualizado_em:new Date().toISOString()}).then(()=>{},()=>{})}catch(e){}},600);
}
// Ao entrar: se já existe design salvo no banco, usa ele; se não, envia o deste aparelho
async function carregaDS(){
  try{
    const r=await db.from('config_app').select('dados').eq('id',1).maybeSingle();
    if(r.error)return;
    const j=r.data&&r.data.dados;
    if(j&&Object.keys(j).length){DS={...DS0,...j,cores:{...TEMA0,...(j.cores||{})}};try{localStorage.setItem('escala_design',JSON.stringify(DS))}catch(e){}aplicaTema()}
    else salvarDS();
  }catch(e){}
}
const lum=h=>{const n=parseInt(h.slice(1),16);return (0.2126*(n>>16&255)+0.7152*(n>>8&255)+0.0722*(n&255))/255};
function blobUrl(d){const [h,b]=d.split(','),mime=(h.match(/:(.*?);/)||[])[1]||'image/jpeg',bin=atob(b),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return URL.createObjectURL(new Blob([a],{type:mime}))}
function aplicaTema(){
  const r=document.documentElement.style,c=DS.cores;
  ['pri','bg','card','mut','ink','ok','info','bad'].forEach(k=>r.setProperty('--'+k,c[k]));
  r.setProperty('--onpri',lum(c.pri)>.62?'#111111':'#ffffff');
  if(DS.foto!==_fotoSrc){_fotoSrc=DS.foto;_fotoUrl=DS.foto?`url("${blobUrl(DS.foto)}")`:'none'}
  r.setProperty('--foto',_fotoUrl);r.setProperty('--fesc',DS.esc+'%');r.setProperty('--fpos',DS.pos);
  r.colorScheme=lum(c.bg)>.5?'light':'dark';
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=c.bg;
}
aplicaTema();
function lerImagem(file,maxW,tipo){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej(Error('Não consegui ler o arquivo.'));fr.onload=()=>{const im=new Image();im.onerror=()=>rej(Error('Esse arquivo não é uma imagem válida.'));im.onload=()=>{const k=Math.min(1,maxW/im.naturalWidth),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res({url:c.toDataURL(tipo,.82),w:im.naturalWidth,h:im.naturalHeight})};im.src=fr.result};fr.readAsDataURL(file)})}
function avaliaImg(i,iw,ih,minW){
  if(!i)return 'Nenhuma imagem escolhida ainda.';
  const ratio=(i.w/i.h)/(iw/ih);
  return `Sua imagem: ${i.w} × ${i.h} px. ${i.w<minW?'Está pequena e pode ficar borrada.':'Tamanho bom.'} ${Math.abs(ratio-1)>.25?'A proporção é diferente do ideal, então as bordas serão cortadas.':'Proporção ótima.'}`;
}
function vDesign(){
  const c=DS.cores;
  return `<div class="card"><b>Empresa</b><label>Nome (com duas palavras, vira duas linhas no logo)<input id="dn" value="${esc(DS.nome)}"></label><label>Faixa amarela do logo (deixe vazio para não mostrar)<input id="ds" value="${esc(DS.sub)}"></label><label>Frase da tela inicial<input id="df" value="${esc(DS.frase)}"></label></div>
  <div class="card"><b>Foto de fundo do topo</b>
  <div class="info"><b>Tamanho ideal: 1080 × 820 px</b><small>Foto na horizontal, JPG ou PNG. Mínimo 800 × 600 px. Deixe o assunto principal no centro ou à direita; a parte de baixo escurece sozinha para o texto ficar legível. O app reduz o arquivo automaticamente.</small></div>
  ${DS.foto?`<img class="prev" src="${DS.foto}" alt="foto atual">`:''}<p class="mut" style="margin:4px 0"><small>${avaliaImg(DS.fotoInfo,1080,820,800)}</small></p>
  <label>Escolher foto<input type="file" id="dfoto" accept="image/*"></label>
  <label>Escurecer a foto: <b id="dev" style="color:var(--ink)">${DS.esc}%</b><input type="range" id="desc" min="0" max="90" value="${DS.esc}"></label>
  <label>Posição da foto<select id="dpos">${opts([['top','Topo'],['center','Centro'],['bottom','Base']],DS.pos)}</select></label>
  ${DS.foto?'<button class="ghost red" id="drf" style="width:100%">Remover foto</button>':''}</div>
  <div class="card"><b>Logo do app (topo da tela inicial)</b>
  <div class="info"><b>Tamanho ideal: 480 × 200 px</b><small>PNG com fundo transparente. Aparece no canto direito do topo. Sem logo enviado, o app mostra o nome da empresa em estilo de logo.</small></div>
  ${DS.logo?`<img class="prev lg" src="${DS.logo}" alt="logo atual">`:''}<p class="mut" style="margin:4px 0"><small>${avaliaImg(DS.logoInfo,480,200,300)}</small></p>
  <label>Escolher logo<input type="file" id="dlogo" accept="image/*"></label>
  ${DS.logo?'<button class="ghost red" id="drl" style="width:100%">Remover logo</button>':''}</div>
  <div class="card"><b>Logo dos relatórios e escalas (PDF)</b>
  <div class="info"><b>Tamanho ideal: 720 × 240 px</b><small>PNG com fundo transparente, na horizontal (proporção 3 por 1). Aparece no canto direito do cabeçalho dos PDFs. Se não enviar nada, os PDFs usam o logo do app.</small></div>
  ${DS.logoRel?`<img class="prev lg" style="background:${DS.relTema==='claro'?'#f3f4f6':'#0B0E11'}" src="${DS.logoRel}" alt="logo do relatório">`:''}<p class="mut" style="margin:4px 0"><small>${DS.logoRel?avaliaImg(DS.logoRelInfo,720,240,500):'Usando o logo do app.'}</small></p>
  <label>Escolher logo dos relatórios<input type="file" id="dlogor" accept="image/*"></label>
  <label>Cabeçalho do PDF<select id="drt">${opts([['escuro','Escuro (para logo de letras claras)'],['claro','Claro (para logo de letras escuras)']],DS.relTema)}</select></label>
  ${DS.logoRel?'<button class="ghost red" id="drlr" style="width:100%">Remover logo dos relatórios</button>':''}</div>
  <div class="card"><b>Cores</b>
  <div class="row"><button class="ghost sm" data-p="escuro">Escuro vermelho</button><button class="ghost sm" data-p="azul">Escuro azul</button><button class="ghost sm" data-p="claro">Claro</button></div>
  ${CORES.map(([k,l])=>`<label class="cor"><span>${l}</span><input type="color" data-c="${k}" value="${c[k].toLowerCase()}"></label>`).join('')}
  <button class="ghost" id="dres" style="width:100%;margin-top:10px">Restaurar cores padrão</button></div>
  <p class="mut"><small>As escolhas de design ficam salvas neste aparelho. Em outro celular ou computador, configure de novo.</small></p>`;
}
bind.design=()=>{
  $('#dn').onchange=e=>{DS.nome=e.target.value.trim();salvarDS();render()};
  $('#ds').onchange=e=>{DS.sub=e.target.value.trim();salvarDS();render()};
  $('#df').onchange=e=>{DS.frase=e.target.value.trim();salvarDS();render()};
  $('#desc').oninput=e=>{DS.esc=+e.target.value;$('#dev').textContent=DS.esc+'%';aplicaTema()};$('#desc').onchange=salvarDS;
  $('#dpos').onchange=e=>{DS.pos=e.target.value;aplicaTema();salvarDS()};
  $('#dfoto').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const r=await lerImagem(f,1200,'image/jpeg');DS.foto=r.url;DS.fotoInfo={w:r.w,h:r.h};aplicaTema();salvarDS();render()}catch(x){alert(x.message)}};
  $('#dlogo').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const r=await lerImagem(f,480,'image/png');DS.logo=r.url;DS.logoInfo={w:r.w,h:r.h};salvarDS();render()}catch(x){alert(x.message)}};
  $('#dlogor').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const r=await lerImagem(f,720,'image/png');DS.logoRel=r.url;DS.logoRelInfo={w:r.w,h:r.h};salvarDS();render()}catch(x){alert(x.message)}};
  $('#drt').onchange=e=>{DS.relTema=e.target.value;salvarDS();render()};
  if($('#drlr'))$('#drlr').onclick=()=>{DS.logoRel='';DS.logoRelInfo=null;salvarDS();render()};
  if($('#drf'))$('#drf').onclick=()=>{DS.foto='';DS.fotoInfo=null;aplicaTema();salvarDS();render()};
  if($('#drl'))$('#drl').onclick=()=>{DS.logo='';DS.logoInfo=null;salvarDS();render()};
  document.querySelectorAll('[data-c]').forEach(i=>{i.oninput=()=>{DS.cores[i.dataset.c]=i.value;aplicaTema()};i.onchange=salvarDS});
  document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{DS.cores={...PRESETS[b.dataset.p]};aplicaTema();salvarDS();render()});
  $('#dres').onclick=()=>{DS.cores={...TEMA0};aplicaTema();salvarDS();render()};
};

/* ===== js/tela-conta.js ===== */
/* Tela: Minha conta e instalação no celular */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.ip = e; if (S.tab==='conta' && $('#app main')) render(); });
window.addEventListener('appinstalled', () => { S.ip = null; if (S.tab==='conta') render(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
const instalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
function vConta(){
  const u = S.user || {}, m = u.user_metadata || {};
  return `<div class="card"><h3 style="margin-top:0">Meu perfil</h3>
  <label>Nome<input id="cn" value="${esc(m.nome)}" placeholder="Seu nome"></label>
  <label>Cargo<input id="cc" value="${esc(m.cargo || 'Gerente')}"></label>
  <label>E-mail<input value="${esc(u.email)}" disabled></label>
  <div class="row"><button id="cs">Salvar perfil</button><button class="ghost" id="cp2">Trocar senha</button></div></div>
  <div class="card"><h3 style="margin-top:0">Instalar no celular</h3>
  ${instalado() ? '<p><span class="tag ok">App instalado</span> Você já está usando como aplicativo.</p>'
   : S.ip ? '<p>Instale para abrir direto da tela inicial, sem navegador.</p><button id="ins">Instalar app</button>'
   : '<p><b>Android (Chrome):</b> toque nos 3 pontinhos ⋮ e em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).</p><p><b>iPhone (Safari):</b> toque em Compartilhar e em <b>Adicionar à Tela de Início</b>.</p>'}</div>`;
}
bind.conta = () => {
  $('#cs').onclick = async () => { const { data, error } = await db.auth.updateUser({ data:{ nome:$('#cn').value.trim(), cargo:$('#cc').value.trim() } }); if (error) return alert(error.message); S.user = data.user; alert('Perfil salvo.'); render(); };
  $('#cp2').onclick = () => modal('Trocar senha', '<label>Nova senha (mínimo 6 caracteres)<input type="password" name="pw" autocomplete="new-password"></label>', async d => {
    const pw = d.querySelector('[name="pw"]').value; if (pw.length < 6) throw Error('A senha precisa ter pelo menos 6 caracteres.');
    const { error } = await db.auth.updateUser({ password:pw }); if (error) throw error; });
  const i = $('#ins'); if (i) i.onclick = async () => { S.ip.prompt(); await S.ip.userChoice; S.ip = null; render(); };
};

/* ===== js/app.js ===== */
/* Login e inicialização do app */
async function start(){
  const { data } = await db.auth.getSession();
  if (data.session) { S.user = data.session.user; return load(); }
  $('#app').innerHTML = `<main><div class="card" style="max-width:380px;margin:40px auto"><h1>Escala da Equipe</h1><p class="mut">Entre com o e-mail e a senha criados no Supabase.</p>
  <label>E-mail<input id="em" type="email" autocomplete="username"></label><label>Senha<input id="pw" type="password" autocomplete="current-password"></label>
  <button id="go" style="width:100%;margin-top:8px">Entrar</button></div></main>`;
  $('#go').onclick = async () => {
    const { data:lg, error } = await db.auth.signInWithPassword({ email:$('#em').value.trim(), password:$('#pw').value });
    if (error) return alert('Não foi possível entrar: ' + error.message);
    S.user = lg.user; load();
  };
}
start();
