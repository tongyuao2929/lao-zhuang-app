 // ===== App 逻辑 =====
 (function() {
 const $ = s => document.querySelector(s);
 const $$ = s => document.querySelectorAll(s);
 
 // 当前标签页
 let currentTab = 'home';
 
 // 页面渲染函数
 function renderHome() {
   const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
   return '<div class="page home-page">' +
     '<div class="hero-section">' +
       '<h1 class="app-title">老 庄 智 慧</h1>' +
       '<p class="app-subtitle">老子 · 庄子 · 道家思想</p>' +
     '</div>' +
     '<div class="daily-card">' +
       '<div class="daily-label">— 每日一言 —</div>' +
       '<div class="daily-text">' + q.t + '</div>' +
       '<div class="daily-source">' + q.s + '</div>' +
     '</div>' +
     '<div class="quick-links">' +
       '<a class="ql-btn" onclick="window.app.goTo(\'ddj\')">📖 道德经</a>' +
       '<a class="ql-btn" onclick="window.app.goTo(\'zz\')">🦋 庄子</a>' +
       '<a class="ql-btn" onclick="window.app.goTo(\'concepts\')">☯ 核心概念</a>' +
     '</div>' +
   '</div>';
 }
 
 function renderDDJ() {
   let html = '<div class="page"><h2 class="page-title">道德经 <span class="sub">八十一章</span></h2><div class="chapter-list">';
   DDJ.forEach(c => {
     const b = isBookmarked('ddj-'+c.ch) ? '★' : '☆';
     html += '<div class="chapter-item" onclick="window.app.showDDJ('+c.ch+')">' +
       '<span class="ch-num">第' + c.ch + '章</span>' +
       '<span class="ch-preview">' + c.t.slice(0, 18) + '…</span>' +
       '<span class="ch-bookmark" onclick="event.stopPropagation();window.app.toggleBookmark(\'ddj-'+c.ch+'\')">' + b + '</span>' +
     '</div>';
   });
   return html + '</div></div>';
 }
 
 function renderZZ() {
   let html = '<div class="page"><h2 class="page-title">庄子 <span class="sub">内篇选读</span></h2><div class="chapter-list">';
   ZZ.forEach((s, i) => {
     html += '<div class="chapter-item" onclick="window.app.showZZ('+i+')">' +
       '<span class="ch-num">' + s.s + '</span>' +
       '<span class="ch-preview">共 ' + s.p.length + ' 则</span>' +
     '</div>';
   });
   return html + '</div></div>';
 }
 
 function renderConcepts() {
   let html = '<div class="page"><h2 class="page-title">核心概念</h2><div class="concept-grid">';
   CONCEPTS.forEach(c => {
     html += '<div class="concept-card"><h3>' + c.t + '</h3><p>' + c.d + '</p></div>';
   });
   return html + '</div></div>';
 }
 
 function renderSearch() {
   return '<div class="page search-page">' +
     '<div class="search-box"><input type="text" id="searchInput" placeholder="搜索道德经、庄子、概念…" oninput="window.app.doSearch(this.value)"></div>' +
     '<div id="searchResults"></div></div>';
 }
 
 // 展示详情
 function showDDJ(ch) {
   const c = DDJ.find(x => x.ch === ch);
   if (!c) return;
   const bm = isBookmarked('ddj-'+ch) ? '★ 已收藏' : '☆ 收藏';
   $('#app').innerHTML = '<div class="page detail-page">' +
     '<button class="back-btn" onclick="window.app.goTo(\'ddj\')">← 返回</button>' +
     '<h2 class="detail-title">第' + ch + '章</h2>' +
     '<div class="detail-text">' + c.t + '</div>' +
     '<button class="bm-btn" onclick="window.app.toggleBookmark(\'ddj-'+ch+'\')">' + bm + '</button>' +
   '</div>';
 }
 
 function showZZ(idx) {
   const s = ZZ[idx];
   if (!s) return;
   let html = '<div class="page detail-page">' +
     '<button class="back-btn" onclick="window.app.goTo(\'zz\')">← 返回</button>' +
     '<h2 class="detail-title">' + s.s + '</h2>';
   s.p.forEach(p => {
     html += '<div class="detail-text passage"><p>' + p + '</p></div>';
   });
   $('#app').innerHTML = html + '</div>';
 }
 
 // 搜索
let _srData = [];
 function doSearch(q) {
   _srData = [];
   if (!q || q.length < 1) { $('#searchResults').innerHTML = ''; return; }
   DDJ.forEach(c => { if(c.t.includes(q)) _srData.push({t:'《道德经》第'+c.ch+'章',s:c.t.slice(0,40)+'…',g:()=>showDDJ(c.ch)}); });
   ZZ.forEach((s,i)=>{ s.p.forEach(p => { if(p.includes(q)) _srData.push({t:'《庄子·'+s.s+'》',s:p.slice(0,40)+'…',g:()=>showZZ(i)}); }); });
   CONCEPTS.forEach(c=>{ if(c.t.includes(q)||c.d.includes(q)) _srData.push({t:'概念：'+c.t,s:c.d.slice(0,40)+'…'}); });
   let h = '<div id="srContainer">';
   if(_srData.length===0) h += '<p class="no-res">未找到相关内容</p>';
   else _srData.slice(0,30).forEach((r,i) => { h += '<div class="sr-item" data-si="'+i+'"><div class="sr-title">'+r.t+'</div><div class="sr-snippet">'+r.s+'</div></div>'; });
   $('#searchResults').innerHTML = h + '</div>';
 }
 
 // 书签管理
 function getBookmarks() {
   try { return JSON.parse(localStorage.getItem('lz_bookmarks')||'[]'); } catch(e) { return []; }
 }
 function isBookmarked(id) {
   return getBookmarks().includes(id);
 }
 function toggleBookmark(id) {
   let bm = getBookmarks();
   if(bm.includes(id)) bm = bm.filter(x=>x!==id);
   else bm.push(id);
   localStorage.setItem('lz_bookmarks', JSON.stringify(bm));
   // Refresh current view
   if(currentTab==='ddj') goTo('ddj');
   else if(currentTab==='zz') goTo('zz');
   else if(currentTab==='home') goTo('home');
 }
 
 // 导航
 function goTo(tab) {
   currentTab = tab;
   $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
   if(tab==='home') $('#app').innerHTML = renderHome();
   else if(tab==='ddj') $('#app').innerHTML = renderDDJ();
   else if(tab==='zz') $('#app').innerHTML = renderZZ();
   else if(tab==='concepts') $('#app').innerHTML = renderConcepts();
   else if(tab==='search') { $('#app').innerHTML = renderSearch(); setTimeout(()=>$('#searchInput')?.focus(),100); }
   window.scrollTo(0,0);
 }
 
 // 深色模式
 function toggleDark() {
   document.body.classList.toggle('dark');
   localStorage.setItem('lz_dark', document.body.classList.contains('dark')?'1':'0');
 }
 function initDark() {
   if(localStorage.getItem('lz_dark')==='1') document.body.classList.add('dark');
 }
 
 // 导出API
 window.app = { goTo, showDDJ, showZZ, doSearch, toggleBookmark, toggleDark };
 
 // 初始化
 document.addEventListener('DOMContentLoaded', () => {
   initDark();
   // Tab 点击
   $$('.tab-btn').forEach(b => b.addEventListener('click', () => goTo(b.dataset.tab)));
   // 深色按钮
   $('#darkToggle')?.addEventListener('click', toggleDark);
   goTo('home');
 });
 // 搜索结果点击
document.addEventListener('click', function(e) {
  const el = e.target.closest('.sr-item');
  if (el && el.dataset.si !== undefined && _srData[parseInt(el.dataset.si)] && _srData[parseInt(el.dataset.si)].g) {
    _srData[parseInt(el.dataset.si)].g();
  }
});
})();
