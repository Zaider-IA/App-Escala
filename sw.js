const V='escala-v16';
const FILES=['./','index.html','config.js','manifest.json','icon-192.png','icon-512.png','css/app.css',
  'js/base.js','js/regras.js','js/dados.js','js/ui-comum.js','js/notas.js','js/tela-inicio.js','js/tela-escala.js','js/tela-sabados.js','js/tela-ponto.js','js/tela-equipe.js','js/tela-faltas.js','js/tela-feriados.js','js/tela-saldo.js','js/tela-historico.js','js/tela-backup.js','js/relatorio.js','js/textos.js','js/pdf.js','js/tela-design.js','js/tela-conta.js','js/app.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.endsWith('supabase.co'))return; // dados sempre ao vivo
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
