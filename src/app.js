(function(){
'use strict';
var LOGO='data:image/svg+xml;base64,__LOGO__'; /* wordmark from src/logo.svg, inlined by build.py */
var KEY='nw-partner-portal-v3';
var TIERS=['Registered','Silver','Gold','Platinum'];
/* illustrative sample commission rates, not real commercial terms */
var RATE={Registered:10,Silver:15,Gold:20,Platinum:25};
var SERVICES=['MDR','SME Essentials','VAPT','Managed SOC','Source Code Review','Compromise Assessment','DFIR retainer','Cyber Consultation'];
var STAGES=['Qualified','Proposal','Negotiation'];
var ROLES=['Partner Admin','Sales','Technical','Finance'];
var STAFF_LIST=[
  {id:'S-CLA',name:'Clara Seah',email:'clara.seah@example.com',terrs:['Singapore'],roles:['Partner Manager']},
  {id:'S-MAR',name:'Marcus Yap',email:'marcus.yap@example.com',terrs:['Malaysia','Singapore'],roles:['Partner Manager']},
  {id:'S-NAD',name:'Nadia Karim',email:'nadia.karim@example.com',terrs:['Malaysia'],roles:['Partner Manager']},
  {id:'S-VIC',name:'Victor Chua',email:'victor.chua@example.com',terrs:['Malaysia'],roles:['Partner Manager']},
  {id:'S-IRF',name:'Irfan Halim',email:'irfan.halim@example.com',terrs:['Sri Lanka'],all:true,roles:['Partner Manager','Approver']},
  {id:'S-SAN',name:'Sanjay Rao',email:'sanjay.rao@example.com',terrs:['United States'],roles:['Partner Manager']},
  {id:'S-HAN',name:'Hannah Lau',email:'hannah.lau@example.com',terrs:['Malaysia','Singapore','United States'],all:true,roles:['Partner Manager','Approver']},
  {id:'S-ZAR',name:'Zara Ismail',email:'zara.ismail@example.com',terrs:[],roles:['Marketing']},
  {id:'S-FAI',name:'Faisal Rahim',email:'faisal.rahim@example.com',terrs:[],roles:['Finance']},
  {id:'S-ADM',name:'Northwind Security Portal Admin',email:'portal.admin@example.com',terrs:[],roles:['Portal admin']}
];
STAFF_LIST.forEach(function(x){x.role='Northwind Security staff';x.territory=x.terrs.length?x.terrs.join(', '):null;x.baseRoles=x.roles.slice();x.baseAll=!!x.all});
/* leavers are kept in S.staffMeta; their partners move on handover, or are covered by Hannah if the account was disabled first */
function applyStaff(){var m=(S&&S.staffMeta)||{},ap=(S&&S.approvers)||['S-IRF','S-HAN'];APPROVER2=ap[0];APPROVER3=ap[1];
  STAFF_LIST.forEach(function(x){var e=m[x.id]||{};x.status=e.status||'Active';x.leftAt=e.leftAt||null;x.handedTo=e.handedTo||null;
    x.roles=x.status==='Left'?[]:x.baseRoles.filter(function(r){return r!=='Approver'}).concat(ap.indexOf(x.id)>-1?['Approver']:[]);x.all=x.status!=='Left'&&(x.baseAll||ap.indexOf(x.id)>-1)})}
function isLeft(id){var x=staffById(id);return !!(x&&x.status==='Left')}
function effPm(id){return isLeft(id)?APPROVER3:id}
function orphans(){return STAFF_LIST.filter(function(x){return x.status==='Left'&&!x.handedTo})}
/* each territory trades in its own currency; RM equivalents use sample exchange rates */
var CUR={Malaysia:{code:'MYR',fx:1},Singapore:{code:'SGD',fx:3.45},'Sri Lanka':{code:'LKR',fx:0.0155},'United States':{code:'USD',fx:4.70}};
var TARGETS={MYR:[0,100000,250000,500000],SGD:[0,30000,75000,150000],LKR:[0,6500000,16000000,32000000],USD:[0,22000,55000,110000]};
function curOf(pid){var p=partnerById(pid);return CUR[p&&p.country]||CUR.Malaysia}
function monC(n,c){return c.code==='MYR'?rm(n):c.code+' '+Math.round(n).toLocaleString('en-MY')}
function mon(n,pid){return monC(n,curOf(pid))}
function toMyr(n,pid){return n*curOf(pid).fx}
function myrNote(n,pid){var c=curOf(pid);return isStaff()&&c.code!=='MYR'?'<span class="sub">≈ '+rm(n*c.fx)+'</span>':''}
function platTarget(){return TARGETS[curOf(myPartner().id).code][3]}
function progReq(){var c=curOf(myPartner().id),t=TARGETS[c.code];return [['Won sales, last 12 months','None',monC(t[1],c),monC(t[2],c),monC(t[3],c)]].concat(PROGRAM_REQ.slice(1))}
function niceNum(v){var st=v>=100000?5000:v>=10000?1000:v>=1000?100:5;return Math.max(st,Math.round(v/st)*st)}
function regionalize(str,code){if(code==='MYR')return str;var fx=0;Object.keys(CUR).forEach(function(k){if(CUR[k].code===code)fx=CUR[k].fx});
  return String(str).replace(/RM ([\d,]+)/g,function(m,n){return code+' '+niceNum(parseInt(n.replace(/,/g,''),10)/fx).toLocaleString('en-MY')})}
var APPROVER2='S-IRF',APPROVER3='S-HAN',TERRITORIES=['Malaysia','Singapore','Sri Lanka','United States'];
function staffById(id){return STAFF_LIST.filter(function(x){return x.id===id})[0]||null}
function pmsFor(country){return STAFF_LIST.filter(function(x){return x.terrs.indexOf(country)>-1&&x.status!=='Left'})}
function covers(u,country){return !!(u&&u.terrs&&u.terrs.indexOf(country)>-1)}
function terrText(u){return u.all?'all territories':u.terrs.join(' and ')}
function staffLabel(x){if(x.status==='Left')return 'Left Northwind Security';return x.id===APPROVER3?'All territories':x.territory||x.roles.join(', ')}
/* Partner Managers and approvers run partners and deals; Marketing publishes content; the Portal admin runs accounts */
function hasRole(r){var u=me();return !!(u&&isStaff()&&u.roles&&u.roles.indexOf(r)>-1)}
function isSalesStaff(){return hasRole('Partner Manager')||hasRole('Approver')}
function canPublish(){return hasRole('Marketing')||!!(me()&&me().id===APPROVER3)}
function staffHome(){return isSalesStaff()?'a-home':hasRole('Finance')?'a-payouts':hasRole('Marketing')?'a-content':'a-team'}
var FINANCE='S-FAI';
function payLabel(st){return !isStaff()&&st==='Ready for payment'?'Payment in progress':st}
function myPartnersAll(){return S.partners.filter(function(p){return p.status==='Active'&&ownsPartner(p)})}
function newsFor(){if(isStaff())return S.news;var pid=myPartner().id;return S.news.filter(function(n){return !n.pids||n.pids.indexOf(pid)>-1})}
var DOMAIN='contohtech.example';
var PAGE_SIZE=10;

var PERMS={
  'Partner Admin':['home','program','news','news-item','deals','deal','deal-new','products','product','customers','training','resources','marketing','commissions','cases','case','settings'],
  'Sales':['home','program','news','news-item','deals','deal','deal-new','products','product','training','resources','marketing','cases','case'],
  'Technical':['home','program','news','news-item','deals','deal','products','product','customers','training','resources','cases','case'],
  'Finance':['home','program','news','news-item','commissions','cases','case']
};
var STAFF_VIEWS=['a-home','a-approvals','a-deals','a-partners','a-payouts','a-cases','a-content','a-audit','a-team','deal','case','news-item'];
var CAN_REGISTER=['Partner Admin','Sales'];

var PROGRAM_REQ=[
  ['Won sales, last 12 months','None','RM 100,000','RM 250,000','RM 500,000'],
  ['Certified sales people (Sales Associate)','1','2','3','5'],
  ['Certified technical people (Technical Pre-sales)','None','None','1','2']
];
var PROGRAM_BEN=[
  ['Partner margin','10%','15%','20%','25%'],
  ['Deal registration protection','90 days','90 days','90 days','90 days + 30-day extension'],
  ['Demo (NFR) licences','-','5 endpoints','25 endpoints','100 endpoints'],
  ['Marketing development funds (MDF)','-','-','On request','Quarterly budget'],
  ['Co-selling with a Northwind Security account manager','-','-','-','Included'],
  ['Channel manager','Shared team','Shared team','Named manager','Named manager + executive sponsor'],
  ['Listing in the partner locator','-','Listed','Listed','Featured']
];
var CAMPAIGNS=[
  {id:'CMP-01',name:'Ransomware readiness for manufacturers',goal:'Book MDR discovery calls with manufacturers',audience:'Manufacturing, 100 to 1,000 staff',assets:['R13','R14','R02','R10']},
  {id:'CMP-02',name:'SME Essentials starter bundle',goal:'Win first-time security buyers',audience:'SMEs with 10 to 200 staff',assets:['R15','R14','R03']},
  {id:'CMP-03',name:'Audit season: VAPT and compliance',goal:'Sell VAPT and consultation ahead of audits',audience:'Finance and healthcare',assets:['R05','R09','R07']}
];

/* ---------- dates & formatting ---------- */
var T0=new Date();T0.setHours(0,0,0,0);
function pad(n){return (n<10?'0':'')+n}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function dOff(n){var d=new Date(T0);d.setDate(d.getDate()+n);return ymd(d)}
function today(){return ymd(T0)}
function parseD(s){var p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}
function fmtD(s){return s?parseD(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'-'}
function daysUntil(s){return Math.round((parseD(s)-T0)/864e5)}
function addDays(s,n){var d=parseD(s);d.setDate(d.getDate()+n);return ymd(d)}
function nowISO(){return new Date().toISOString()}
function agoISO(min){return new Date(Date.now()-min*60000).toISOString()}
function fmtTime(iso){var d=new Date(iso);var t=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});return ymd(d)===today()?'Today, '+t:d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})+', '+t}
function quarterOf(s){var d=parseD(s);return d.getFullYear()+'-Q'+(Math.floor(d.getMonth()/3)+1)}
var QNOW=quarterOf(today());
var YNOW=T0.getFullYear();
var QLABEL=(function(){var q=Math.floor(T0.getMonth()/3);return 'Q'+(q+1)+' '+YNOW})();
function rm(n){return 'RM '+Math.round(n).toLocaleString('en-MY')}
function rmShort(n){return n>=1e6?'RM '+(n/1e6).toFixed(2)+'M':rm(n)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function initials(n){return n.split(/\s+/).map(function(w){return w[0]}).slice(0,2).join('').toUpperCase()}
function pct(a,b){return b?Math.max(0,Math.min(100,a/b*100)):0}

/*__SEED__*/

/* ---------- state ---------- */
var S=null;
try{var raw=localStorage.getItem(KEY);if(raw){S=JSON.parse(raw);if(!S||S.v!==seed().v)S=null}}catch(e){S=null}
if(!S)S=seed();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
var ui={v:null,id:null,auth:'login',authErr:'',pending:null,mfaFails:0,loginEmail:'',
  tab:{},q:{},f:{},pg:{},sort:{key:'submitted',dir:-1},
  modal:null,dd:null,navOpen:false,gq:'',formErr:'',applyErr:'',applied:null,
  step:1,draft:{},prefill:null};

function me(){if(!S.session)return null;if(/^S-/.test(S.session.userId))return staffById(S.session.userId);return S.users.filter(function(u){return u.id===S.session.userId})[0]||null}
function isStaff(){return !!(S.session&&/^S-/.test(S.session.userId))}
function myPartner(){var u=me();return partnerById(u&&u.partnerId||'P001')}
function myUsers(){var pid=myPartner().id;return S.users.filter(function(x){return x.partnerId===pid})}
function myDomain(){return myPartner().domain||DOMAIN}
function notifyP(pid,text,v,ref){S.notifications.unshift({id:'N'+(S.seq.note++),to:'partner',pid:pid,at:nowISO(),read:false,text:text,view:v,ref:ref||null})}
function partnerById(id){return S.partners.filter(function(p){return p.id===id})[0]||{name:'Unknown partner',tier:'Registered'}}
function dealById(id){return S.deals.filter(function(d){return d.id===id})[0]}
function caseById(id){return S.tickets.filter(function(t){return t.id===id})[0]}
function resById(id){return S.resources.filter(function(r){return r.id===id})[0]}
function prodById(id){return S.products.filter(function(p){return p.id===id})[0]}
function newsById(id){return S.news.filter(function(n){return n.id===id})[0]}
function myDeals(){return S.deals.filter(function(d){return d.partnerId===myPartner().id})}
function tierRank(t){return TIERS.indexOf(t)}
function allowed(v){var u=me();if(!u||!v)return false;if(isStaff()){if(STAFF_VIEWS.indexOf(v)<0)return false;if(hasRole('Portal admin'))return v==='a-team'||v==='a-audit';if(hasRole('Finance'))return v==='a-payouts';if(hasRole('Marketing'))return v==='a-content'||v==='news-item';return v!=='a-team'||me().id===APPROVER3}if(v==='deal-new')return canRegister();return (PERMS[u.role]||[]).indexOf(v)>-1}
function canRegister(){var u=me();return !!u&&!isStaff()&&CAN_REGISTER.indexOf(u.role)>-1}
function isAdminUser(){var u=me();return !!u&&u.role==='Partner Admin'}
function actorEmail(){var u=me();return u?u.email:'anonymous'}
function log(text,level){S.audit.unshift({at:nowISO(),actor:actorEmail(),text:text,level:level||'info'})}
function notify(to,text,v,ref){S.notifications.unshift({id:'N'+(S.seq.note++),to:to,at:nowISO(),read:false,text:text,view:v,ref:ref||null})}
function sweep(){S.deals.forEach(function(d){if(d.status==='Approved'&&d.protectedUntil&&daysUntil(d.protectedUntil)<0){d.status='Expired';d.history.push({at:today(),by:'System',text:'Protection period ended without an update'})}})}
/* deal activity: approved deals need a progress update at least every 30 days; after 50 days without one, protection is suspended */
var UPDATE_DUE=30,INACTIVE_AFTER=50;
function lastAct(d){return d.lastActivity||d.approvedAt||d.submitted}
function idle(d){return Math.max(0,-daysUntil(lastAct(d)))}
function activity(d){if(d.status!=='Approved')return null;var n=idle(d);return n>=INACTIVE_AFTER?'Inactive':n>=UPDATE_DUE?'Update due':'Active'}
function daysAgo(n){return n===0?'Updated today':n+' day'+(n===1?'':'s')+' ago'}
function actCell(d){var a=activity(d);return a?badge(a)+'<span class="sub">'+daysAgo(idle(d))+'</span>':'<span class="muted">-</span>'}
function sameCustomer(a,b){a=a.trim().toLowerCase();b=b.trim().toLowerCase();return a.length>2&&b.length>2&&(a.indexOf(b)>-1||b.indexOf(a)>-1)}
function rival(d){if(d.status!=='Pending'&&d.status!=='Approved')return null;return S.deals.filter(function(x){return x!==d&&x.partnerId!==d.partnerId&&(x.status==='Pending'||x.status==='Approved')&&sameCustomer(x.customer,d.customer)})[0]||null}
/* deal verification: proof that a registration is a real opportunity */
var DOC_BUDGET=['Letter of Intent','Purchase Order','Approved budget or purchase request','Tender or RFP with budget','Quotation signed by the customer'],DOC_EVIDENCE=['Meeting notes','Email from the customer','Tender or RFP document','Customer request for quote'];
var FREE_MAIL=['gmail.com','yahoo.com','hotmail.com','outlook.com','live.com','icloud.com','ymail.com','aol.com','freemail.example'];
function domainOf(s){return String(s||'').toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split(/[\/?#]/)[0]}
function checks(d){var em=domainOf((d.contactEmail||'').split('@')[1]),web=domainOf(d.website),met=d.lastMeeting?-daysUntil(d.lastMeeting):null,k=d.companyCheck,out=[];
  out.push(d.regNo&&web?{state:'ok',label:'Company identified',detail:'Registration no. '+d.regNo+' · '+web}:{state:'bad',label:'Company identified',detail:'Registration number or website missing'});
  out.push(FREE_MAIL.indexOf(em)>-1?{state:'bad',label:'Business email',detail:'Personal email address ('+em+'). The customer contact must use a company email.'}:em&&web&&(em===web||em.slice(-web.length-1)==='.'+web)?{state:'ok',label:'Business email',detail:'Contact email matches the company website ('+web+')'}:{state:'warn',label:'Business email',detail:'Contact email ('+em+') does not match the company website'});
  out.push((d.budgetDocs||[]).length?{state:'ok',label:'Proof of budget',detail:d.budgetDocs.map(function(e){return e.type}).join(' · ')+(d.auditDoc?' · audited accounts attached':'')}:{state:'bad',label:'Proof of budget',detail:'No letter of intent, purchase order or approved budget attached'});
  out.push((d.evidence||[]).length?{state:'ok',opt:1,label:'Proof of engagement',detail:d.evidence.map(function(e){return e.type+': '+e.name}).join(' · ')}:{state:'opt',opt:1,label:'Proof of engagement',detail:'Not provided'});
  out.push(met!==null&&met<=60?{state:'ok',opt:1,label:'Recent customer meeting',detail:'Last met on '+fmtD(d.lastMeeting)}:{state:'opt',opt:1,label:'Recent customer meeting',detail:met===null?'Not provided':'Last meeting was '+met+' days ago'});
  var cc=d.custConfirm;out.push(cc==='Confirmed'?{state:'ok',opt:1,label:'Customer confirmation',detail:esc2(d.contact)+' confirmed by email on '+fmtD(d.custConfirmAt)}:cc==='Declined'?{state:'bad',opt:1,label:'Customer confirmation',detail:esc2(d.contact)+' replied that they are not discussing Northwind Security services with this partner'}:{state:'opt',opt:1,label:'Customer confirmation',detail:'Email sent to '+esc2(d.contact)+' on '+fmtD(d.custSentAt)+'. No reply yet.'});
  return out}
function simCheck(d){var h=0,n=d.customer;for(var i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%100003;
  var band={'1,000+':[120,380],'201-1,000':[18,90],'51-200':[4,18]}[d.employees]||[1,4],rev=band[0]+(h%100)/100*(band[1]-band[0]),m=function(x){return 'RM '+x.toFixed(1)+' million'};
  var c={status:'Active',since:String(1996+h%24),fy:YNOW-1,revenue:m(rev),profit:'profit '+m(rev*(0.05+(h%6)/100)),opinion:'Unqualified (clean)',credit:(660+h%170)+' of 850',note:'No legal cases or late payments on record'};
  if(/kinta/i.test(n)){c.since='2009';c.revenue=m(62.4);c.profit='net loss '+m(1.8);c.credit='641 of 850';c.note='No legal cases. One late supplier payment in the last 12 months'}
  if(/seri harapan/i.test(n)){c.fy=YNOW-3;c.revenue=m(9.1);c.profit='net loss '+m(0.6);c.opinion='Qualified';c.credit='482 of 850';c.note='Accounts for the last 2 years not yet filed. 2 late payments on record'}
  return c}
function esc2(s){return String(s||'')}
function verifyState(d){if(d.custConfirm==='Declined')return 'Customer declined';return checks(d).filter(function(x){return !x.opt}).every(function(x){return x.state==='ok'})?'Verified':'Checks open'}
function verifyBadge(d){var v=verifyState(d),n=checks(d).filter(function(x){return !x.opt&&x.state==='ok'}).length;return badge(v,v==='Checks open'?n+' of 3 required':v)}
function verifyList(d){var I={ok:'check',warn:'clock',bad:'x',opt:'info'},c=checks(d),row=function(x){return '<li><span class="vi '+x.state+'">'+ic(I[x.state])+'</span><div><div class="ink b">'+esc(x.label)+'</div><div class="small muted">'+esc(x.detail)+'</div></div></li>'};
  return '<ul class="vlist">'+c.filter(function(x){return !x.opt}).map(row).join('')+'</ul><div class="vsub">Optional</div><ul class="vlist">'+c.filter(function(x){return x.opt}).map(row).join('')+'</ul>'}
function matchTab(d,tab){return tab==='All'||d.status===tab||activity(d)===tab}

/* ---------- territories and approvals ----------
   Partner Managers see partners in their own territory; the partner's own manager makes changes.
   Deals, applications, tier changes and payouts go: Partner Manager, then Irfan Halim, then Hannah Lau. */
function canSeePartner(p){var u=me();return !!(u&&isStaff()&&p&&(u.all||covers(u,p.country)))}
function ownsPartner(p){var u=me();return !!(u&&p&&effPm(p.pmId)===u.id)}
function pmName(id){var x=staffById(id);return x?x.name:'Not assigned'}
function ownerChip(id){var x=staffById(id),u=me(),mine=!!(u&&u.id===id);if(!x)return '<span class="muted">Not assigned</span>';
  if(x.status==='Left')return '<span class="own left"><span class="av xs">'+initials(x.name)+'</span><span>'+esc(x.name)+'</span><span class="you">Left</span></span>';
  return '<span class="own'+(mine?' me':'')+'"><span class="av xs">'+initials(x.name)+'</span><span>'+esc(x.name)+'</span>'+(mine?'<span class="you">You</span>':'')+'</span>'}
function showScope(){var u=me();return !!(u&&isStaff()&&S.partners.some(ownsPartner))}
function inScope(p){return !showScope()||(ui.f.scope||'all')==='all'||ownsPartner(p)}
function scopeCtl(){if(!showScope())return '';var u=me(),cur=ui.f.scope||'all';
  return '<div class="seg" role="group" aria-label="Show partners">'+[['mine','My partners'],['all',u.all||u.terrs.length>1?'All partners':'All in '+u.territory]].map(function(o){return '<button type="button" aria-pressed="'+(cur===o[0])+'" data-act="scope" data-s="'+o[0]+'">'+esc(o[1])+'</button>'}).join('')+'</div>'}
function stepDots(it){var a=it.o.appr.step;return '<span class="sdots" aria-hidden="true">'+[0,1,2].map(function(i){return '<i class="'+(i<a?'ok':i===a?'cur':'')+'"></i>'}).join('')+'</span>'}
function seeDeal(d){return canSeePartner(partnerById(d.partnerId))}
function wdays(from){var d=parseD(from),n=0;while(d<T0){d.setDate(d.getDate()+1);var w=d.getDay();if(w!==0&&w!==6)n++}return n}
function chainFor(pm){return [effPm(pm),effPm(APPROVER2),APPROVER3]}
function apItems(){var out=[];
  S.deals.forEach(function(d){if(d.status==='Pending'&&d.appr){var p=partnerById(d.partnerId);out.push({k:'deal',id:d.id,o:d,p:p,pm:p.pmId,title:d.customer,sub:d.id+' · '+mon(d.value,d.partnerId),type:'Deal registration'})}});
  S.applications.forEach(function(a){if(a.status==='New'&&a.appr)out.push({k:'app',id:a.id,o:a,p:{country:a.country,name:a.company,pmId:a.pmId},pm:a.pmId,title:a.company,sub:a.id+' · '+a.type,type:'Partner application'})});
  S.partners.forEach(function(p){if(p.tierReq)out.push({k:'tier',id:p.id,o:p.tierReq,p:p,pm:p.pmId,title:p.name,sub:p.tier+' to '+p.tierReq.to,type:'Tier change'})});
  S.commissions.forEach(function(c){if(c.status==='Invoice submitted'&&c.appr){var p=partnerById(c.partnerId);out.push({k:'pay',id:c.id,o:c,p:p,pm:p.pmId,title:p.name+' · '+mon(c.amount,c.partnerId),sub:c.customer+' · '+c.dealId,type:'Commission payout'})}});
  return out}
function apItem(k,id){return apItems().filter(function(x){return x.k===k&&x.id===id})[0]||null}
function apWho(it){return chainFor(it.pm)[it.o.appr.step]}
function myTurn(it){var u=me();return !!(it&&u&&isStaff()&&apWho(it)===u.id)}
function canSeeItem(it){var u=me();return !!(u&&isStaff()&&(u.all||covers(u,it.p.country)))}
function myQueue(){return apItems().filter(myTurn)}
function apDue(it){var n=wdays(it.o.appr.since);return n>=4?'Overdue':n>=2?'Reminder sent':''}
function apWaitCell(it){var n=wdays(it.o.appr.since),late=apDue(it)==='Overdue';return '<span'+(late?' class="b" style="color:var(--danger)"':'')+'>'+fmtD(it.o.appr.since)+'</span><span class="sub"'+(late?' style="color:var(--danger)"':'')+'>'+(n===0?'Today':n+' working day'+(n===1?'':'s'))+(late?' · overdue':'')+'</span>'}
function apStepText(it){return 'Step '+(it.o.appr.step+1)+' of 3 · '+pmName(apWho(it))}
var STEP_ROLE=['Owner review','Second approval','Final approval'];
function tracker(it){var a=it.o.appr,ch=chainFor(it.pm),due=apDue(it),u=me();
  var notes=a.log.filter(function(l){return l.decision!=='Approved'||l.note});
  return '<ol class="stepper">'+ch.map(function(sid,i){var done=a.log.filter(function(l){return l.step===i&&l.decision==='Approved'}).slice(-1)[0],cur=i===a.step,st=i<a.step?'ok':cur?'cur':'todo',n=wdays(a.since);
    var line=i<a.step?'Approved '+(done?fmtD(done.at):''):cur?(sid===u.id?'Waiting for you':'Waiting')+' · '+(n===0?'today':n+' working day'+(n===1?'':'s'))+(due==='Overdue'?' · overdue':''):'';
    return '<li class="'+st+'"><span class="dotc">'+(st==='ok'?ic('check'):(i+1))+'</span><div class="stx"><div class="rl">'+STEP_ROLE[i]+'</div><div class="ink b">'+esc(pmName(sid))+'</div>'+(line?'<div class="small'+(cur&&due==='Overdue'?'" style="color:var(--danger)':' muted')+'">'+line+'</div>':'')+'</div></li>'}).join('')+'</ol>'+
    (notes.length?'<div class="small muted" style="margin-top:12px">'+notes.map(function(l){return esc(l.decision)+' by '+esc(l.by)+', '+fmtD(l.at)+(l.note?': '+esc(l.note):'')}).join('<br>')+'</div>':'')}
function apButtons(it,lbl){if(!myTurn(it))return '';var a=it.o.appr;
  return btn('Reject',{cls:'btn-d',act:'apNote',k:it.k,id:it.id,d:'Rejected'})+(a.step>0?btn('Send back',{act:'apNote',k:it.k,id:it.id,d:'Sent back'}):'')+btn(lbl||('Approve · step '+(a.step+1)+' of 3'),{cls:'btn-p',icon:'check',act:'apApprove',k:it.k,id:it.id})}
function apWaitingNote(it){return ''}
function notifyStaff(to,text,k,id){S.notifications.unshift({id:'N'+(S.seq.note++),to:to,at:nowISO(),read:false,text:text,view:k==='deal'?'deal':k==='content'?'a-content':k==='partners'?'a-partners':k==='payouts'?'a-payouts':'a-approvals',ref:k==='deal'?id:null})}
function decide(k,id,dec,note){var it=apItem(k,id);if(!it)return;var a=it.o.appr,u=me(),label=it.type+': '+it.title;
  a.log.push({step:a.step,by:u.name,at:today(),decision:dec,note:note||''});
  var hist=function(t){if(k==='deal')it.o.history.push({at:today(),by:u.name,text:t})};
  if(dec==='Approved'&&a.step<2){a.step++;a.since=today();var nx=pmName(apWho(it));notifyStaff(apWho(it),'Waiting for your approval: '+label+'.',k,id);
    hist('Approved step '+a.step+' of 3'+(note?': '+note:'')+'. Sent to '+nx);log('Approved step '+a.step+' of 3 for '+label);toast('Approved. Sent to '+nx+' for step '+(a.step+1)+' of 3.');return}
  if(dec==='Sent back'){a.step=Math.max(0,a.step-1);a.since=today();notifyStaff(apWho(it),'Sent back to you: '+label+(note?' ('+note+')':''),k,id);
    hist('Sent back to '+pmName(apWho(it))+(note?': '+note:''));log('Sent back '+label+' to step '+(a.step+1));toast('Sent back to '+pmName(apWho(it))+'.');return}
  if(dec==='Approved'){hist('Final approval');log('Final approval for '+label);FINAL[k](it);return}
  hist('Rejected: '+note);log('Rejected '+label+': '+note);REJECT[k](it,note)}
var FINAL={
  deal:function(it){var d=it.o;if(d.awardIntent)CONFIRM.award(d.id);else CONFIRM.approve(d.id)},
  app:function(it){var a=it.o;a.status='Approved';
    var np={id:'P'+String(S.seq.partner++).padStart(3,'0'),name:a.company,country:a.country,city:a.country,type:a.type,tier:'Registered',status:'Active',joined:today(),pmId:a.pmId,domain:a.email.split('@')[1].toLowerCase()};S.partners.push(np);
    S.users.push({demoNew:true,id:'U'+(S.seq.user++),partnerId:np.id,name:a.contact,email:a.email.toLowerCase(),role:'Partner Admin',mfa:'Not set up',status:'Invited',last:null});
    notifyP(np.id,'Welcome to the Northwind Security Partner Program. Your Partner Manager is '+pmName(a.pmId)+'.','home');
    toast(a.company+' approved. A portal invitation was sent to '+a.email+'.')},
  tier:function(it){var p=it.p,old=p.tier;p.tier=p.tierReq.to;p.tierReq=null;notifyP(p.id,'Your partner tier changed from '+old+' to '+p.tier+'.','program');toast(p.name+' is now '+p.tier+'.')},
  pay:function(it){var c=it.o;c.status='Ready for payment';c.approvedAt=today();notifyStaff(FINANCE,'Ready to pay: '+partnerById(c.partnerId).name+', '+mon(c.amount,c.partnerId)+' for '+c.customer+'.','payouts',null);notifyP(c.partnerId,'Your commission for '+c.customer+' is approved. Northwind Security Finance is processing the payment.','commissions');toast('Payout approved. Sent to '+pmName(FINANCE)+' in Finance for payment.')}
};
var REJECT={
  deal:function(it,note){var d=it.o;d.status='Rejected';d.rejectReason=note;notifyP(d.partnerId,'Registration not approved: '+d.customer+'.','deals',d.id);toast('Registration rejected. The partner has been notified.')},
  app:function(it){it.o.status='Rejected';toast('Application rejected.')},
  tier:function(it){it.p.tierReq=null;toast('Tier change rejected.')},
  pay:function(it,note){var c=it.o;c.status='Awaiting invoice';c.invoice=null;c.appr=null;notifyP(c.partnerId,'Your invoice for '+c.customer+' was not accepted: '+note,'commissions');toast('Payout rejected. The partner was asked for a new invoice.')}
};
function apSortKey(it,k){return k==='type'?it.type:k==='title'?it.title.toLowerCase():k==='owner'?pmName(it.pm):k==='step'?it.o.appr.step:it.o.appr.since}
function apSorted(list){var so=ui.apSort||{key:'since',dir:1};return list.slice().sort(function(a,b){var x=apSortKey(a,so.key),y=apSortKey(b,so.key);if(x===y){x=a.o.appr.since;y=b.o.appr.since}return (x<y?-1:x>y?1:0)*so.dir})}
function apTh(label,key){var so=ui.apSort||{key:'since',dir:1},on=so.key===key;return '<th aria-sort="'+(on?(so.dir>0?'ascending':'descending'):'none')+'"><button type="button" class="sort'+(on?' on':'')+'" data-act="apSort" data-k="'+key+'">'+label+ic(on?(so.dir>0?'sortU':'sortD'):'sort')+'</button></th>'}
function apOrderBar(){var so=ui.apSort||{key:'since',dir:1},w=so.key==='since';
  return '<div class="tbar"><span class="small muted">Order</span><div class="seg" role="group" aria-label="Order by date">'+[[1,'Oldest first'],[-1,'Newest first']].map(function(o){return '<button type="button" aria-pressed="'+(w&&so.dir===o[0])+'" data-act="apOrder" data-d="'+o[0]+'">'+o[1]+'</button>'}).join('')+'</div>'+(w?'':'<span class="small muted">Sorted by '+esc({type:'type',title:'item',owner:'owner',step:'current step'}[so.key])+'</span>')+'</div>'}
function apTable(list,emptyTitle){
  if(!list.length)return empty(emptyTitle||'Nothing waiting','Items appear here when it is your turn to approve.','checkc');
  list=apSorted(list);
  return apOrderBar()+'<div class="tw"><table class="tb"><thead><tr>'+apTh('Type','type')+apTh('Item','title')+apTh('Owner','owner')+apTh('Current step','step')+apTh('Waiting since','since')+'<th><span class="sr">Action</span></th></tr></thead><tbody>'+list.map(function(it){
    return '<tr><td class="nowrap">'+esc(it.type)+'</td><td><span class="ink b">'+esc(it.title)+'</span><span class="sub">'+esc(it.sub)+'</span></td><td class="nowrap">'+ownerChip(it.pm)+'</td><td class="nowrap">'+stepDots(it)+(myTurn(it)?'<span class="b ink">You</span>':esc(pmName(apWho(it))))+'<span class="sub">Step '+(it.o.appr.step+1)+' of 3</span></td><td class="nowrap">'+apWaitCell(it)+'</td><td class="r nowrap">'+btn(myTurn(it)?'Review':'View',{cls:'btn-s'+(myTurn(it)?' btn-p':''),act:'apOpen',k:it.k,id:it.id})+'</td></tr>'}).join('')+'</tbody></table></div>'}
function myNtf(){var u=me();if(!isStaff()){var pid=myPartner().id;return S.notifications.filter(function(n){return n.to==='partner'&&(!n.pid||n.pid===pid)})}
  return S.notifications.filter(function(n){if(n.to===u.id)return true;if(n.to!=='staff')return false;var d=n.ref&&dealById(n.ref);return !d||seeDeal(d)})}
function isLocked(r){return tierRank(myPartner().tier)<tierRank(r.minTier)}

/* ---------- icons ---------- */
var IC={
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  home:'<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>',
  news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h3"/>',
  brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  building:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
  grad:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  mega:'<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  down:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  up:'<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check:'<path d="m5 12 5 5 9-10"/>',
  checkc:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  alert:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  chevR:'<path d="m9 6 6 6-6 6"/>',
  chevL:'<path d="m15 6-6 6 6 6"/>',
  chevD:'<path d="m6 9 6 6 6-6"/>',
  sort:'<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',
  sortU:'<path d="M8 14l4-4 4 4"/>',
  sortD:'<path d="M8 10l4 4 4-4"/>',
  out:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  swap:'<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  shield:'<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  inbox:'<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>'
};
function ic(n,cls){return '<svg'+(cls?' class="'+cls+'"':'')+' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>'}
var MS='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="9" height="9" fill="#F25022"/><rect x="13" y="2" width="9" height="9" fill="#7FBA00"/><rect x="2" y="13" width="9" height="9" fill="#00A4EF"/><rect x="13" y="13" width="9" height="9" fill="#FFB900"/></svg>';

var TONE={Pending:'warn',Approved:'info',Won:'ok',Lost:'neu',Expired:'bad',Rejected:'bad',Paid:'ok','Awaiting invoice':'warn','Invoice submitted':'info','Ready for payment':'info','Payment in progress':'info',
  Open:'info','In progress':'warn','Waiting on you':'warn',Resolved:'ok',Active:'ok',Invited:'warn',New:'info',Completed:'ok','Not started':'neu','In review':'warn',Healthy:'ok','Attention needed':'warn','Update due':'warn',Inactive:'bad',Verified:'ok','Customer declined':'bad','Checks open':'warn','Info requested':'warn','Project closed':'neu',Security:'bad',Activity:'neu'};
function badge(s,label){return '<span class="bdg t-'+(TONE[s]||'neu')+'">'+esc(label||s)+'</span>'}
function tierB(t){return '<span class="tier tier-'+esc(t)+'">'+esc(t)+'</span>'}
function btn(label,o){o=o||{};var a='';
  Object.keys(o).forEach(function(k){if(k!=='cls'&&k!=='icon'&&k!=='type')a+=' data-'+k+'="'+esc(o[k])+'"'});
  return '<button type="'+(o.type||'button')+'" class="btn '+(o.cls||'')+'"'+a+'>'+(o.icon?ic(o.icon):'')+esc(label)+'</button>'}
function ph(crumbs,title,desc,actions){
  var c='';
  if(crumbs)crumbs=crumbs.filter(function(x){return !x[1]||allowed(x[1])});
  if(crumbs&&crumbs.length>1)c='<nav class="crumbs" aria-label="Breadcrumb">'+crumbs.map(function(x,i){return (i?ic('chevR'):'')+(x[1]?'<button type="button" data-act="nav" data-v="'+x[1]+'">'+esc(x[0])+'</button>':'<span aria-current="page">'+esc(x[0])+'</span>')}).join('')+'</nav>';
  return c+'<div class="ph"><div class="t"><h1>'+title+'</h1>'+(desc?'<p>'+desc+'</p>':'')+'</div>'+(actions?'<div class="a">'+actions+'</div>':'')+'</div>';
}
function panel(title,body,o){o=o||{};return '<section class="pn"'+(o.id?' id="'+o.id+'"':'')+'>'+(title?'<div class="pn-h"><h2>'+title+'</h2>'+(o.meta?'<span class="meta">'+o.meta+'</span>':'')+(o.actions||'')+'</div>':'')+(o.flush?body:'<div class="pn-b">'+body+'</div>')+(o.foot?'<div class="pn-f">'+o.foot+'</div>':'')+'</section>'}
function tabs(key,list,counts){var cur=ui.tab[key]||list[0];return '<div class="tabs" role="tablist">'+list.map(function(t){return '<button type="button" role="tab" class="tab" aria-selected="'+(t===cur)+'" data-act="tab" data-k="'+key+'" data-t="'+esc(t)+'">'+esc(t)+(counts&&counts[t]!=null?'<span class="c">'+counts[t]+'</span>':'')+'</button>'}).join('')+'</div>'}
function curTab(key,def){return ui.tab[key]||def}
function searchBox(key,ph_){return '<label class="search" for="q-'+key+'">'+ic('search')+'<span class="sr">Search</span><input id="q-'+key+'" type="search" placeholder="'+esc(ph_)+'" value="'+esc(ui.q[key]||'')+'" data-input="q" data-k="'+key+'" autocomplete="off"></label>'}
function empty(title,text,icon){return '<div class="empty">'+ic(icon||'inbox')+'<h3>'+esc(title)+'</h3>'+(text?'<p>'+esc(text)+'</p>':'')+'</div>'}
function paged(key,list){var p=ui.pg[key]||1;var pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));if(p>pages)p=pages;ui.pg[key]=p;return {rows:list.slice((p-1)*PAGE_SIZE,p*PAGE_SIZE),p:p,pages:pages,total:list.length}}
function pager(key,pg){if(!pg.total)return '';var a=(pg.p-1)*PAGE_SIZE+1,b=Math.min(pg.total,pg.p*PAGE_SIZE);
  return '<div class="pager"><span>Showing '+a+'-'+b+' of '+pg.total+'</span><span class="sp"></span><button type="button" class="btn btn-s" data-act="page" data-k="'+key+'" data-d="-1"'+(pg.p<=1?' disabled':'')+'>'+ic('chevL')+'Previous</button><span>Page '+pg.p+' of '+pg.pages+'</span><button type="button" class="btn btn-s" data-act="page" data-k="'+key+'" data-d="1"'+(pg.p>=pg.pages?' disabled':'')+'>Next'+ic('chevR')+'</button></div>'}

/* ---------- auth pages ---------- */
function envStrip(){
  var staff=isStaff();
  return '<div class="env" role="note"><strong>Demo environment</strong><span class="hs">Fictional sample data only. Changes are saved in this browser.</span><span class="sp"></span>'+
    '<button type="button" data-act="guide">Demo guide</button>'+
    (staff?'<label class="envsel">Viewing as <select data-change="asStaff" aria-label="Switch Northwind Security staff user">'+(function(){var top=['S-MAR','S-IRF','S-HAN'],live=STAFF_LIST.filter(function(x){return x.status!=='Left'}),opt=function(x){return '<option value="'+x.id+'"'+(x.id===me().id?' selected':'')+'>'+esc(x.name)+'</option>'};return '<optgroup label="Main demo">'+top.map(staffById).filter(function(x){return x&&x.status!=='Left'}).map(opt).join('')+'</optgroup>'+'<optgroup label="Other staff">'+live.filter(function(x){return top.indexOf(x.id)<0}).map(opt).join('')+'</optgroup>'})()+'</select></label>':'')+
    (S.session?'<button type="button" data-act="quickSwitch">'+(staff?'Switch to partner view':'Switch to Northwind Security staff view')+'</button>':'')+
    '<button type="button" data-act="resetDemo">Reset data</button></div>';
}
var BUILD='Demo build 16 Oct 2026';
function authFoot(){return '<div class="auth-foot"><span>© '+YNOW+' Northwind Security (fictional company)</span><span>'+BUILD+'</span><button type="button" class="link" data-act="legal">Privacy notice</button><button type="button" class="link" data-act="legal">Terms of use</button><button type="button" class="link" data-act="legal">Security</button></div>'}
function logoBlock(){return '<div class="auth-logo"><img src="'+LOGO+'" alt="Northwind Security"><i></i><span>Partner Portal</span></div>'}
function authView(){
  if(ui.auth==='apply'||ui.auth==='applied')return applyView();
  if(ui.auth==='mfa')return '<div class="auth">'+logoBlock()+mfaCard()+authFoot()+'</div>';
  var err=ui.authErr?'<div class="al al-bad" role="alert">'+ic('alert')+'<span>'+esc(ui.authErr)+'</span></div>':'';
  var demo=[['aina@'+DOMAIN,'Aina Rahman','Partner Admin · Contoh Tech Sdn Bhd'],['daniel@'+DOMAIN,'Daniel Lim','Sales · Contoh Tech Sdn Bhd'],['priya@'+DOMAIN,'Priya Nair','Technical · Contoh Tech Sdn Bhd'],['hafiz@'+DOMAIN,'Hafiz Omar','Finance · Contoh Tech Sdn Bhd'],['farah@nusantaracyber.example','Farah Iskandar','Partner Admin · Nusantara Cyber Sdn Bhd · new, no deals yet'],['-','Partners in other territories'],['daryl@merlionsecure.example','Daryl Tan','Partner Admin · Merlion Secure Pte Ltd · Singapore'],['nuwan@kandysystems.example','Nuwan Perera','Partner Admin · Kandy Systems · Sri Lanka'],['jordan@libertyshield.example','Jordan Hayes','Partner Admin · Liberty Shield Security LLC · United States'],].concat((function(){var nu=S.users.filter(function(x){return x.demoNew});return nu.length?[['-','Partners approved in this demo']].concat(nu.map(function(x){return [x.email,x.name,x.role+' · '+(partnerById(x.partnerId)||{}).name]})):[]})()).concat([['-','Northwind Security staff']]).concat(STAFF_LIST.map(function(x){return [x.email,x.name,x.status==='Left'?'Left Northwind Security · account disabled':staffLabel(x)]}))
    .map(function(a){if(a[0]==='-')return '<div class="grp-h">'+a[1]+'</div>';return '<div class="li"><div><div class="b ink">'+esc(a[1])+'</div><div class="small muted">'+esc(a[2])+'</div></div><button type="button" class="btn btn-s" data-act="fillDemo" data-email="'+esc(a[0])+'">Use</button></div>'}).join('');
  return '<div class="auth">'+logoBlock()+
  '<form class="auth-card" data-form="login" novalidate><div class="stack" style="gap:4px"><h1>Sign in</h1><p class="muted">Use the work email your partner administrator invited.</p></div>'+
  '<button type="button" class="btn" style="height:38px" data-act="sso">'+MS+'Continue with Microsoft</button><p class="small muted" style="margin-top:-8px">For Northwind Security employees.</p>'+
  '<div class="or">or sign in with email</div>'+
  '<div class="fld"><label for="login-email">Work email</label><input id="login-email" name="email" type="email" autocomplete="username" value="'+esc(ui.loginEmail)+'"></div>'+
  '<div class="fld"><label for="login-pass" class="row" style="justify-content:space-between"><span>Password</span><button type="button" class="link small" data-act="forgot">Forgot password?</button></label><input id="login-pass" name="password" type="password" autocomplete="current-password"></div>'+
  err+'<button class="btn btn-p" style="height:38px" type="submit">Sign in</button>'+
  '<p class="small muted">Not a partner yet? <button type="button" class="link" data-act="gotoApply">Apply to the partner program</button></p></form>'+
  '<div class="demo-box"><div class="pn-h" style="min-height:40px"><h2 class="small" style="font-size:12px">Demo accounts</h2><span class="meta">any password works</span></div><div class="grp-h" style="border-top:0">Partner users · Malaysia</div><div class="list">'+demo+'</div></div>'+
  authFoot()+'</div>';
}
function mfaCard(){
  var u=ui.pending,locked=ui.mfaFails>=5;
  var inputs='';for(var i=0;i<6;i++)inputs+='<input id="mfa-'+i+'" inputmode="numeric" maxlength="1" aria-label="Digit '+(i+1)+'" autocomplete="one-time-code"'+(locked?' disabled':'')+'>';
  var err=locked?'<div class="al al-bad" role="alert">'+ic('lock')+'<span>Too many incorrect codes. The account is locked for 15 minutes and your administrator has been notified. <button type="button" class="link" data-act="unlock">Unlock (demo)</button></span></div>':(ui.authErr?'<div class="al al-bad" role="alert">'+ic('alert')+'<span>'+esc(ui.authErr)+'</span></div>':'');
  return '<form class="auth-card" data-form="mfa" novalidate><div class="stack" style="gap:4px"><h1>Two-step verification</h1><p class="muted">Enter the 6-digit code from your authenticator app for <span class="ink b">'+esc(u.email)+'</span>.</p></div>'+
  '<fieldset style="border:0;padding:0;margin:0"><legend class="sr">Verification code</legend><div class="codes">'+inputs+'</div></fieldset>'+err+
  '<label class="chk" for="mfa-trust"><input id="mfa-trust" type="checkbox">Remember this browser for 30 days</label>'+
  '<button class="btn btn-p" style="height:38px" type="submit"'+(locked?' disabled':'')+'>Verify</button>'+
  '<div class="row" style="justify-content:space-between"><button type="button" class="link" data-act="passkey"'+(locked?' disabled':'')+'>Use a passkey</button><button type="button" class="link" data-act="backToLogin">Use a different account</button></div>'+
  '<p class="small muted">Demo: any 6 digits work. 000000 shows the incorrect-code flow.</p></form>';
}
function applyView(){
  var top='<header class="pub-hdr"><button type="button" class="brand" data-act="backToLogin" aria-label="Northwind Security Partner Portal"><img src="'+LOGO+'" alt="Northwind Security"><i></i><span>Partner Program</span></button><span class="sp"></span><button type="button" class="btn" data-act="backToLogin">Sign in</button></header>';
  if(ui.auth==='applied'){var a=ui.applied;
    return top+'<div class="apply" style="grid-template-columns:minmax(0,640px);justify-content:center">'+panel('Application submitted','<div class="stack"><div class="al al-ok">'+ic('checkc')+'<span>We received your application. Reference <span class="b">'+esc(a.id)+'</span>.</span></div><p>Your Partner Manager, '+esc(pmName(a.pmId))+', and two Northwind Security approvers review your application, usually within 3 business days. You will receive an email at <span class="b ink">'+esc(a.email)+'</span> with the outcome.</p><h3>What happens next</h3><ol class="bullets"><li>Review by your Partner Manager, then two Northwind Security approvers</li><li>Partner agreement sent for electronic signature</li><li>Portal invitation for your partner administrator</li></ol></div>',{foot:btn('Return to sign in',{cls:'btn-p',act:'backToLogin'})})+'</div>';
  }
  var types=[['Reseller','Buy at partner price and resell to your customers.'],['Referral partner','Introduce opportunities. Northwind Security sells and you earn a referral fee.'],['MSP / IT provider','Bundle Northwind Security MDR and SOC services into your managed services.'],['Distributor','Recruit and support resellers in your country or region.']];
  var opts=types.map(function(t,i){return '<label class="opt" for="ap-type-'+i+'"><input type="radio" name="type" id="ap-type-'+i+'" value="'+esc(t[0])+'"'+(i===0?' checked':'')+'><span><span class="b ink">'+esc(t[0])+'</span><span class="d">'+esc(t[1])+'</span></span></label>'}).join('');
  var err=ui.applyErr?'<div class="al al-bad" role="alert">'+ic('alert')+'<span>'+esc(ui.applyErr)+'</span></div>':'';
  var inv=ui.invite?(S.invites||[]).filter(function(x){return x.id===ui.invite})[0]:null,pv=function(k){return inv&&inv[k]?' value="'+esc(inv[k])+'"':''};
  var pmField=inv?'<div class="fld"><label>Your Northwind Security Partner Manager</label><input value="'+esc(pmName(inv.pmId))+'" disabled><input type="hidden" name="pmId" value="'+inv.pmId+'"><span class="hint">Filled in from your invitation.</span></div>':
    '<div class="fld"><label for="ap-pm" class="req">Your Northwind Security Partner Manager</label><select id="ap-pm" name="pmId"><option value="">Choose the person you have been speaking to</option>'+TERRITORIES.map(function(t){return '<optgroup label="'+t+'">'+pmsFor(t).map(function(x){return '<option value="'+x.id+'">'+esc(x.name)+'</option>'}).join('')+'</optgroup>'}).join('')+'</select><span class="hint">Must be a Partner Manager for your country.</span></div>';
  var form='<form data-form="apply" novalidate>'+(inv?'<div class="pn-b" style="padding-bottom:0"><div class="al al-ok">'+ic('mail')+'<span>You were invited by <span class="b">'+esc(pmName(inv.pmId))+'</span>, Northwind Security Partner Manager for '+esc(inv.country)+'.</span></div></div>':'')+'<div class="pn-b stack" style="gap:20px">'+
  '<div class="fsec"><div class="fsec-h"><h2>Company</h2></div><div class="fgrid">'+
  '<div class="fld"><label for="ap-company" class="req">Registered company name</label><input id="ap-company" name="company"'+pv('company')+'></div>'+
  '<div class="fld"><label for="ap-reg" class="req">Registration number</label><input id="ap-reg" name="reg"><span class="hint">SSM, ACRA UEN or Companies House number</span></div>'+
  '<div class="fld"><label for="ap-country">Country</label><select id="ap-country" name="country">'+TERRITORIES.filter(function(t){return !inv||t===inv.country}).map(function(t){return '<option>'+t+'</option>'}).join('')+'</select></div>'+
  '<div class="fld"><label for="ap-web">Website</label><input id="ap-web" name="website" type="url" placeholder="https://"></div>'+pmField+'</div></div>'+
  '<div class="fsec"><div class="fsec-h"><h2>Partnership type</h2></div><div class="opts">'+opts+'</div></div>'+
  '<div class="fsec"><div class="fsec-h"><h2>Primary contact</h2><p class="small muted">This person becomes your partner administrator.</p></div><div class="fgrid">'+
  '<div class="fld"><label for="ap-name" class="req">Full name</label><input id="ap-name" name="contact"'+pv('contact')+'></div>'+
  '<div class="fld"><label for="ap-title">Job title</label><input id="ap-title" name="title"></div>'+
  '<div class="fld"><label for="ap-email" class="req">Work email</label><input id="ap-email" name="email" type="email"'+pv('email')+'></div>'+
  '<div class="fld"><label for="ap-phone">Phone</label><input id="ap-phone" name="phone" type="tel"></div></div></div>'+
  '<div class="fsec"><div class="fsec-h"><h2>Verification</h2></div>'+
  '<div class="fld"><label for="ap-doc">Company registration certificate</label><input id="ap-doc" name="doc" type="file" accept=".pdf,.png,.jpg,.jpeg"><span class="hint">PDF or image, up to 10 MB. Files are scanned for malware and stored encrypted.</span></div>'+
  '<label class="chk" for="ap-consent"><input id="ap-consent" name="consent" type="checkbox"><span>I consent to Northwind Security processing this information to assess the application, as described in the Privacy Notice under the Personal Data Protection Act 2010.</span></label></div>'+
  err+'</div><div class="pn-f" style="justify-content:flex-end">'+btn('Fill sample details (demo)',{cls:'btn-g',act:'fillApply'})+'<span class="sp"></span>'+btn('Cancel',{act:'backToLogin'})+btn('Submit application',{cls:'btn-p',type:'submit'})+'</div></form>';
  var side=panel('Why partner with Northwind Security','<ul class="bullets"><li>Margins from 10% up to 25% by tier (illustrative sample rates)</li><li>90-day deal registration protection</li><li>Sales and technical certification</li><li>Ready-made campaigns and co-branded material</li><li>Demo licences and marketing funds at higher tiers</li></ul>',{foot:'<span>Questions? Email partners@example.com</span>'});
  return top+'<div class="apply"><div class="col"><div class="ph"><div class="t"><h1>Apply to the Northwind Security Partner Program</h1><p>Takes about 5 minutes. All fields marked * are required.</p></div></div><section class="pn">'+form+'</section></div><div class="col">'+side+'</div></div>';
}

/* ---------- shell ---------- */
var NAV_P=[
  {items:[['home','Home','home'],['program','Partner program','award'],['news','Announcements','news']]},
  {h:'Sell',items:[['deals','Deal registrations','brief'],['products','Products','box'],['customers','Customers','building']]},
  {h:'Enable',items:[['training','Training','grad'],['resources','Resource library','folder'],['marketing','Marketing','mega']]},
  {h:'Earn',items:[['commissions','Commissions','wallet']]},
  {h:'Help',items:[['cases','Support cases','life']]},
  {h:'Administration',items:[['settings','Company settings','gear']]}
];
var NAV_S=[
  {items:[['a-home','Overview','home'],['a-approvals','My approvals','checkc']]},
  {h:'Partner management',items:[['a-deals','Deal registrations','brief'],['a-partners','Partners','building'],['a-payouts','Payouts','wallet'],['a-cases','Support cases','life']]},
  {h:'Content',items:[['a-content','Content','folder']]},
  {h:'Administration',items:[['a-team','Team','users']]},
  {h:'Governance',items:[['a-audit','Audit log','list']]}
];
var PARENT={'deal-new':'deals','product':'products','news-item':'news','case':'cases'};
function activeNav(){var v=ui.v;if(isStaff()){if(v==='deal')return 'a-deals';if(v==='case')return 'a-cases';if(v==='news-item')return 'a-content';return v}if(v==='deal')return 'deals';return PARENT[v]||v}
function navCount(v){
  if(v==='news')return newsFor().filter(function(n){return S.newsRead.indexOf(n.id)<0}).length;
  if(v==='cases')return S.tickets.filter(function(t){return t.partnerId===myPartner().id&&t.status==='Waiting on you'}).length;
  if(v==='a-approvals')return myQueue().length;
  if(v==='a-deals')return S.deals.filter(function(d){return seeDeal(d)&&(d.status==='Pending'||d.extensionRequested)}).length;
  if(v==='a-partners')return apItems().filter(function(it){return it.k==='app'&&canSeeItem(it)}).length;
  if(v==='a-payouts')return apItems().filter(function(it){return it.k==='pay'&&canSeeItem(it)}).length;
  if(v==='a-cases')return S.tickets.filter(function(t){return t.status==='Open'&&canSeePartner(partnerById(t.partnerId))}).length;
  return 0;
}
function shell(){
  var u=me(),staff=isStaff(),act=activeNav();
  var groups=(staff?NAV_S:NAV_P).map(function(g){
    var items=g.items.filter(function(it){return allowed(it[0])});
    if(!items.length)return '';
    return '<div class="grp">'+(g.h?'<div class="h">'+esc(g.h)+'</div>':'')+items.map(function(it){var c=navCount(it[0]);
      return '<button type="button" class="ni" data-act="nav" data-v="'+it[0]+'"'+(act===it[0]?' aria-current="page"':'')+'>'+ic(it[2])+'<span>'+esc(it[1])+'</span>'+(c?'<span class="c">'+c+'</span>':'')+'</button>'}).join('')+'</div>';
  }).join('');
  var mypm=staffById(myPartner().pmId);
  var sideFoot=staff?'<div class="side-f"><span class="l">'+(u.territory||hasRole('Approver')?'Territory':'Role')+'</span><span class="ink b">'+esc(staffLabel(u))+'</span><span class="muted">Signed in with Microsoft Entra ID</span></div>':
    '<div class="side-f"><span class="l">Your Partner Manager</span><span class="ink b">'+esc(mypm?mypm.name:'Not assigned')+'</span><span class="muted">'+esc(mypm?mypm.email:'partners@example.com')+'</span></div>';
  var unread=myNtf().filter(function(n){return !n.read}).length;
  var sub=staff?'Northwind Security · '+staffLabel(u):myPartner().name;
  return envStrip()+
  '<header class="hdr"><button type="button" class="ib menu-b" aria-label="Open navigation" data-act="toggleNav">'+ic('menu')+'</button>'+
  '<button type="button" class="brand" data-act="nav" data-v="'+(staff?'a-home':'home')+'" aria-label="Home"><img src="'+LOGO+'" alt="Northwind Security"><i></i><span>'+(staff?'Partner Portal Admin':'Partner Portal')+'</span></button>'+
  '<div class="gsearch"><label class="search" for="gsearch">'+ic('search')+'<span class="sr">Search the portal</span><input id="gsearch" type="search" placeholder="Search deals, products, resources, cases" value="'+esc(ui.gq)+'" data-input="gsearch" autocomplete="off"></label><div id="gres"></div></div>'+
  '<div class="hdr-r">'+
    '<button type="button" class="ib" aria-label="Help" title="Help" data-act="guide">'+ic('help')+'</button>'+
    '<div class="rel"><button type="button" class="ib" aria-label="Notifications, '+unread+' unread" aria-expanded="'+(ui.dd==='ntf')+'" data-act="dd" data-k="ntf">'+ic('bell')+(unread?'<span class="cnt">'+unread+'</span>':'')+'</button>'+(ui.dd==='ntf'?ntfPanel():'')+'</div>'+
    '<div class="rel"><button type="button" class="acct" aria-expanded="'+(ui.dd==='acct')+'" data-act="dd" data-k="acct"><span class="av'+(staff?' staff':'')+'">'+esc(initials(u.name))+'</span><span class="txt"><span class="n">'+esc(u.name)+'</span><span class="o">'+esc(sub)+'</span></span>'+ic('chevD')+'</button>'+(ui.dd==='acct'?acctPanel():'')+'</div>'+
  '</div></header>'+
  '<div class="app'+(ui.navOpen?' navopen':'')+'"><aside class="side" aria-label="Main navigation">'+groups+sideFoot+'</aside><div class="scrim" data-act="toggleNav"></div>'+
  '<div class="main"><main class="page" id="content">'+pageHTML()+'</main>'+
  '<footer class="foot"><span>© '+YNOW+' Northwind Security (fictional company)</span><button type="button" data-act="legal">Privacy notice</button><button type="button" data-act="legal">Terms of use</button><button type="button" data-act="legal">Partner agreement</button><span class="sp"></span><span>Portal version 1.0 · demo</span></footer></div></div>'+
  modalHTML();
}
function ntfPanel(){
  var list=myNtf().slice(0,10);
  return '<div class="dd" style="width:380px;max-width:calc(100vw - 24px)" role="dialog" aria-label="Notifications"><div class="dd-h"><h3 style="flex:1">Notifications</h3><button type="button" class="link small" data-act="readAll">Mark all as read</button></div>'+
  (list.length?list.map(function(n){return '<button type="button" class="ntf'+(n.read?'':' u')+'" data-act="openNotif" data-id="'+n.id+'"><i></i><span><span style="display:block">'+esc(n.text)+'</span><span class="small muted">'+fmtTime(n.at)+'</span></span></button>'}).join(''):empty('No notifications','','bell'))+'</div>';
}
function acctPanel(){
  var u=me(),staff=isStaff();
  return '<div class="dd" role="menu"><div class="dd-h"><span class="av'+(staff?' staff':'')+'">'+esc(initials(u.name))+'</span><span><span class="b ink" style="display:block">'+esc(u.name)+'</span><span class="small muted">'+esc(u.email)+'</span></span></div>'+
  (!staff?'<button type="button" class="dd-i" role="menuitem" data-act="nav" data-v="program">'+ic('award')+'Partner program</button>':'')+
  (isAdminUser()?'<button type="button" class="dd-i" role="menuitem" data-act="nav" data-v="settings">'+ic('gear')+'Company settings</button>':'')+
  '<button type="button" class="dd-i" role="menuitem" data-act="guide">'+ic('help')+'Help and demo guide</button><div class="dd-sep"></div>'+
  '<button type="button" class="dd-i" role="menuitem" data-act="signOut">'+ic('out')+'Sign out</button></div>';
}
function pageHTML(){
  if(!allowed(ui.v)){ui.v=isStaff()?staffHome():'home';ui.id=null}
  var P={home:pHome,program:pProgram,news:pNews,'news-item':pNewsItem,deals:pDeals,deal:pDeal,'deal-new':pDealNew,products:pProducts,product:pProduct,customers:pCustomers,training:pTraining,resources:pResources,marketing:pMarketing,commissions:pCommissions,cases:pCases,'case':pCase,settings:pSettings,
    'a-home':aHome,'a-approvals':aApprovals,'a-deals':aDeals,'a-partners':aPartners,'a-payouts':aPayouts,'a-cases':aCases,'a-content':aContent,'a-audit':aAudit,'a-team':aTeam};
  return P[ui.v]();
}

/* ---------- shared calculations ---------- */
function stats(){
  var ds=myDeals();
  var open=ds.filter(function(d){return d.status==='Pending'||d.status==='Approved'});
  var wonQ=ds.filter(function(d){return d.status==='Won'&&d.closedAt&&quarterOf(d.closedAt)===QNOW});
  var won12=ds.filter(function(d){return d.status==='Won'&&d.closedAt&&daysUntil(d.closedAt)>=-365});
  var comm=S.commissions.filter(function(c){return c.partnerId===myPartner().id&&parseD(c.closedAt).getFullYear()===YNOW});
  return {open:open.length,pending:ds.filter(function(d){return d.status==='Pending'}).length,
    pipeline:open.reduce(function(a,d){return a+d.value},0),wonQ:wonQ.reduce(function(a,d){return a+d.value},0),wonQn:wonQ.length,
    sales12:won12.reduce(function(a,d){return a+d.value},0),
    commY:comm.reduce(function(a,c){return a+c.amount},0),commWait:comm.filter(function(c){return c.status!=='Paid'}).reduce(function(a,c){return a+c.amount},0)};
}
function certCounts(){var tech=S.courses.filter(function(c){return c.id==='C2'&&c.completedAt}).length;return {sales:3,tech:tech}}
function actionItems(){
  var out=[];
  if(allowed('deals'))myDeals().filter(function(d){return activity(d)&&activity(d)!=='Active'}).sort(function(a,b){return idle(b)-idle(a)}).forEach(function(d){var a=activity(d),r=rival(d),act=canRegister()?{label:'Update progress',act:'progress'}:{label:'View deal',act:'nav',v:'deal'};
    out.push({tone:a==='Inactive'?'bad':'warn',icon:a==='Inactive'?'alert':'clock',title:a==='Inactive'?'Protection suspended: no update for '+idle(d)+' days':'Progress update due: '+idle(d)+' days since the last update',meta:d.customer+' · '+d.id+(a==='Inactive'&&r&&r.status==='Pending'?' · Another partner has registered this customer':''),label:act.label,act:act.act,v:act.v,id:d.id})});
  if(allowed('deals'))myDeals().forEach(function(d){if(d.status==='Approved'&&d.protectedUntil&&daysUntil(d.protectedUntil)<=14)out.push({tone:'bad',icon:'clock',title:'Deal protection ends in '+daysUntil(d.protectedUntil)+' days',meta:d.customer+' · '+d.id,label:'Review deal',act:'nav',v:'deal',id:d.id})});
  if(allowed('commissions'))S.commissions.forEach(function(c){if(c.partnerId===myPartner().id&&c.status==='Awaiting invoice')out.push({tone:'warn',icon:'wallet',title:'Invoice needed to release '+mon(c.amount,c.partnerId),meta:c.customer+' · '+c.dealId,label:'Upload invoice',act:'invoice',id:c.id})});
  if(allowed('deals'))myDeals().forEach(function(d){if(d.status==='Pending'&&d.infoRequest)out.unshift({tone:'warn',icon:'info',title:'Northwind Security needs more information',meta:d.customer+' · '+d.id,label:canRegister()?'Add information':'View deal',act:canRegister()?'addInfo':'nav',v:canRegister()?null:'deal',id:d.id})});
  S.tickets.forEach(function(t){if(t.partnerId===myPartner().id&&t.status==='Waiting on you')out.push({tone:'info',icon:'life',title:'Northwind Security is waiting for your reply',meta:t.subject+' · '+t.id,label:'Open case',act:'nav',v:'case',id:t.id})});
  var cc=certCounts();if(allowed('training')&&myPartner().tier==='Gold'&&cc.tech<1)out.push({tone:'warn',icon:'grad',title:'Gold tier needs 1 certified technical person',meta:'Technical Pre-sales · '+Math.round(S.courses[1].done/S.courses[1].modules*100)+'% complete',label:'Continue course',act:'nav',v:'training'});
  return out;
}
function actionList(items){
  if(!items.length)return empty('Nothing needs your attention','New tasks will appear here.','checkc');
  return '<div class="list">'+items.map(function(a){return '<div class="li-ic"><span class="dot d-'+a.tone+'">'+ic(a.icon)+'</span><div><div class="ink b">'+esc(a.title)+'</div><div class="small muted">'+esc(a.meta)+'</div></div><button type="button" class="btn btn-s" data-act="'+a.act+'"'+(a.v?' data-v="'+a.v+'"':'')+(a.id?' data-id="'+esc(a.id)+'"':'')+'>'+esc(a.label)+'</button></div>'}).join('')+'</div>';
}
function protCell(d){
  if(d.status==='Approved'){var n=daysUntil(d.protectedUntil);return '<span class="nowrap'+(n<=14?' b" style="color:var(--danger)"':'"')+'>'+fmtD(d.protectedUntil)+'</span><span class="sub">'+n+' days left</span>'}
  if(d.status==='Pending')return '<span class="muted">Starts on approval</span>';
  if(d.status==='Won')return '<span class="muted">Closed '+fmtD(d.closedAt)+'</span>';
  if(d.status==='Expired')return '<span class="muted">Ended '+fmtD(d.protectedUntil)+'</span>';
  return '<span class="muted">-</span>';
}

/* ---------- partner pages ---------- */
function pHome(){
  var p=myPartner(),st=stats(),u=me();
  var actions=(canRegister()?btn('Register deal',{cls:'btn-p',icon:'plus',act:'nav',v:'deal-new'}):'')+btn('Open a case',{icon:'life',act:'newCase'});
  var m4=allowed('commissions')?'<div><span class="l">Commission earned, '+YNOW+'</span><span class="v">'+mon(st.commY,myPartner().id)+'</span><span class="s">'+mon(st.commWait,myPartner().id)+' not yet paid</span></div>':
    '<div><span class="l">Certified team members</span><span class="v">'+certCounts().sales+'</span><span class="s">Sales Associate certification</span></div>';
  var fin=!allowed('deals');
  var mx=fin?'<div class="mx"><div><span class="l">Commission earned, '+YNOW+'</span><span class="v">'+mon(st.commY,myPartner().id)+'</span><span class="s">Year to date</span></div>'+
    '<div><span class="l">Not yet paid</span><span class="v">'+mon(st.commWait,myPartner().id)+'</span><span class="s">Awaiting invoice or payment</span></div>'+
    '<div><span class="l">Current rate</span><span class="v">'+RATE[p.tier]+'%</span><span class="s">'+esc(p.tier)+' tier · sample rate</span></div>'+
    '<div><span class="l">Partner tier</span><span class="v">'+esc(p.tier)+'</span><span class="s">Reviewed every January</span></div></div>':
    '<div class="mx"><div><span class="l">Open pipeline</span><span class="v">'+mon(st.pipeline,myPartner().id)+'</span><span class="s">'+st.open+' registrations · '+st.pending+' awaiting approval</span></div>'+
    '<div><span class="l">Won this quarter</span><span class="v">'+mon(st.wonQ,myPartner().id)+'</span><span class="s">'+st.wonQn+' deal'+(st.wonQn===1?'':'s')+' · '+QLABEL+'</span></div>'+m4+
    '<div><span class="l">Partner tier</span><span class="v">'+esc(p.tier)+'</span><span class="s">'+Math.round(pct(st.sales12,platTarget()))+'% of Platinum sales requirement</span></div></div>';
  var ds=myDeals();var pend=ds.filter(function(d){return d.status==='Pending'}).reduce(function(a,d){return a+d.value},0);
  var rows=[['Pending approval',pend,'#F18F01']].concat(STAGES.map(function(s,i){return [s,ds.filter(function(d){return d.status==='Approved'&&d.stage===s}).reduce(function(a,d){return a+d.value},0),['#9DB4C8','#2E86AB','#1F4E79'][i]]}));
  var max=Math.max.apply(null,rows.map(function(r){return r[1]}).concat([1]));
  var chart='<div class="bars" role="img" aria-label="Open pipeline by stage">'+rows.map(function(r){return '<div class="bar"><span class="small">'+r[0]+'</span><span class="tr"><span style="width:'+pct(r[1],max).toFixed(1)+'%;background:'+r[2]+'"></span></span><span class="num r small b ink" style="text-align:right">'+mon(r[1],myPartner().id)+'</span></div>'}).join('')+'</div>';
  var recent=ds.slice().sort(function(a,b){return a.submitted<b.submitted?1:-1}).slice(0,5);
  var rtable='<div class="tw"><table class="tb"><thead><tr><th>Customer</th><th>Services</th><th class="r">Est. value</th><th>Status</th><th>Submitted</th></tr></thead><tbody>'+recent.map(function(d){return '<tr class="rw" data-act="nav" data-v="deal" data-id="'+d.id+'"><td><button type="button" class="link b" data-act="nav" data-v="deal" data-id="'+d.id+'">'+esc(d.customer)+'</button><span class="sub">'+d.id+'</span></td><td>'+esc(d.services.join(', '))+'</td><td class="r num">'+mon(d.value,d.partnerId)+'</td><td>'+badge(d.status)+'</td><td class="nowrap">'+fmtD(d.submitted)+'</td></tr>'}).join('')+'</tbody></table></div>';
  var ctable='<div class="tw"><table class="tb"><thead><tr><th>Customer</th><th>Service</th><th class="r">Commission</th><th>Status</th></tr></thead><tbody>'+S.commissions.filter(function(c){return c.partnerId===myPartner().id}).slice(0,5).map(function(c){return '<tr><td class="ink">'+esc(c.customer)+'<span class="sub">'+c.dealId+'</span></td><td>'+esc(c.service)+'</td><td class="r num b ink">'+mon(c.amount,c.partnerId)+'</td><td>'+badge(c.status)+'</td></tr>'}).join('')+'</tbody></table></div>';
  var cc=certCounts();
  var prog='<div class="stack" style="gap:14px"><div class="row">'+tierB(p.tier)+'<span class="small muted">Member since '+fmtD(p.joined)+'</span></div>'+
    req('Won sales, last 12 months',mon(st.sales12,myPartner().id),mon(platTarget(),myPartner().id),pct(st.sales12,platTarget()))+req('Certified sales people',String(cc.sales),'5',pct(cc.sales,5))+req('Certified technical people',String(cc.tech),'2',pct(cc.tech,2))+
    '<p class="small muted">Targets shown are for Platinum. Tiers are reviewed every January.</p></div>';
  var ann='<div class="list">'+newsFor().slice(0,4).map(function(n){var un=S.newsRead.indexOf(n.id)<0;return '<div class="li" style="grid-template-columns:minmax(0,1fr)"><div><div class="small muted">'+fmtD(n.at)+' · '+esc(n.cat)+(un?' · <span class="b" style="color:var(--primary)">New</span>':'')+'</div><button type="button" class="link b" data-act="nav" data-v="news-item" data-id="'+n.id+'">'+esc(n.title)+'</button></div></div>'}).join('')+'</div>';
  return ph(null,'Home',esc(p.name)+' · '+esc(p.type)+' · '+esc(u.role),actions)+mx+
  '<div class="g2"><div class="col">'+
    panel('Action items',actionList(actionItems()),{flush:true,meta:actionItems().length+' open'})+
    (fin?panel('Recent commission lines',ctable,{flush:true,actions:btn('View all',{cls:'btn-g btn-s',act:'nav',v:'commissions'})}):
    panel('Recent deal registrations',rtable,{flush:true,actions:btn('View all',{cls:'btn-g btn-s',act:'nav',v:'deals'})})+
    panel('Open pipeline by stage',chart,{foot:'<span>Pending registrations and approved deals that are not yet closed.</span>'}))+
  '</div><div class="col">'+
    panel('Partner program',prog,{actions:btn('Details',{cls:'btn-g btn-s',act:'nav',v:'program'})})+
    panel('Announcements',ann,{flush:true,actions:btn('View all',{cls:'btn-g btn-s',act:'nav',v:'news'})})+
    panel('Need help?','<dl class="dl" style="grid-template-columns:110px minmax(0,1fr)"><dt>Partner Manager</dt><dd>'+esc(pmName(myPartner().pmId))+'</dd><dt>Partner support</dt><dd>partners@example.com</dd><dt>Security incident</dt><dd>[SOC hotline number]</dd></dl>',{foot:btn('Open a case',{cls:'btn-s',act:'newCase'})})+
  '</div></div>';
}
function req(label,val,target,p){return '<div class="stack" style="gap:6px"><div class="row" style="justify-content:space-between"><span class="small">'+label+'</span><span class="small num"><span class="b ink">'+esc(val)+'</span> / '+esc(target)+'</span></div><div class="pb'+(p>=100?' g':'')+'"><span style="width:'+p.toFixed(1)+'%"></span></div></div>'}
function pProgram(){
  var p=myPartner(),st=stats(),cc=certCounts(),ci=tierRank(p.tier)+1;
  var head='<tr><th style="width:34%">Requirement</th>'+TIERS.map(function(t,i){return '<th'+(i+1===ci?' class="cur"':'')+'>'+t+(i+1===ci?' (current)':'')+'</th>'}).join('')+'</tr>';
  var mk=function(rows){return rows.map(function(r){return '<tr><td>'+esc(r[0])+'</td>'+r.slice(1).map(function(v,i){return '<td class="'+(i+1===ci?'cur ':'')+(v==='-'||v==='None'?'no':'')+'">'+esc(v)+'</td>'}).join('')+'</tr>'}).join('')};
  var table='<div class="tw"><table class="tb bt"><thead>'+head+'</thead><tbody>'+mk(progReq())+'<tr><th style="text-align:left">Benefit</th><th></th><th></th><th></th><th></th></tr>'+mk(PROGRAM_BEN)+'</tbody></table></div>';
  var status='<div class="stack" style="gap:14px">'+req('Won sales, last 12 months',mon(st.sales12,myPartner().id),mon(platTarget(),myPartner().id)+' for Platinum',pct(st.sales12,platTarget()))+req('Certified sales people',String(cc.sales),'3 for Gold · 5 for Platinum',pct(cc.sales,5))+req('Certified technical people',String(cc.tech),'1 for Gold · 2 for Platinum',pct(cc.tech,2))+
    (cc.tech<1?'<div class="al al-warn">'+ic('alert')+'<span>Your company is below the Gold requirement for technical certification. Complete Technical Pre-sales before the January review to keep Gold.</span></div>':'<div class="al al-ok">'+ic('checkc')+'<span>You meet all Gold requirements.</span></div>')+'</div>';
  return ph([['Home','home'],['Partner program']],'Partner program','Tier requirements, benefits and your progress. Targets, benefits and commission rates are illustrative sample values.',allowed('training')?btn('Go to training',{icon:'grad',act:'nav',v:'training'}):'')+
  '<div class="mx m3"><div><span class="l">Current tier</span><span class="v">'+esc(p.tier)+'</span><span class="s">Reviewed each January</span></div><div><span class="l">Your margin</span><span class="v">'+RATE[p.tier]+'%</span><span class="s">On won, registered deals (sample rate)</span></div><div><span class="l">Next tier</span><span class="v">'+(TIERS[tierRank(p.tier)+1]||'Top tier')+'</span><span class="s">'+(TIERS[tierRank(p.tier)+1]?RATE[TIERS[tierRank(p.tier)+1]]+'% margin and more benefits':'All benefits unlocked')+'</span></div></div>'+
  '<div class="g2"><div class="col">'+panel('Tiers and benefits',table,{flush:true,foot:'<span>Illustrative sample values, not real commercial terms.</span>'})+'</div><div class="col">'+panel('Your progress',status)+panel('How tiers work','<ul class="bullets"><li>Tiers are set every January from the previous 12 months of won, registered deals and your team certifications.</li><li>Moving up takes effect the next month. Moving down only happens at the annual review.</li><li>Your Partner Manager can request an exception for strategic partners. It goes through the same three approvals.</li></ul>')+'</div></div>';
}
function pNews(){
  var cats=['All','Product','Pricing','Partner program','Events','Security advisory','Company'];if(newsFor().some(function(n){return n.from}))cats.push('From your Partner Manager');
  var cur=ui.f.news||'All';
  var facets='<div class="facets">'+cats.map(function(c){var n=c==='All'?newsFor().length:newsFor().filter(function(x){return x.cat===c}).length;return '<button type="button" class="facet" aria-pressed="'+(c===cur)+'" data-act="facet" data-k="news" data-t="'+esc(c)+'">'+esc(c)+'<span class="c">'+n+'</span></button>'}).join('')+'</div>';
  var list=newsFor().filter(function(n){return cur==='All'||n.cat===cur});
  var unread=newsFor().filter(function(n){return S.newsRead.indexOf(n.id)<0}).length;
  var rows=list.length?'<div class="list">'+list.map(function(n){var un=S.newsRead.indexOf(n.id)<0;return '<article class="li" style="grid-template-columns:120px minmax(0,1fr);align-items:start;padding:14px 16px"><div class="small muted">'+fmtD(n.at)+'</div><div class="stack" style="gap:4px"><div class="row">'+badge(n.cat==='Security advisory'?'Security':'Activity',n.cat)+(un?badge('New'):'')+'</div><button type="button" class="link b" style="font-size:14px" data-act="nav" data-v="news-item" data-id="'+n.id+'">'+esc(n.title)+'</button><p class="muted">'+esc(n.summary)+'</p></div></article>'}).join('')+'</div>':empty('No announcements in this category','');
  return ph([['Home','home'],['Announcements']],'Announcements','Product, pricing and program updates from Northwind Security.',unread?btn('Mark all as read',{act:'newsAllRead'}):'')+
  '<div class="gs">'+panel('Categories',facets,{flush:true})+panel(esc(cur==='All'?'All announcements':cur),rows,{flush:true,meta:list.length+' items'})+'</div>';
}
function pNewsItem(){
  var n=newsById(ui.id);if(!n||newsFor().indexOf(n)<0){ui.v=isStaff()?'a-content':'news';return isStaff()?aContent():pNews()}
  if(S.newsRead.indexOf(n.id)<0){S.newsRead.push(n.id)}
  var more=newsFor().filter(function(x){return x.id!==n.id}).slice(0,5).map(function(x){return '<div class="li" style="grid-template-columns:minmax(0,1fr)"><div><div class="small muted">'+fmtD(x.at)+'</div><button type="button" class="link" data-act="nav" data-v="news-item" data-id="'+x.id+'">'+esc(x.title)+'</button></div></div>'}).join('');
  var back=isStaff()?[['Overview','a-home'],['Content','a-content'],[n.title]]:[['Home','home'],['Announcements','news'],[n.title]];
  return ph(back,esc(n.title),fmtD(n.at)+' · '+esc(n.cat)+' · '+(n.from?esc(pmName(n.from))+(isStaff()?'':', your Partner Manager'):'Northwind Security Partner Team'))+
  '<div class="g2"><div class="col">'+panel('','<article class="art stack" style="gap:14px"><p class="ink b" style="font-size:14px">'+esc(n.summary)+'</p><div>'+n.body.map(function(b){return '<p>'+esc(b)+'</p>'}).join('')+'</div></article>')+'</div><div class="col">'+panel('More announcements','<div class="list">'+more+'</div>',{flush:true})+'</div></div>';
}
function pProducts(){
  var cats=['All','Managed services','Offensive security','Incident response','Advisory'];var cur=curTab('products','All');var p=myPartner();
  var list=S.products.filter(function(x){return cur==='All'||x.cat===cur});
  var counts={};cats.forEach(function(c){counts[c]=c==='All'?S.products.length:S.products.filter(function(x){return x.cat===c}).length});
  var cards=list.map(function(x){return '<article class="card"><span class="eyebrow">'+esc(x.cat)+'</span><h2><button type="button" class="link" style="color:var(--ink)" data-act="nav" data-v="product" data-id="'+x.id+'">'+esc(x.name)+'</button></h2><p class="muted" style="flex:1">'+esc(x.short)+'</p>'+
    '<dl class="dl small" style="grid-template-columns:100px minmax(0,1fr);gap:4px 12px"><dt>Typical deal</dt><dd>'+esc(regionalize(x.deal,curOf(p.id).code))+'</dd><dt>Your margin</dt><dd>'+RATE[p.tier]+'%</dd></dl>'+
    '<div class="row" style="border-top:1px solid var(--border-soft);padding-top:12px">'+btn('View product',{cls:'btn-s',act:'nav',v:'product',id:x.id})+(canRegister()?btn('Register deal',{cls:'btn-s btn-g',act:'prodDeal',id:x.id}):'')+'</div></article>'}).join('');
  return ph([['Home','home'],['Products']],'Products','What Northwind Security sells, who each service is for, and how to position it.')+
  '<div class="pn">'+tabs('products',cats,counts)+'<div class="pn-b"><div class="cards">'+cards+'</div></div><div class="pn-f">Product descriptions, prices and deal sizes are fictional sample figures.</div></div>';
}
function pProduct(){
  var x=prodById(ui.id);if(!x){ui.v='products';return pProducts()}
  var p=myPartner(),t=curTab('product','Overview');
  var li=function(a){return '<ul class="bullets">'+a.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ul>'};
  var body='';
  if(t==='Overview')body='<div class="stack" style="gap:18px"><p class="art" style="max-width:72ch">'+esc(x.pitch)+'</p><div class="gh"><div class="stack" style="gap:8px"><h3>What is included</h3>'+li(x.features)+'</div><div class="stack" style="gap:8px"><h3>Who it is for</h3>'+li(x.who)+'</div></div></div>';
  if(t==='Selling')body='<div class="gh"><div class="stack" style="gap:8px"><h3>Signs a customer needs it</h3>'+li(x.signals)+'</div><div class="stack" style="gap:8px"><h3>Questions to qualify the opportunity</h3>'+li(['What happens today when a security alert fires outside office hours?','Who is responsible for security, and how much of their time does it take?','Is there an audit, insurer or customer asking for evidence of security controls?','What would a day of downtime cost the business?'])+'</div></div>';
  if(t==='Pricing')body='<div class="tw"><table class="tb"><tbody><tr><td class="muted" style="width:220px">Pricing model</td><td class="ink">'+esc(regionalize(x.price,curOf(p.id).code))+'</td></tr><tr><td class="muted">Typical deal size</td><td class="ink">'+esc(regionalize(x.deal,curOf(p.id).code))+'</td></tr><tr><td class="muted">Your margin</td><td class="ink">'+RATE[p.tier]+'% at '+esc(p.tier)+' tier</td></tr><tr><td class="muted">Deal registration</td><td class="ink">Required to receive margin. 90-day protection.</td></tr></tbody></table></div><p class="small muted" style="margin-top:12px">Sample figures. The current partner price list is in the Resource library.</p>';
  if(t==='Sales materials'){var rs=x.res.map(resById).filter(Boolean);body=rs.length?resTable(rs):empty('No materials yet','')}
  var acts=canRegister()?btn('Register deal',{cls:'btn-p',icon:'plus',act:'prodDeal',id:x.id}):'';
  return ph([['Home','home'],['Products','products'],[x.name]],esc(x.name),esc(x.cat)+' · '+esc(x.short),acts)+
  '<div class="g2"><div class="col"><div class="pn">'+tabs('product',['Overview','Selling','Pricing','Sales materials'])+'<div class="pn-b">'+body+'</div></div></div><div class="col">'+
  panel('At a glance','<dl class="dl" style="grid-template-columns:110px minmax(0,1fr)"><dt>Category</dt><dd>'+esc(x.cat)+'</dd><dt>Pricing</dt><dd>'+esc(regionalize(x.price,curOf(p.id).code))+'</dd><dt>Typical deal</dt><dd>'+esc(regionalize(x.deal,curOf(p.id).code))+'</dd><dt>Your margin</dt><dd>'+RATE[p.tier]+'%</dd></dl>')+
  panel('Need help selling this?','<p class="muted">Ask for a Northwind Security pre-sales engineer to join a customer call.</p>',{foot:btn('Request pre-sales support',{cls:'btn-s',act:'newCase',t:'Pre-sales question'})})+'</div></div>';
}
function resTable(list){
  return '<div class="tw"><table class="tb"><thead><tr><th>Name</th><th>Category</th><th>Access</th><th>Updated</th><th class="r">Size</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+list.map(function(r){var lk=!isStaff()&&isLocked(r);
    return '<tr><td><div class="row" style="flex-wrap:nowrap;gap:10px"><span class="ftag f-'+r.type+'">'+r.type+'</span><span class="ink">'+esc(r.title)+'</span></div></td><td>'+esc(r.cat)+'</td><td class="nowrap">'+(r.minTier==='Registered'?'All partners':esc(r.minTier)+' and above')+'</td><td class="nowrap">'+fmtD(r.date)+'</td><td class="r nowrap">'+esc(r.size)+'</td><td class="r">'+(lk?'<span class="row small muted nowrap" style="justify-content:flex-end">'+ic('lock').replace('<svg','<svg width="14" height="14"')+'Locked</span>':'<button type="button" class="btn btn-s" data-act="download" data-id="'+r.id+'" aria-label="Download '+esc(r.title)+'">'+ic('down')+'Download</button>')+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function pDeals(){
  var ds=myDeals();var T=['All','Pending','Approved','Update due','Inactive','Won','Lost','Expired','Rejected'];
  var counts={};T.forEach(function(t){counts[t]=ds.filter(function(d){return matchTab(d,t)}).length});
  var list=dealFilter(ds,'deals');var pg=paged('deals',list);
  var acts=(canRegister()?btn('Register deal',{cls:'btn-p',icon:'plus',act:'nav',v:'deal-new'}):'')+btn('Export',{icon:'down',act:'export'});
  return ph([['Home','home'],['Deal registrations']],'Deal registrations','Approved registrations are protected for 90 days. Update each deal at least every 30 days: after 50 days without an update, protection is suspended.',acts)+
  '<div class="pn">'+tabs('deals',T,counts)+dealToolbar('deals')+dealTable(pg.rows,false)+pager('deals',pg)+'</div>';
}
function dealToolbar(key){
  var svc=ui.f[key+'svc']||'';
  return '<div class="tbar">'+searchBox(key,'Search customer or ID')+'<label class="sr" for="f-'+key+'">Service</label><select id="f-'+key+'" class="sel" data-change="filter" data-k="'+key+'svc"><option value="">All services</option>'+SERVICES.map(function(s){return '<option'+(s===svc?' selected':'')+'>'+esc(s)+'</option>'}).join('')+'</select><span class="sp"></span>'+(key==='adeals'?scopeCtl():'')+'</div>';
}
function dealFilter(list,key){
  var tab=curTab(key,key==='adeals'?'Pending':'All'),q=(ui.q[key]||'').toLowerCase(),svc=ui.f[key+'svc']||'';
  var out=list.filter(function(d){return matchTab(d,tab)&&(!svc||d.services.indexOf(svc)>-1)&&(!q||(d.customer+' '+d.id+' '+partnerById(d.partnerId).name).toLowerCase().indexOf(q)>-1)});
  var k=ui.sort.key,dir=ui.sort.dir;
  return out.sort(function(a,b){var x=a[k],y=b[k];return (x<y?-1:x>y?1:0)*dir});
}
function sortTh(label,key,cls){var on=ui.sort.key===key;return '<th'+(cls?' class="'+cls+'"':'')+' aria-sort="'+(on?(ui.sort.dir>0?'ascending':'descending'):'none')+'"><button type="button" class="sort'+(on?' on':'')+'" data-act="sort" data-k="'+key+'">'+label+ic(on?(ui.sort.dir>0?'sortU':'sortD'):'sort')+'</button></th>'}
function dealTable(rows,withPartner){
  if(!rows.length)return empty('No deal registrations found','Try another status, service or search term.','brief');
  return '<div class="tw"><table class="tb"><thead><tr><th>Registration</th>'+sortTh('Customer','customer')+(withPartner?'<th>Partner</th><th>Owner</th>':'')+'<th>Services</th>'+sortTh('Est. value','value','r')+'<th>Stage</th><th>Status</th><th>Protection</th><th>Last update</th>'+sortTh('Submitted','submitted')+'</tr></thead><tbody>'+
  rows.map(function(d){return '<tr class="rw" data-act="nav" data-v="deal" data-id="'+d.id+'"><td class="id">'+d.id+'</td><td><button type="button" class="link b" data-act="nav" data-v="deal" data-id="'+d.id+'">'+esc(d.customer)+'</button>'+(d.status==='Pending'&&rival(d)?'<span class="sub" style="color:var(--danger)">Possible conflict</span>':'')+(d.extensionRequested?'<span class="sub" style="color:var(--warn-ink)">Extension requested</span>':'')+(d.status==='Pending'?(d.infoRequest?'<span class="sub" style="color:var(--warn-ink)">Information requested</span>':d.custConfirm==='Declined'?'<span class="sub" style="color:var(--danger)">Customer did not confirm</span>':d.custConfirm==='Waiting'?'<span class="sub">Waiting for customer confirmation</span>':''):'')+'</td>'+(withPartner?'<td>'+esc(partnerById(d.partnerId).name)+'</td><td class="nowrap">'+ownerChip(partnerById(d.partnerId).pmId)+'</td>':'')+'<td>'+esc(d.services.join(', '))+'</td><td class="r num nowrap">'+mon(d.value,d.partnerId)+myrNote(d.value,d.partnerId)+'</td><td>'+esc(d.stage)+'</td><td>'+badge(d.status)+'</td><td>'+protCell(d)+'</td><td class="nowrap">'+actCell(d)+'</td><td class="nowrap">'+fmtD(d.submitted)+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function pDeal(){
  var d=dealById(ui.id);if(!d){ui.v=isStaff()?'a-deals':'deals';return pageHTML()}
  var staff=isStaff(),p=partnerById(d.partnerId),editable=!staff&&d.status==='Approved'&&canRegister();
  if(staff&&!seeDeal(d)){ui.blocked=ui.blocked||{};if(!ui.blocked[d.id]){ui.blocked[d.id]=1;log('Blocked access to '+d.id+': partner is outside '+terrText(me()),'warn')}
    return ph([['Overview','a-home'],['Deal registrations','a-deals'],[d.id]],'No access','')+empty('You don\'t have access to this registration','It belongs to a partner outside your territory. This attempt was recorded in the audit log.','lock')}
  var apIt=staff&&d.status==='Pending'?apItem('deal',d.id):null,owns=staff&&ownsPartner(p);
  var acts='';
  if(apIt)acts=(myTurn(apIt)&&apIt.o.appr.step===0?btn('Request information',{act:'reqInfo',id:d.id}):'')+apButtons(apIt,apIt.o.appr.step===2?'Final approval':null);
  if(!staff&&d.status==='Pending'&&d.infoRequest&&canRegister())acts=btn('Add information',{cls:'btn-p',icon:'up',act:'addInfo',id:d.id});
  if(owns&&d.extensionRequested)acts+=btn('Approve extension',{cls:'btn-p',act:'approveExt',id:d.id});
  var av=activity(d),rv=rival(d);
  if(owns&&av&&av!=='Active')acts+=btn('Send reminder',{icon:'mail',act:'nudge',id:d.id});
  if(editable)acts=(!d.extensionUsed&&!d.extensionRequested?btn('Request extension',{act:'askExt',id:d.id}):'')+btn('Mark as lost',{act:'lost',id:d.id})+btn('Update progress',{cls:av==='Active'?'':'btn-p',act:'progress',id:d.id})+btn('Mark as won',{cls:'btn-ok',icon:'check',act:'won',id:d.id});
  var alerts='';
  if(d.status==='Pending'&&rv)alerts+='<div class="al al-bad">'+ic('alert')+'<span><span class="b">Possible conflict.</span> '+(staff?esc(partnerById(rv.partnerId).name)+' has also registered this customer ('+rv.id+'). See Conflict resolution below.':'Another partner has also registered this customer. Northwind Security will decide who gets it and tell you the reason.')+'</span></div>';
  if(av==='Inactive')alerts+='<div class="al al-bad">'+ic('alert')+'<span><span class="b">Protection suspended.</span> No progress update for '+idle(d)+' days. '+(rv&&rv.status==='Pending'?(staff?esc(partnerById(rv.partnerId).name)+' has registered this customer. See Conflict resolution below.':'Another partner has registered this customer, and Northwind Security may give it to them. Update the deal now.'):'Other partners can now register this customer. '+(staff?'':'Update the deal to restore protection.'))+'</span></div>';
  if(av==='Update due')alerts+='<div class="al al-warn">'+ic('clock')+'<span><span class="b">Progress update due.</span> No update for '+idle(d)+' days. '+(staff?'Protection is suspended on ':'Update before ')+fmtD(addDays(lastAct(d),INACTIVE_AFTER))+(staff?' if there is no update.':' to keep protection.')+'</span></div>';
  if(d.status==='Pending'&&d.infoRequest)alerts+='<div class="al al-warn">'+ic('info')+'<span><span class="b">'+(staff?'Information requested from the partner on '+fmtD(d.infoRequest.at)+'.':'Northwind Security needs more information before approving.')+'</span> '+esc(d.infoRequest.text)+'</span></div>';
  if(d.status==='Pending'&&d.custConfirm==='Declined')alerts+='<div class="al al-bad">'+ic('alert')+'<span><span class="b">The customer did not confirm this opportunity.</span> '+esc(d.contact)+' replied that they are not discussing Northwind Security services with '+(staff?esc(p.name):'your company')+'.</span></div>';
  if(!staff&&d.status==='Pending'&&!d.infoRequest)alerts+='<div class="al al-info">'+ic('clock')+'<span><span class="b">Under review by Northwind Security.</span> Approval usually takes up to 3 business days. You will be notified of the decision.</span></div>';
  if(d.lostReason)alerts+='<div class="al al-bad">'+ic('info')+'<span><span class="b">Customer reassigned.</span> '+esc(d.lostReason)+'</span></div>';
  if(d.rejectReason)alerts+='<div class="al al-bad">'+ic('info')+'<span><span class="b">Not approved.</span> '+esc(d.rejectReason)+'</span></div>';
  if(d.extensionRequested)alerts+='<div class="al al-warn">'+ic('clock')+'<span>A 30-day extension has been requested and is waiting for Northwind Security approval.</span></div>';
  if(d.status==='Approved'&&daysUntil(d.protectedUntil)<=14)alerts+='<div class="al al-warn">'+ic('clock')+'<span>Protection ends in '+daysUntil(d.protectedUntil)+' days. Update the deal or request an extension.</span></div>';
  var stageField=editable?'<label class="sr" for="stage-sel">Stage</label><select id="stage-sel" class="sel" data-change="stage" data-id="'+d.id+'">'+STAGES.map(function(s){return '<option'+(s===d.stage?' selected':'')+'>'+s+'</option>'}).join('')+'</select>':esc(d.stage);
  var details='<dl class="dl"><dt>Customer</dt><dd>'+esc(d.customer)+'</dd><dt>Industry</dt><dd>'+esc(d.industry)+'</dd><dt>Country</dt><dd>'+esc(d.country)+'</dd><dt>Company size</dt><dd>'+esc(d.employees||'-')+' employees</dd><dt>Registration no.</dt><dd>'+(d.regNo?esc(d.regNo):'<span class="muted">Not given</span>')+'</dd><dt>Website</dt><dd>'+esc(d.website||'-')+'</dd><dt>Decision maker</dt><dd>'+esc(d.contact)+(d.contactTitle?', '+esc(d.contactTitle):'')+'<br><span class="muted">'+esc(d.contactEmail)+(d.contactPhone?' · '+esc(d.contactPhone):'')+'</span></dd><dt>Services</dt><dd>'+esc(d.services.join(', '))+'</dd><dt>Estimated value</dt><dd class="num">'+mon(d.value,d.partnerId)+myrNote(d.value,d.partnerId)+'</dd><dt>Budget</dt><dd>'+esc(d.budget||'-')+'</dd><dt>Stage</dt><dd>'+stageField+'</dd><dt>Expected close</dt><dd>'+fmtD(d.closeDate)+'</dd><dt>Opportunity source</dt><dd>'+esc(d.source||'-')+'</dd><dt>Customer need</dt><dd>'+(d.need?esc(d.need):'<span class="muted">Not given</span>')+'</dd></dl>';
  var k=d.companyCheck,checkPanel='',finPanel='';
  if(staff){
    var docs=(d.budgetDocs||[]).map(function(x){return [x.type,x.name]}).concat(d.auditDoc?[['Audited accounts',d.auditDoc.name+(d.auditDoc.consent?' · customer consent confirmed':'')]]:[]);
    finPanel=panel('Financial documents',(docs.length?'<div class="list">'+docs.map(function(x,i){return '<div class="li"><div><div class="ink b">'+esc(x[0])+'</div><div class="small muted">'+esc(x[1])+'</div></div>'+btn('View',{cls:'btn-s',act:'viewDoc',id:d.id,i:i})+'</div>'}).join('')+'</div>':'<p class="muted">No financial documents attached.</p>')+'<div class="restricted" style="margin-top:12px">'+ic('lock')+'<span>Visible to the owner and the approvers only. Every view is recorded in the audit log. Deleted after 2 years.</span></div>')}
  var verifyPanel=panel('Verification',verifyList(d),{meta:verifyBadge(d),foot:(!staff&&canRegister()&&(d.status==='Pending'||d.status==='Approved')?btn('Add document',{cls:'btn-s btn-p',icon:'up',act:'addInfo',id:d.id}):'')+btn('View email sent to the customer',{cls:'btn-s',icon:'mail',act:'custMail',id:d.id})+(staff&&d.status==='Pending'&&d.custConfirm==='Waiting'?'<span class="sp"></span><span class="small muted">Demo: open the email to simulate the customer\'s reply</span>':'')});
  var hist='<ol class="tl">'+d.history.slice().reverse().map(function(h){return '<li><div class="ink">'+esc(h.text)+'</div><div class="w">'+fmtD(h.at)+' · '+esc(h.by)+'</div></li>'}).join('')+'</ol>';
  var protBody;
  if(d.status==='Approved'){var left=daysUntil(d.protectedUntil),total=d.extensionUsed?120:90,used=total-left;
    protBody='<div class="stack"><div class="row" style="justify-content:space-between"><span class="b ink">'+left+' days left</span><span class="small muted">'+total+'-day term</span></div><div class="pb'+(left<=14?'':' g')+'"><span style="width:'+pct(used,total).toFixed(1)+'%;'+(left<=14?'background:#C9523B':'')+'"></span></div><dl class="dl" style="grid-template-columns:110px minmax(0,1fr)"><dt>Approved</dt><dd>'+fmtD(d.approvedAt)+'</dd><dt>Protected until</dt><dd>'+fmtD(d.protectedUntil)+'</dd><dt>Extension</dt><dd>'+(d.extensionUsed?'Used':d.extensionRequested?'Requested':'Available')+'</dd></dl></div>'}
  else protBody='<p class="muted">'+(d.status==='Pending'?'Protection starts when Northwind Security approves the registration.':d.status==='Won'?'Closed as won on '+fmtD(d.closedAt)+'.':'This registration is no longer protected.')+'</p>';
  var comm=S.commissions.filter(function(c){return c.dealId===d.id})[0];
  var actBody='';if(av){var nsLate=d.nextStepDate&&daysUntil(d.nextStepDate)<0;
    actBody='<div class="stack"><div class="row" style="justify-content:space-between">'+badge(av)+'<span class="small muted">'+daysAgo(idle(d))+'</span></div><dl class="dl" style="grid-template-columns:110px minmax(0,1fr)"><dt>Last update</dt><dd>'+fmtD(lastAct(d))+'</dd><dt>Next step</dt><dd>'+(d.nextStep?esc(d.nextStep)+'<br><span class="small'+(nsLate?' b" style="color:var(--danger)':' muted')+'">'+(d.nextStepDate?(nsLate?'Was due ':'Due ')+fmtD(d.nextStepDate):'')+'</span>':'<span class="muted">Not set</span>')+'</dd><dt>Update due</dt><dd>'+fmtD(addDays(lastAct(d),UPDATE_DUE))+'</dd><dt>Suspended on</dt><dd>'+fmtD(addDays(lastAct(d),INACTIVE_AFTER))+'</dd></dl><p class="small muted">A progress update is a stage change, a progress note or a new next step. Opening the deal does not count.</p></div>'}
  var conflictPanel='';if(staff&&rv&&(d.status==='Pending'||rv.status==='Pending')){
    var pend=d.status==='Pending'&&(rv.status==='Approved'||rv.submitted<=d.submitted)?d:rv.status==='Pending'?rv:d,hold=pend===d?rv:d,hp=partnerById(hold.partnerId),pp=partnerById(pend.partnerId),ha=activity(hold);
    var col=function(x){var a=activity(x);return '<td>'+(x===d?'<span class="b ink">'+esc(partnerById(x.partnerId).name)+'</span>':'<button type="button" class="link b" data-act="nav" data-v="deal" data-id="'+x.id+'">'+esc(partnerById(x.partnerId).name)+'</button>')+'<span class="sub">'+x.id+'</span></td>'};
    var row=function(l,f){return '<tr><td class="muted" style="width:150px">'+l+'</td><td>'+f(hold)+'</td><td>'+f(pend)+'</td></tr>'};
    var cmp='<div class="tw"><table class="tb"><thead><tr><th></th><th>Registered first</th><th>New registration</th></tr></thead><tbody>'+
      '<tr><td class="muted">Partner</td>'+col(hold)+col(pend)+'</tr>'+row('Registered on',function(x){return fmtD(x.submitted)})+row('Status',function(x){return badge(x.status)})+
      row('Last progress update',function(x){return x.status==='Approved'?fmtD(lastAct(x))+'<span class="sub">'+daysAgo(idle(x))+'</span>':'<span class="muted">Not approved yet</span>'})+row('Activity',function(x){return activity(x)?badge(activity(x)):'<span class="muted">-</span>'})+
      row('Protected until',function(x){return x.protectedUntil&&x.status==='Approved'?fmtD(x.protectedUntil):'<span class="muted">-</span>'})+row('Estimated value',function(x){return mon(x.value,x.partnerId)})+'</tbody></table></div>';
    var rec=ha==='Inactive'?'<div class="al al-warn">'+ic('info')+'<span><span class="b">Recommendation: award to '+esc(pp.name)+'.</span> '+esc(hp.name)+' has had no progress update for '+idle(hold)+' days, so its protection is suspended.</span></div>':hold.status==='Approved'?'<div class="al al-info">'+ic('info')+'<span><span class="b">Recommendation: keep with '+esc(hp.name)+'.</span> It registered first and its protection is active'+(ha==='Update due'?', although an update is due':'')+'.</span></div>':'<div class="al al-info">'+ic('info')+'<span><span class="b">Both registrations are pending.</span> The first valid registration normally wins.</span></div>';
    var pit=apItem('deal',pend.id),canDecide=pit&&myTurn(pit)&&pit.o.appr.step===0;
    if(pend.awardIntent)rec='<div class="al al-info">'+ic('info')+'<span><span class="b">Proposed: award to '+esc(pp.name)+'.</span> '+(pit?'Waiting for '+esc(pmName(apWho(pit)))+'.':'')+'</span></div>';
    conflictPanel=panel('Conflict resolution','<div class="stack">'+rec+cmp+'</div>',{foot:canDecide&&!pend.awardIntent?btn('Keep with '+hp.name,{act:'apNote',k:'deal',id:pend.id,d:'Rejected'})+'<span class="sp"></span>'+btn('Award to '+pp.name,{cls:'btn-p',act:'award',id:pend.id}):(pend.awardIntent?'':'<span class="small muted">Decided by the owner of '+esc(pp.name)+':</span>'+ownerChip(pp.pmId))})}
  var apPanel=apIt?panel('Approval',tracker(apIt),{meta:myTurn(apIt)?badge('Pending','Your decision needed'):'Step '+(apIt.o.appr.step+1)+' of 3'}):'';
  var ctx=staff?'<div class="ctx"><div class="ci"><span class="l">Partner</span><span class="ink b">'+esc(p.name)+'</span>'+tierB(p.tier)+'</div><div class="ci"><span class="l">Owner</span>'+ownerChip(p.pmId)+'</div>'+(apIt&&apWho(apIt)!==p.pmId?'<div class="ci"><span class="l">Waiting for</span>'+ownerChip(apWho(apIt))+'</div>':'')+'<span class="sp"></span>'+(!owns&&!me().all?'<span class="ro">'+ic('lock')+'Read only</span>':'')+'</div>':'';
  var side=(av?panel('Deal activity',actBody,{foot:editable?btn('Update progress',{cls:'btn-s',act:'progress',id:d.id}):''}):'')+panel('Protection',protBody)+
    (comm?panel('Commission','<dl class="dl" style="grid-template-columns:110px minmax(0,1fr)"><dt>Amount</dt><dd class="num b">'+mon(comm.amount,comm.partnerId)+'</dd><dt>Rate</dt><dd>'+comm.rate+'%</dd><dt>Status</dt><dd>'+badge(comm.status)+'</dd></dl>',{foot:btn(staff?'View payouts':'View commissions',{cls:'btn-s',act:'nav',v:staff?'a-payouts':'commissions'})}):'')+
    panel('Registration','<dl class="dl" style="grid-template-columns:110px minmax(0,1fr)"><dt>Partner</dt><dd>'+esc(p.name)+'</dd><dt>Tier</dt><dd>'+tierB(p.tier)+'</dd><dt>Submitted by</dt><dd>'+esc(d.submittedBy||'-')+'</dd>'+(staff?'<dt>Owner</dt><dd>'+ownerChip(p.pmId)+'</dd>':'')+'<dt>Submitted</dt><dd>'+fmtD(d.submitted)+'</dd></dl>');
  var crumbs=staff?[['Overview','a-home'],['Deal registrations','a-deals'],[d.id]]:[['Home','home'],['Deal registrations','deals'],[d.id]];
  return ph(crumbs,esc(d.customer)+' '+badge(d.status),d.id+' · '+esc(d.services.join(', '))+' · '+mon(d.value,d.partnerId),acts)+ctx+alerts+
  apPanel+conflictPanel+'<div class="g2"><div class="col">'+(d.status==='Pending'?verifyPanel+finPanel:'')+panel('Opportunity details',details)+(d.status!=='Pending'?verifyPanel+finPanel:'')+panel('Notes from the partner',d.notes?'<p>'+esc(d.notes)+'</p>':'<p class="muted">No notes were added.</p>')+panel('Activity',hist,{meta:d.history.length+' events'})+'</div><div class="col">'+side+'</div></div>';
}
function pDealNew(){
  var s=ui.step,dr=ui.draft;
  var steps=['Customer','Opportunity','Review and submit'];
  var stp='<div class="steps">'+steps.map(function(n,i){var k=i+1;return (i?'<span class="st-line"></span>':'')+'<span class="st'+(k<s?' done':k===s?' cur':'')+'"><span class="n">'+(k<s?ic('check'):k)+'</span>'+n+'</span>'}).join('')+'</div>';
  var err=ui.formErr?'<div class="al al-bad" role="alert">'+ic('alert')+'<span>'+esc(ui.formErr)+'</span></div>':'';
  var v=function(k){return esc(dr[k]||'')};
  var opt=function(list,cur){return list.map(function(o){return '<option'+(o===cur?' selected':'')+'>'+esc(o)+'</option>'}).join('')};
  var body='',foot='';
  if(s===1){
    body='<div class="fsec"><div class="fsec-h"><h2>End customer</h2><p class="small muted">We check for existing registrations as you type the company name.</p></div><div class="fgrid">'+
    '<div class="fld full"><label for="dn-customer" class="req">Registered company name</label><input id="dn-customer" name="customer" value="'+v('customer')+'" data-input="dupCheck" autocomplete="off"><div id="dup-msg" aria-live="polite">'+dupHTML(dr.customer||'')+'</div></div>'+
    '<div class="fld"><label for="dn-industry">Industry</label><select id="dn-industry" name="industry">'+opt(['Financial services','Manufacturing','Healthcare','Real estate','Logistics','Education','Government','Retail','Other'],dr.industry)+'</select></div>'+
    '<div class="fld"><label for="dn-country">Country</label><select id="dn-country" name="country">'+opt(['Malaysia','Singapore','Sri Lanka','United Kingdom','United States'],dr.country)+'</select></div>'+
    '<div class="fld"><label for="dn-reg" class="req">Company registration no. (SSM)</label><input id="dn-reg" name="regNo" value="'+v('regNo')+'" placeholder="e.g. 201901012345"></div>'+
    '<div class="fld"><label for="dn-web" class="req">Company website</label><input id="dn-web" name="website" value="'+v('website')+'" placeholder="e.g. kintaprecision.example"></div>'+
    '<div class="fld"><label for="dn-emp">Company size</label><select id="dn-emp" name="employees">'+opt(['1-50','51-200','201-1,000','1,000+'],dr.employees||'51-200')+'</select></div><div></div>'+
    '<div class="fld"><label for="dn-contact" class="req">Decision maker</label><input id="dn-contact" name="contact" value="'+v('contact')+'"></div>'+
    '<div class="fld"><label for="dn-ctitle" class="req">Job title</label><input id="dn-ctitle" name="contactTitle" value="'+v('contactTitle')+'" placeholder="e.g. IT Director"></div>'+
    '<div class="fld"><label for="dn-cemail" class="req">Decision maker email</label><input id="dn-cemail" name="contactEmail" type="email" value="'+v('contactEmail')+'"><span class="hint">Their company email, not a personal one. Northwind Security emails this person to confirm the opportunity.</span></div>'+
    '<div class="fld"><label for="dn-cphone">Decision maker phone</label><input id="dn-cphone" name="contactPhone" type="tel" value="'+v('contactPhone')+'"></div></div></div>';
    foot=btn('Cancel',{act:'nav',v:'deals'})+btn('Fill sample details (demo)',{cls:'btn-g',act:'fillDeal'})+'<span class="sp"></span>'+btn('Continue',{cls:'btn-p',type:'submit'});
  }
  if(s===2){
    var sel=dr.services||(ui.prefill?[ui.prefill]:[]);
    body='<div class="fsec"><div class="fsec-h"><h2>Northwind Security services</h2><p class="small muted">Select every service in scope.</p></div><div class="opts">'+SERVICES.map(function(x,i){var pr=S.products.filter(function(p){return p.svc===x})[0];return '<label class="opt" for="svc-'+i+'"><input type="checkbox" id="svc-'+i+'" name="services" value="'+esc(x)+'"'+(sel.indexOf(x)>-1?' checked':'')+'><span><span class="b ink">'+esc(x)+'</span><span class="d">'+esc(pr?pr.short:'')+'</span></span></label>'}).join('')+'</div></div>'+
    '<div class="fsec"><div class="fsec-h"><h2>Opportunity</h2></div><div class="fgrid">'+
    '<div class="fld"><label for="dn-value" class="req">Estimated value ('+curOf(myPartner().id).code+')</label><input id="dn-value" name="value" inputmode="numeric" value="'+v('value')+'" placeholder="e.g. 48000"><span class="hint">First-year contract value</span></div>'+
    '<div class="fld"><label for="dn-close" class="req">Expected close date</label><input id="dn-close" name="closeDate" type="date" min="'+today()+'" value="'+v('closeDate')+'"></div>'+
    '<div class="fld"><label for="dn-stage">Sales stage</label><select id="dn-stage" name="stage">'+opt(STAGES,dr.stage)+'</select></div><div></div>'+
    '<div class="fld full"><label for="dn-notes">Notes for your Partner Manager</label><textarea id="dn-notes" name="notes" placeholder="Current security setup, competitors involved, support you need from Northwind Security">'+v('notes')+'</textarea></div></div></div>'+
    '<div class="fsec"><div class="fsec-h"><h2>Proof of budget</h2><p class="small muted">A document from the customer showing they intend to buy. Only Northwind Security can see it.</p></div><div class="fgrid">'+
    '<div class="fld"><label for="dn-btype">Document type</label><select id="dn-btype" name="budgetType">'+opt(['Letter of Intent','Purchase Order','Approved budget or purchase request','Tender or RFP with budget','Quotation signed by the customer'],dr.budgetType)+'</select></div>'+
    '<div class="fld"><label for="dn-bfile"'+(dr.budgetName?'':' class="req"')+'>Document</label><input id="dn-bfile" name="budgetFile" type="file" accept=".pdf,.docx,.msg,.eml,.png,.jpg"><span class="hint">'+(dr.budgetName?'Attached: '+esc(dr.budgetName)+'. Choose a file to replace it.':'PDF, Word, email or image. Scanned for malware.')+'</span></div>'+
    '<div class="fld full"><label for="dn-afile">Customer audited accounts</label><input id="dn-afile" name="auditFile" type="file" accept=".pdf"><span class="hint">'+(dr.auditName?'Attached: '+esc(dr.auditName)+'. ':'')+'Optional. Recommended for deals of RM 100,000 a year or more.</span></div>'+
    '<div class="fld full"><label class="chk" for="dn-aconsent"><input id="dn-aconsent" name="auditConsent" type="checkbox"'+(dr.auditConsent?' checked':'')+'><span>If I attach audited accounts, I confirm the customer agreed to share them with Northwind Security.</span></label></div></div>'+
    '<div class="restricted">'+ic('lock')+'<span>Financial documents can only be opened by your Partner Manager and the Northwind Security approvers. Every view is recorded, and the files are deleted after 2 years.</span></div></div>'+
    '<div class="fsec"><div class="fsec-h"><h2>More about the opportunity</h2><p class="small muted">Optional, but it helps Northwind Security approve your registration faster.</p></div><div class="fgrid">'+
    '<div class="fld"><label for="dn-met">Last meeting with the customer</label><input id="dn-met" name="lastMeeting" type="date" max="'+today()+'" value="'+v('lastMeeting')+'"></div>'+
    '<div class="fld"><label for="dn-src">How did this opportunity start?</label><select id="dn-src" name="source">'+opt(['Partner outreach','Customer enquiry','Tender or RFP','Existing customer, new need','Referral'],dr.source)+'</select></div>'+
    '<div class="fld"><label for="dn-budget">Budget</label><select id="dn-budget" name="budget">'+opt(['Confirmed','Estimated','Not discussed yet'],dr.budget)+'</select></div><div></div>'+
    '<div class="fld full"><label for="dn-need" class="req">Customer\'s business need</label><textarea id="dn-need" name="need" placeholder="What problem does the customer want to solve, and why now?">'+v('need')+'</textarea></div>'+
    '<div class="fld"><label for="dn-evtype">Evidence of engagement</label><select id="dn-evtype" name="evidenceType">'+opt(['Meeting notes','Email from the customer','Tender or RFP document','Customer request for quote'],dr.evidenceType)+'</select></div>'+
    '<div class="fld"><label for="dn-ev">Evidence file</label><input id="dn-ev" name="evidenceFile" type="file" accept=".pdf,.docx,.msg,.eml,.png,.jpg"><span class="hint">'+(dr.evidenceName?'Attached: '+esc(dr.evidenceName)+'. Choose a file to replace it.':'Optional. Meeting notes or an email from the customer.')+'</span></div></div></div>';
    foot=btn('Back',{act:'stepBack'})+btn('Fill sample details (demo)',{cls:'btn-g',act:'fillDeal'})+'<span class="sp"></span>'+btn('Continue',{cls:'btn-p',type:'submit'});
  }
  if(s===3){
    var dup=findDup(dr.customer||'');
    body='<div class="fsec"><div class="fsec-h"><h2>Review your registration</h2></div>'+(dup?'<div class="al al-warn">'+ic('alert')+'<span>'+esc(dupText(dup))+' Northwind Security will review both registrations before deciding.</span></div>':'<div class="al al-ok">'+ic('checkc')+'<span>No existing registration found for this customer.</span></div>')+
    '<dl class="dl"><dt>Customer</dt><dd>'+v('customer')+'</dd><dt>Industry</dt><dd>'+v('industry')+'</dd><dt>Country</dt><dd>'+v('country')+'</dd><dt>Company size</dt><dd>'+v('employees')+'</dd><dt>Registration no.</dt><dd>'+v('regNo')+'</dd><dt>Website</dt><dd>'+v('website')+'</dd><dt>Decision maker</dt><dd>'+v('contact')+', '+v('contactTitle')+' · '+v('contactEmail')+'</dd><dt>Last meeting</dt><dd>'+fmtD(dr.lastMeeting)+'</dd><dt>Customer need</dt><dd>'+v('need')+'</dd><dt>Budget</dt><dd>'+v('budget')+'</dd><dt>Proof of budget</dt><dd>'+v('budgetType')+': '+v('budgetName')+'</dd><dt>Audited accounts</dt><dd>'+(dr.auditName?v('auditName'):'<span class="muted">Not attached</span>')+'</dd><dt>Evidence</dt><dd>'+(dr.evidenceName?v('evidenceType')+': '+v('evidenceName'):'<span class="muted">Not attached</span>')+'</dd><dt>Services</dt><dd>'+esc((dr.services||[]).join(', '))+'</dd><dt>Estimated value</dt><dd class="num">'+mon(Number(dr.value),myPartner().id)+'</dd><dt>Expected close</dt><dd>'+fmtD(dr.closeDate)+'</dd><dt>Stage</dt><dd>'+v('stage')+'</dd><dt>Notes</dt><dd>'+(v('notes')||'<span class="muted">None</span>')+'</dd></dl></div>'+
    '<div class="fsec"><label class="chk" for="dn-confirm"><input id="dn-confirm" name="confirm" type="checkbox"><span>I confirm this is a genuine opportunity, the customer knows we are proposing Northwind Security services, and the information above is accurate. I understand that registrations that cannot be verified are rejected, and that false registrations can affect our partner tier.</span></label></div>'+
    '<div class="al al-info">'+ic('mail')+'<span>After you submit, Northwind Security emails '+v('contact')+' ('+v('contactEmail')+') to confirm they are discussing Northwind Security services with '+esc(myPartner().name)+'. The registration is approved once it is verified.</span></div>';
    foot=btn('Back',{act:'stepBack'})+'<span class="sp"></span>'+btn('Submit registration',{cls:'btn-p',type:'submit'});
  }
  var rules=panel('Registration rules','<ol class="bullets"><li>Register before your first proposal to the customer.</li><li>Attach proof of budget from the customer, such as a letter of intent or purchase order.</li><li>Your Partner Manager, then two Northwind Security approvers, review each registration, usually within 3 business days.</li><li>Approved registrations are protected for 90 days, with one 30-day extension.</li><li>Update each approved deal at least every 30 days. After 50 days without an update, protection is suspended and Northwind Security may give the customer to another partner.</li><li>The first valid, active registration for a customer normally wins a conflict.</li><li>Commission is paid on won deals at your tier rate ('+RATE[myPartner().tier]+'%).</li></ol>');
  return ph([['Home','home'],['Deal registrations','deals'],['New registration']],'Register a deal','Step '+s+' of 3')+
  '<div class="g2"><div class="col"><form class="pn" data-form="deal" novalidate>'+stp+'<div class="pn-b stack" style="gap:20px">'+body+err+'</div><div class="pn-f">'+foot+'</div></form></div><div class="col">'+rules+'</div></div>';
}
function findDup(name){name=(name||'').trim().toLowerCase();if(name.length<3)return null;return S.deals.filter(function(d){return (d.status==='Pending'||d.status==='Approved')&&(d.customer.toLowerCase().indexOf(name)>-1||name.indexOf(d.customer.toLowerCase())>-1)})[0]||null}
function dupText(d){if(d.partnerId!==myPartner().id&&activity(d)==='Inactive')return d.customer+' was registered by another partner, but that registration has had no progress update for '+idle(d)+' days, so its protection is suspended. You can register this customer, and Northwind Security will decide who gets it.';return d.customer+' is already registered '+(d.partnerId===myPartner().id?'by your company':'by another partner')+' ('+d.status.toLowerCase()+', '+d.id+').'}
function dupHTML(name){if((name||'').trim().length<3)return '';var d=findDup(name);return d?'<div class="al al-warn" style="margin-top:6px">'+ic('alert')+'<span>'+esc(dupText(d))+' You can still continue.</span></div>':'<span class="hint" style="color:var(--green-ink)">No existing registration found.</span>'}
function pCustomers(){
  var won=myDeals().filter(function(d){return d.status==='Won'}).sort(function(a,b){return a.closedAt<b.closedAt?1:-1});
  var oneOff=function(d){return d.services.every(function(s){return ['VAPT','Source Code Review','Compromise Assessment'].indexOf(s)>-1})};
  var ren=won.filter(function(d){return !oneOff(d)&&daysUntil(addDays(d.closedAt,365))<=180}).length;
  var rows=won.map(function(d){var r=oneOff(d)?null:addDays(d.closedAt,365),n=r?daysUntil(r):null;var health=oneOff(d)?'Project closed':d.customer==='Pelangi Education'?'Attention needed':'Healthy';
    return '<tr><td><span class="ink b">'+esc(d.customer)+'</span><span class="sub">'+esc(d.industry)+'</span></td><td>'+esc(d.services.join(', '))+'</td><td class="nowrap">'+fmtD(d.closedAt)+'</td><td class="nowrap">'+(r?fmtD(r)+(n<=180?'<span class="sub" style="color:var(--warn-ink)">in '+n+' days</span>':''):'<span class="muted">One-off project</span>')+'</td><td>'+badge(health)+'</td><td class="r">'+btn('View report',{cls:'btn-s',act:'report',id:d.id})+'</td></tr>'}).join('');
  return ph([['Home','home'],['Customers']],'Customers','Northwind Security services delivered to customers you brought in.')+
  '<div class="mx m3"><div><span class="l">Active customers</span><span class="v">'+won.length+'</span><span class="s">From won registrations</span></div><div><span class="l">Renewals in 180 days</span><span class="v">'+ren+'</span><span class="s">Contact customers early</span></div><div><span class="l">Open incidents</span><span class="v">1</span><span class="s">Handled by the Northwind Security SOC</span></div></div>'+
  panel('Customer services',won.length?'<div class="tw"><table class="tb"><thead><tr><th>Customer</th><th>Services</th><th>Customer since</th><th>Renewal</th><th>Service health</th><th><span class="sr">Report</span></th></tr></thead><tbody>'+rows+'</tbody></table></div>':empty('No customers yet','Customers appear here when you mark a registration as won.','building'),{flush:true,foot:'<span>Partners see service health and summary reports. Detailed security alerts stay between the customer and the Northwind Security SOC.</span>'});
}
function pTraining(){
  var t=curTab('training','My learning');
  var body;
  if(t==='My learning'){
    body='<div class="list">'+S.courses.map(function(c){var p=Math.round(c.done/c.modules*100);var st=c.completedAt?'Completed':c.started?'In progress':'Not started';
      var a=c.completedAt?btn('View certificate',{cls:'btn-s',act:'cert',id:c.id}):c.started?btn('Continue',{cls:'btn-s btn-p',act:'course',id:c.id}):btn('Enrol',{cls:'btn-s',act:'course',id:c.id});
      return '<div class="li" style="grid-template-columns:minmax(0,1fr) 180px 120px auto;padding:14px 16px"><div><div class="ink b">'+esc(c.title)+'</div><div class="small muted">'+esc(c.desc)+'</div><div class="small muted">'+c.hours+' hours · '+c.modules+' modules'+(c.completedAt?' · valid until '+fmtD(addDays(c.completedAt,365)):'')+'</div></div><div class="stack" style="gap:4px"><div class="pb'+(c.completedAt?' g':'')+'"><span style="width:'+p+'%"></span></div><span class="small muted">'+c.done+' of '+c.modules+' modules</span></div><div>'+badge(st==='In progress'?'Open':st,st)+'</div><div>'+a+'</div></div>'}).join('')+'</div>';
  }else{
    var c2=S.courses[1];
    var rows=[['Aina Rahman','Partner Admin','Certified','C2'],['Daniel Lim','Sales','Certified',''],['Priya Nair','Technical','Certified',''],['Hafiz Omar','Finance','Not required','']];
    body='<div class="tw"><table class="tb"><thead><tr><th>Person</th><th>Role</th><th>Sales Associate</th><th>Technical Pre-sales</th><th>MDR Deployment</th></tr></thead><tbody>'+rows.map(function(r){var tech=r[3]==='C2'?(c2.completedAt?badge('Completed','Certified'):badge('Open',Math.round(c2.done/c2.modules*100)+'%')):(r[0]==='Priya Nair'?badge('Open','In progress'):'<span class="muted">-</span>');
      return '<tr><td class="ink b">'+r[0]+'</td><td>'+r[1]+'</td><td>'+(r[2]==='Certified'?badge('Completed','Certified'):'<span class="muted">Not required</span>')+'</td><td>'+tech+'</td><td><span class="muted">-</span></td></tr>'}).join('')+'</tbody></table></div>';
  }
  var done=S.courses.filter(function(c){return c.completedAt}).length;
  return ph([['Home','home'],['Training']],'Training and certification','Certifications count toward your partner tier and are valid for 12 months.')+
  '<div class="mx m3"><div><span class="l">Courses completed</span><span class="v">'+done+' of '+S.courses.length+'</span><span class="s">Your own learning</span></div><div><span class="l">Certified sales people</span><span class="v">3</span><span class="s">Company total</span></div><div><span class="l">Certified technical people</span><span class="v">'+certCounts().tech+'</span><span class="s">Gold requires 1</span></div></div>'+
  '<div class="pn">'+tabs('training',['My learning','Team certifications'])+body+'</div>';
}
function pResources(){
  var cats=['All'];S.resources.forEach(function(r){if(cats.indexOf(r.cat)<0)cats.push(r.cat)});
  var cur=ui.f.res||'All',q=(ui.q.res||'').toLowerCase();
  var list=S.resources.filter(function(r){return (cur==='All'||r.cat===cur)&&(!q||r.title.toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return a.date<b.date?1:-1});
  var facets='<div class="facets">'+cats.map(function(c){var n=c==='All'?S.resources.length:S.resources.filter(function(r){return r.cat===c}).length;return '<button type="button" class="facet" aria-pressed="'+(c===cur)+'" data-act="facet" data-k="res" data-t="'+esc(c)+'">'+esc(c)+'<span class="c">'+n+'</span></button>'}).join('')+'</div>';
  return ph([['Home','home'],['Resource library']],'Resource library','The latest sales and technical material. Price lists are watermarked with your company name when downloaded.')+
  '<div class="gs">'+panel('Categories',facets,{flush:true})+'<div class="pn"><div class="tbar">'+searchBox('res','Search resources')+'<span class="sp"></span><span class="small muted">'+list.length+' files</span></div>'+(list.length?resTable(list):empty('No resources match','Try another category or search term.','folder'))+'</div></div>';
}
function pMarketing(){
  var cur=ui.f.cmp||'';
  var cards=CAMPAIGNS.map(function(c){return '<article class="card"><span class="eyebrow">'+c.id+' · Campaign in a box</span><h2>'+esc(c.name)+'</h2><dl class="dl small" style="grid-template-columns:80px minmax(0,1fr);gap:4px 12px"><dt>Goal</dt><dd>'+esc(c.goal)+'</dd><dt>Audience</dt><dd>'+esc(c.audience)+'</dd><dt>Assets</dt><dd>'+c.assets.length+' files</dd></dl><div class="row" style="border-top:1px solid var(--border-soft);padding-top:12px">'+btn(cur===c.id?'Showing assets':'View assets',{cls:'btn-s'+(cur===c.id?' btn-p':''),act:'campaign',id:c.id})+'</div></article>'}).join('');
  var list=cur?CAMPAIGNS.filter(function(c){return c.id===cur})[0].assets.map(resById):S.resources.filter(function(r){return r.cat==='Marketing kit'||r.cat==='Brand assets'});
  var sw=[['#1F4E79','Navy'],['#2E86AB','Blue'],['#F18F01','Orange'],['#3C4650','Slate grey']].map(function(c){return '<div class="swatch"><i style="background:'+c[0]+'"></i><span><span class="ink b" style="display:block">'+c[1]+'</span><span class="small muted">'+c[0]+'</span></span></div>'}).join('');
  return ph([['Home','home'],['Marketing']],'Marketing','Ready-made campaigns and co-branded material for Northwind Security services.')+
  '<div class="cards">'+cards+'</div>'+
  '<div class="g2"><div class="col">'+panel(cur?'Assets for '+esc(cur):'Marketing assets',resTable(list),{flush:true,actions:cur?btn('Show all assets',{cls:'btn-g btn-s',act:'campaign',id:''}):''})+'</div><div class="col">'+
  panel('Brand guidelines','<div class="stack"><div class="gh" style="gap:12px">'+sw+'</div><dl class="dl" style="grid-template-columns:80px minmax(0,1fr)"><dt>Typeface</dt><dd>System sans-serif (Segoe UI, Helvetica, Arial)</dd><dt>Logo</dt><dd>Use the "Northwind Security Partner" lock-up. Do not redraw or recolour the logo.</dd><dt>Approval</dt><dd>Send new material to your channel manager before publishing.</dd></dl></div>')+
  panel('Marketing development funds','<p class="muted">MDF lets Gold and Platinum partners claim part of their campaign costs. Requests, approvals and proof of execution will be handled here in Phase 3.</p>')+'</div></div>';
}
function pCommissions(){
  var p=myPartner(),st=stats();
  var lines=S.commissions.filter(function(c){return c.partnerId===myPartner().id});
  var paid=lines.filter(function(c){return c.status==='Paid'&&parseD(c.closedAt).getFullYear()===YNOW}).reduce(function(a,c){return a+c.amount},0);
  var rows=lines.map(function(c){var a=c.status==='Awaiting invoice'?btn('Upload invoice',{cls:'btn-s btn-p',icon:'up',act:'invoice',id:c.id}):c.status==='Invoice submitted'?'<span class="small muted">'+esc(c.invoice)+'</span>':c.status==='Ready for payment'?'<span class="small muted">Approved '+fmtD(c.approvedAt)+'</span>':'<span class="small muted">Paid '+fmtD(c.paidAt)+(c.payRef?' · ref '+esc(c.payRef):'')+'</span>';
    return '<tr><td class="id">'+(allowed('deal')?'<button type="button" class="link" data-act="nav" data-v="deal" data-id="'+c.dealId+'">'+c.dealId+'</button>':c.dealId)+'</td><td class="ink">'+esc(c.customer)+'</td><td>'+esc(c.service)+'</td><td class="nowrap">'+fmtD(c.closedAt)+'</td><td class="r num nowrap">'+mon(c.value,c.partnerId)+'</td><td class="r num">'+c.rate+'%</td><td class="r num nowrap b ink">'+mon(c.amount,c.partnerId)+'</td><td>'+badge(c.status,payLabel(c.status))+'</td><td class="r">'+a+'</td></tr>'}).join('');
  return ph([['Home','home'],['Commissions']],'Commissions','Commission is earned on registered deals marked as won, at your tier rate on the date the deal closes. Tier rates shown are illustrative sample values.',btn('Download statement',{icon:'down',act:'export'}))+
  '<div class="mx"><div><span class="l">Earned in '+YNOW+'</span><span class="v">'+mon(st.commY,myPartner().id)+'</span><span class="s">Year to date</span></div><div><span class="l">Paid</span><span class="v">'+mon(paid,myPartner().id)+'</span><span class="s">By bank transfer</span></div><div><span class="l">Outstanding</span><span class="v">'+mon(st.commWait,myPartner().id)+'</span><span class="s">Awaiting invoice or payment</span></div><div><span class="l">Current rate</span><span class="v">'+RATE[p.tier]+'%</span><span class="s">'+esc(p.tier)+' tier · sample rate</span></div></div>'+
  '<div class="g2"><div class="col">'+panel('Commission lines','<div class="tw"><table class="tb"><thead><tr><th>Registration</th><th>Customer</th><th>Service</th><th>Closed</th><th class="r">Deal value</th><th class="r">Rate</th><th class="r">Commission</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+rows+'</tbody></table></div>',{flush:true})+'</div><div class="col">'+
  panel('How payouts work','<ol class="bullets"><li>Mark the registration as won when the customer signs.</li><li>Upload your invoice quoting the registration number.</li><li>Northwind Security Finance checks and pays within 30 days.</li></ol>')+
  panel('Rates by tier','<table class="tb"><tbody>'+TIERS.map(function(t){return '<tr><td'+(t===p.tier?' class="b ink"':'')+'>'+t+(t===p.tier?' (you)':'')+'</td><td class="r num'+(t===p.tier?' b ink':'')+'">'+RATE[t]+'%</td></tr>'}).join('')+'</tbody></table>',{flush:true,foot:'<span>Illustrative sample rates, not real commercial terms.</span>'})+'</div></div>';
}
function pCases(){
  var list=S.tickets.filter(function(t){return t.partnerId===myPartner().id});
  return ph([['Home','home'],['Support cases']],'Support cases','Pre-sales, technical, billing and portal questions for the Northwind Security partner team. For an active security incident, call the SOC hotline.',btn('New case',{cls:'btn-p',icon:'plus',act:'newCase'}))+
  panel('',caseTable(list,false),{flush:true});
}
function caseTable(list,withPartner){
  if(!list.length)return empty('No cases','Cases you open appear here.','life');
  return '<div class="tw"><table class="tb"><thead><tr><th>Case</th><th>Subject</th>'+(withPartner?'<th>Partner</th>':'')+'<th>Type</th><th>Related customer</th><th>Status</th><th>Last updated</th></tr></thead><tbody>'+list.map(function(t){return '<tr class="rw" data-act="nav" data-v="case" data-id="'+t.id+'"><td class="id">'+t.id+'</td><td><button type="button" class="link b" data-act="nav" data-v="case" data-id="'+t.id+'">'+esc(t.subject)+'</button></td>'+(withPartner?'<td>'+esc(partnerById(t.partnerId).name)+'</td>':'')+'<td>'+esc(t.type)+'</td><td>'+(t.customer?esc(t.customer):'<span class="muted">-</span>')+'</td><td>'+badge(t.status)+'</td><td class="nowrap">'+fmtTime(t.updated)+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function pCase(){
  var t=caseById(ui.id);if(!t){ui.v=isStaff()?'a-cases':'cases';return pageHTML()}
  var staff=isStaff();
  var msgs='<div class="stack">'+t.messages.map(function(m){return '<div class="msg'+(m.staff?' staff':'')+'"><div class="w"><b>'+esc(m.by)+'</b><span>'+fmtTime(m.at)+'</span></div><div>'+esc(m.text)+'</div></div>'}).join('')+'</div>';
  var err=ui.formErr?'<p class="err" role="alert">'+esc(ui.formErr)+'</p>':'';
  var reply='<form class="stack" data-form="reply" novalidate><div class="fld"><label for="rp-text">'+(staff?'Reply to partner':'Add a reply')+'</label><textarea id="rp-text" name="text"></textarea></div>'+err+'<div class="row" style="justify-content:flex-end">'+btn('Send reply',{cls:'btn-p',type:'submit'})+'</div></form>';
  var status=staff?'<label class="sr" for="cs-status">Status</label><select id="cs-status" class="sel" data-change="caseStatus" data-id="'+t.id+'">'+['Open','In progress','Waiting on you','Resolved'].map(function(s){return '<option value="'+s+'"'+(s===t.status?' selected':'')+'>'+(s==='Waiting on you'?'Waiting on partner':s)+'</option>'}).join('')+'</select>':badge(t.status);
  var acts=!staff&&t.status!=='Resolved'?btn('Mark as resolved',{act:'resolveCase',id:t.id}):'';
  var crumbs=staff?[['Overview','a-home'],['Support cases','a-cases'],[t.id]]:[['Home','home'],['Support cases','cases'],[t.id]];
  return ph(crumbs,esc(t.subject),t.id+' · '+esc(t.type),acts)+
  '<div class="g2"><div class="col">'+panel('Conversation',msgs+'<div style="border-top:1px solid var(--border);margin-top:16px;padding-top:16px">'+reply+'</div>',{meta:t.messages.length+' messages'})+'</div><div class="col">'+
  panel('Case details','<dl class="dl" style="grid-template-columns:100px minmax(0,1fr)"><dt>Status</dt><dd>'+status+'</dd><dt>Case</dt><dd>'+t.id+'</dd><dt>Type</dt><dd>'+esc(t.type)+'</dd><dt>Partner</dt><dd>'+esc(partnerById(t.partnerId).name)+'</dd><dt>Customer</dt><dd>'+(t.customer?esc(t.customer):'-')+'</dd><dt>Opened</dt><dd>'+fmtTime(t.messages[0].at)+'</dd><dt>Updated</dt><dd>'+fmtTime(t.updated)+'</dd></dl>')+'</div></div>';
}
function pSettings(){
  var t=curTab('settings','Users'),u=me(),p=myPartner(),body='';
  if(t==='Users'){
    body='<div class="tbar"><span class="small muted">'+myUsers().length+' users</span><span class="sp"></span>'+btn('Invite user',{cls:'btn-p',icon:'plus',act:'invite'})+'</div><div class="tw"><table class="tb"><thead><tr><th>Name</th><th>Role</th><th>Two-step verification</th><th>Status</th><th>Last active</th><th><span class="sr">Actions</span></th></tr></thead><tbody>'+
    myUsers().map(function(x){var self=x.id===u.id;
      var role=!self?'<label class="sr" for="role-'+x.id+'">Role for '+esc(x.name)+'</label><select id="role-'+x.id+'" class="sel" data-change="userRole" data-id="'+x.id+'">'+ROLES.map(function(r){return '<option'+(r===x.role?' selected':'')+'>'+r+'</option>'}).join('')+'</select>':esc(x.role)+' <span class="small muted">(you)</span>';
      var acts=self?'':(x.status==='Invited'?btn('Resend invite',{cls:'btn-s',act:'resend',id:x.id})+' ':'')+btn('Remove',{cls:'btn-s btn-d',act:'removeUser',id:x.id});
      return '<tr><td><span class="ink b">'+esc(x.name)+'</span><span class="sub">'+esc(x.email)+'</span></td><td>'+role+'</td><td>'+(x.mfa==='Not set up'?badge('Pending','Not set up'):badge('Active',x.mfa))+'</td><td>'+badge(x.status)+'</td><td class="nowrap">'+(x.last?fmtTime(x.last):'Never')+'</td><td class="r nowrap">'+acts+'</td></tr>'}).join('')+'</tbody></table></div>';
  }
  if(t==='Roles and permissions'){
    var perm=[['Register and update deals','Yes','Yes','View only','No'],['Products and resources','Yes','Yes','Yes','No'],['Marketing campaigns','Yes','Yes','No','No'],['Customer service reports','Yes','No','Yes','No'],['Commissions and invoices','Yes','No','No','Yes'],['Support cases','Yes','Yes','Yes','Yes'],['Users, roles and security','Yes','No','No','No']];
    body='<div class="tw"><table class="tb bt"><thead><tr><th>Permission</th>'+ROLES.map(function(r){return '<th>'+r+'</th>'}).join('')+'</tr></thead><tbody>'+perm.map(function(r){return '<tr><td>'+r[0]+'</td>'+r.slice(1).map(function(v){return '<td class="'+(v==='Yes'?'yes':v==='No'?'no':'')+'">'+v+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
  }
  if(t==='Security'){
    var sess=S.sessions.map(function(s){return '<tr><td class="ink">'+esc(s.device)+'</td><td>'+esc(s.where)+'</td><td>'+esc(s.last)+'</td><td class="r">'+(s.current?badge('Active','This session'):btn('Sign out',{cls:'btn-s',act:'revoke',id:s.id}))+'</td></tr>'}).join('');
    var ev=S.audit.filter(function(a){return a.actor.indexOf(myDomain())>-1}).slice(0,8).map(function(a){return '<tr><td class="nowrap">'+fmtTime(a.at)+'</td><td>'+esc(a.actor)+'</td><td'+(a.level==='warn'?' style="color:var(--danger)"':'')+'>'+esc(a.text)+'</td><td>'+badge(a.level==='warn'?'Security':'Activity')+'</td></tr>'}).join('');
    body='<div class="pn-b"><dl class="dl"><dt>Two-step verification</dt><dd>Required for all users (set by Northwind Security)</dd><dt>Idle sign-out</dt><dd>30 minutes</dd><dt>Invitations</dt><dd>Restricted to @'+myDomain()+'</dd><dt>Failed sign-ins</dt><dd>Account locked for 15 minutes after 5 attempts</dd></dl></div>'+
    '<div class="pn-h" style="border-top:1px solid var(--border)"><h2>Active sessions</h2>'+(S.sessions.length>1?btn('Sign out other sessions',{cls:'btn-s',act:'revokeAll'}):'')+'</div><div class="tw"><table class="tb"><thead><tr><th>Device</th><th>Location</th><th>Last active</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+sess+'</tbody></table></div>'+
    '<div class="pn-h" style="border-top:1px solid var(--border)"><h2>Recent account activity</h2></div><div class="tw"><table class="tb"><thead><tr><th>Time</th><th>User</th><th>Event</th><th>Type</th></tr></thead><tbody>'+ev+'</tbody></table></div>';
  }
  if(t==='Company profile'){
    body='<div class="pn-b"><dl class="dl"><dt>Company name</dt><dd>'+esc(p.name)+'</dd><dt>Registration no.</dt><dd>202101045678 (sample)</dd><dt>Partner type</dt><dd>'+esc(p.type)+'</dd><dt>Tier</dt><dd>'+tierB(p.tier)+'</dd><dt>Location</dt><dd>'+esc(p.city)+', '+esc(p.country)+'</dd><dt>Partner since</dt><dd>'+fmtD(p.joined)+'</dd><dt>Partner agreement</dt><dd>Signed, renews annually</dd><dt>Bank details</dt><dd>Verified by Northwind Security Finance</dd></dl></div>';
  }
  return ph([['Home','home'],['Company settings']],'Company settings','Manage who can access the portal and how your company account is protected.')+
  '<div class="pn">'+tabs('settings',['Users','Roles and permissions','Security','Company profile'])+(t==='Users'||t==='Security'||t==='Company profile'?body:'<div>'+body+'</div>')+'</div>';
}

/* ---------- staff pages ---------- */
function aHome(){
  var u=me(),q=myQueue(),deals=S.deals.filter(function(d){return seeDeal(d)&&inScope(partnerById(d.partnerId))});
  var pend=deals.filter(function(d){return d.status==='Pending'}).sort(function(a,b){return a.submitted<b.submitted?-1:1});
  var items=apItems().filter(canSeeItem),apps=items.filter(function(it){return it.k==='app'});
  var ps=S.partners.filter(function(p){return p.status==='Active'&&canSeePartner(p)}),byC={};ps.forEach(function(p){byC[p.country]=(byC[p.country]||0)+1});
  var pipe=deals.filter(function(d){return d.status==='Pending'||d.status==='Approved'}).reduce(function(a,d){return a+toMyr(d.value,d.partnerId)},0);
  var stale=deals.filter(function(d){return activity(d)&&activity(d)!=='Active'}).sort(function(a,b){return idle(b)-idle(a)});
  var rq=pend.length?'<div class="tw"><table class="tb"><thead><tr><th>Customer</th><th>Owner</th><th class="r">Est. value</th><th>Duplicate check</th><th>Verification</th><th>Approval</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+pend.map(function(d){var it=apItem('deal',d.id),p=partnerById(d.partnerId);
    return '<tr><td><button type="button" class="link b" data-act="nav" data-v="deal" data-id="'+d.id+'">'+esc(d.customer)+'</button><span class="sub">'+esc(p.name)+' · '+d.id+'</span></td><td class="nowrap">'+ownerChip(p.pmId)+'</td><td class="r num nowrap">'+mon(d.value,d.partnerId)+myrNote(d.value,d.partnerId)+'</td><td>'+(function(){var r=rival(d);return !r?badge('Won','No duplicate'):activity(r)==='Inactive'?badge('Update due','Holder inactive'):badge('Rejected','Possible conflict')})()+'</td><td class="nowrap">'+verifyBadge(d)+'</td><td class="nowrap">'+(it?stepDots(it)+(myTurn(it)?'<span class="b ink">You</span>':esc(pmName(apWho(it))))+'<span class="sub"'+(apDue(it)==='Overdue'?' style="color:var(--danger)"':'')+'>Step '+(it.o.appr.step+1)+' of 3'+(apDue(it)==='Overdue'?' · overdue':'')+'</span>':'-')+'</td><td class="r nowrap">'+btn(it&&myTurn(it)?'Review':'View',{cls:'btn-s'+(it&&myTurn(it)?' btn-p':''),act:'nav',v:'deal',id:d.id})+'</td></tr>'}).join('')+'</tbody></table></div>':empty('Nothing in review','There are no registrations waiting for a decision in your territory.','checkc');
  var log5='<div class="tw"><table class="tb"><tbody>'+S.audit.slice(0,7).map(function(a){return '<tr><td class="nowrap small muted" style="width:130px">'+fmtTime(a.at)+'</td><td'+(a.level==='warn'?' style="color:var(--danger)"':'')+'><span class="b">'+esc(a.actor)+'</span> '+esc(a.text)+'</td></tr>'}).join('')+'</tbody></table></div>';
  var gap=orphans().filter(function(x){return S.partners.some(function(p){return p.pmId===x.id&&canSeePartner(p)})}).map(function(x){return '<div class="al al-warn">'+ic('alert')+'<span><span class="b">'+esc(x.name)+' has left without a handover.</span> '+esc(pmName(APPROVER3))+' covers their partners until the Portal admin hands them over.</span></div>'}).join('');
  return gap+ph(null,'Overview',esc(u.all?'All territories':u.terrs.join(' and ')+(u.terrs.length>1?' territories':' territory'))+' · '+esc(u.name),scopeCtl()+(canPublish()?btn('Post announcement',{icon:'mega',act:'tabTo',k:'acontent',t:'Announcements',v:'a-content'}):myPartnersAll().length?btn('Message my partners',{icon:'mail',act:'tabTo',k:'acontent',t:'Announcements',v:'a-content'}):''))+
  '<div class="mx"><div><span class="l">Waiting for my approval</span><span class="v">'+q.length+'</span><span class="s">'+q.filter(function(it){return apDue(it)==='Overdue'}).length+' overdue</span></div><div><span class="l">Registrations in review</span><span class="v">'+pend.length+'</span><span class="s">Target: 3 business days</span></div><div><span class="l">Partner applications</span><span class="v">'+apps.length+'</span><span class="s">'+Object.keys(byC).map(function(k){return esc(k)+' '+byC[k]}).join(' · ')+' active partners</span></div><div><span class="l">Deals without recent progress</span><span class="v">'+stale.length+'</span><span class="s">'+stale.filter(function(d){return activity(d)==='Inactive'}).length+' inactive · pipeline '+rmShort(pipe)+'</span></div></div>'+
  panel('Waiting for my approval',apTable(q,'Nothing is waiting for you'),{flush:true,actions:btn('My approvals',{cls:'btn-g btn-s',act:'nav',v:'a-approvals'})})+
  panel('Registrations in review',rq,{flush:true,actions:btn('All registrations',{cls:'btn-g btn-s',act:'nav',v:'a-deals'})})+
  panel('Deals without recent progress',stale.length?'<div class="tw"><table class="tb"><thead><tr><th>Customer</th><th>Partner</th><th>Owner</th><th>Last update</th><th>Next step</th><th>Protected until</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+stale.map(function(d){var p=partnerById(d.partnerId);return '<tr><td><button type="button" class="link b" data-act="nav" data-v="deal" data-id="'+d.id+'">'+esc(d.customer)+'</button><span class="sub">'+d.id+' · '+mon(d.value,d.partnerId)+'</span></td><td>'+esc(p.name)+'</td><td class="nowrap">'+ownerChip(p.pmId)+'</td><td class="nowrap">'+actCell(d)+'</td><td>'+(d.nextStep?esc(d.nextStep)+'<span class="sub"'+(d.nextStepDate&&daysUntil(d.nextStepDate)<0?' style="color:var(--danger)"':'')+'>'+(d.nextStepDate?'Due '+fmtD(d.nextStepDate):'')+'</span>':'<span class="muted">Not set</span>')+'</td><td class="nowrap">'+fmtD(d.protectedUntil)+'</td><td class="r nowrap">'+(ownsPartner(p)?btn('Send reminder',{cls:'btn-s',act:'nudge',id:d.id}):'')+'</td></tr>'}).join('')+'</tbody></table></div>':empty('Every approved deal is up to date','Deals appear here when a partner has not updated them for 30 days.','checkc'),{flush:true,meta:'Update due after 30 days · protection suspended after 50',actions:btn('View all',{cls:'btn-g btn-s',act:'tabTo',k:'adeals',t:'Inactive',v:'a-deals'})})+
  panel('Recent activity',log5,{flush:true,actions:btn('Audit log',{cls:'btn-g btn-s',act:'nav',v:'a-audit'})});
}
function aApprovals(){
  var u=me(),T=['Waiting for me','In progress','All types'],cur=curTab('aappr','Waiting for me');
  var all=apItems().filter(canSeeItem),mine=all.filter(myTurn);
  var list=cur==='Waiting for me'?mine:cur==='In progress'?all.filter(function(it){return !myTurn(it)}):all;
  var counts={'Waiting for me':mine.length,'In progress':all.length-mine.length,'All types':all.length};
  return ph([['Overview','a-home'],['My approvals']],'My approvals','Deal registrations, partner applications, tier changes and commission payouts.')+
  '<div class="pn">'+tabs('aappr',T,counts)+apTable(list,cur==='Waiting for me'?'Nothing is waiting for you':'Nothing in progress')+'</div>';
}
function aDeals(){
  var u=me(),vis=S.deals.filter(function(d){return seeDeal(d)&&inScope(partnerById(d.partnerId))});
  var T=['Pending','Approved','Update due','Inactive','Won','Lost','Expired','Rejected','All'];var counts={};T.forEach(function(t){counts[t]=vis.filter(function(d){return matchTab(d,t)}).length});
  var appr=vis.filter(function(d){return d.status==='Approved'}),cnt=function(a){return appr.filter(function(d){return activity(d)===a}).length};
  var health='<div class="mx"><div><span class="l">Approved, in progress</span><span class="v">'+appr.length+'</span><span class="s">'+rmShort(appr.reduce(function(a,d){return a+toMyr(d.value,d.partnerId)},0))+' pipeline'+(me().terrs.some(function(t){return t!=='Malaysia'})?' (in RM)':'')+'</span></div><div><span class="l">Active</span><span class="v">'+cnt('Active')+'</span><span class="s">Updated in the last 30 days</span></div><div><span class="l">Update due</span><span class="v" style="color:var(--warn-ink)">'+cnt('Update due')+'</span><span class="s">30 to 49 days without an update</span></div><div><span class="l">Inactive</span><span class="v" style="color:var(--danger)">'+cnt('Inactive')+'</span><span class="s">50+ days, protection suspended</span></div></div>';
  var ext=vis.filter(function(d){return d.extensionRequested});
  var pg=paged('adeals',dealFilter(vis,'adeals'));
  return ph([['Overview','a-home'],['Deal registrations']],'Deal registrations',(u.all?'Registrations from all territories.':'Registrations from partners in '+esc(terrText(u))+'.')+' Approved deals need an update every 30 days; protection is suspended after 50.',btn('Export',{icon:'down',act:'export'}))+health+
  (ext.length?'<div class="al al-warn">'+ic('clock')+'<span>'+ext.length+' extension request'+(ext.length>1?'s':'')+' waiting: '+ext.map(function(d){return '<button type="button" class="link" data-act="nav" data-v="deal" data-id="'+d.id+'">'+esc(d.customer)+'</button>'}).join(', ')+'</span></div>':'')+
  '<div class="pn">'+tabs('adeals',T,counts)+dealToolbar('adeals')+dealTable(pg.rows,true)+pager('adeals',pg)+'</div>';
}
function aPartners(){
  var u=me(),t=curTab('apartners','Partners'),body,ps=S.partners.filter(function(p){return canSeePartner(p)&&inScope(p)});
  var apps=S.applications.filter(function(a){return u.all||covers(u,a.country)});
  var invs=(S.invites||[]).filter(function(i){return u.all||covers(u,i.country)});
  if(t==='Partners'){
    body='<div class="tw"><table class="tb"><thead><tr><th>Partner</th><th>Type</th><th>Location</th><th>Owner</th><th>Tier</th><th class="r">Open deals</th><th class="r">Won, '+YNOW+' (local)</th></tr></thead><tbody>'+ps.map(function(p){var ds=S.deals.filter(function(d){return d.partnerId===p.id});
      var open=ds.filter(function(d){return d.status==='Pending'||d.status==='Approved'}).length;var won=ds.filter(function(d){return d.status==='Won'&&d.closedAt&&parseD(d.closedAt).getFullYear()===YNOW}).reduce(function(a,d){return a+d.value},0);
      var opts=pmsFor(p.country);
      var pmCell=u.id===APPROVER3&&opts.length>1?'<label class="sr" for="pm-'+p.id+'">Owner of '+esc(p.name)+'</label><select id="pm-'+p.id+'" class="sel" data-change="reassign" data-id="'+p.id+'">'+opts.map(function(x){return '<option value="'+x.id+'"'+(x.id===p.pmId?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':ownerChip(p.pmId);
      var it=p.tierReq?apItem('tier',p.id):null;
      var tierCell=it?tierB(p.tier)+'<span class="sub">'+esc(p.tierReq.to)+' requested · '+esc(apStepText(it))+'</span>'+(myTurn(it)?'<div style="margin-top:6px">'+btn('Review',{cls:'btn-s btn-p',act:'apOpen',k:'tier',id:p.id})+'</div>':''):
        ownsPartner(p)?'<label class="sr" for="tier-'+p.id+'">Request tier change for '+esc(p.name)+'</label><select id="tier-'+p.id+'" class="sel" data-change="tier" data-id="'+p.id+'">'+TIERS.map(function(x){return '<option'+(x===p.tier?' selected':'')+'>'+x+'</option>'}).join('')+'</select>':tierB(p.tier);
      return '<tr><td><span class="ink b">'+esc(p.name)+'</span><span class="sub">'+p.id+' · since '+fmtD(p.joined)+'</span></td><td>'+esc(p.type)+'</td><td>'+esc(p.city)+', '+esc(p.country)+'</td><td>'+pmCell+'</td><td>'+tierCell+'</td><td class="r num">'+open+'</td><td class="r num nowrap">'+mon(won,p.id)+myrNote(won,p.id)+'</td></tr>'}).join('')+'</tbody></table></div>'+
      (u.id===APPROVER3?'<div class="pn-f"><span class="small muted">Change the owner with the menu in the Owner column. Owners must be in the partner\'s country.</span></div>':'');
  }else if(t==='Applications'){
    var sorted=apps.slice().sort(function(a,b){return a.status==='New'?-1:b.status==='New'?1:0});
    body=sorted.length?'<div class="tw"><table class="tb"><thead><tr><th>Reference</th><th>Company</th><th>Country</th><th>Owner</th><th>Current step</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+sorted.map(function(a){var it=a.status==='New'?apItem('app',a.id):null;
      return '<tr><td class="id">'+esc(a.id)+'</td><td><span class="ink b">'+esc(a.company)+'</span><span class="sub">'+esc(a.type)+' · '+esc(a.contact)+'</span></td><td>'+esc(a.country)+'</td><td class="nowrap">'+ownerChip(a.pmId)+(a.invite?'<span class="sub">Invited</span>':'')+'</td><td class="nowrap">'+(it?stepDots(it)+(myTurn(it)?'<span class="b ink">You</span>':esc(pmName(apWho(it))))+'<span class="sub">Step '+(it.o.appr.step+1)+' of 3</span>':badge(a.status))+'</td><td class="r">'+btn(it&&myTurn(it)?'Review':'View',{cls:'btn-s'+(it&&myTurn(it)?' btn-p':''),act:'reviewApp',id:a.id})+'</td></tr>'}).join('')+'</tbody></table></div>':empty('No applications','');
  }else{
    body=invs.length?'<div class="tw"><table class="tb"><thead><tr><th>Company</th><th>Contact</th><th>Country</th><th>Owner</th><th>Sent</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+invs.map(function(i){
      return '<tr><td class="ink b">'+esc(i.company)+'</td><td>'+esc(i.contact)+'<span class="sub">'+esc(i.email)+'</span></td><td>'+esc(i.country)+'</td><td class="nowrap">'+ownerChip(i.pmId)+'</td><td class="nowrap">'+fmtD(i.at)+'</td><td>'+badge(i.status==='Sent'?'Pending':'Approved',i.status)+'</td><td class="r">'+(i.status==='Sent'?btn('Open invitation link',{cls:'btn-s',act:'openInvite',id:i.id}):'')+'</td></tr>'}).join('')+'</tbody></table></div><div class="pn-f"><span class="small muted">Demo: "Open invitation link" shows the application form the company receives, with the owner already filled in.</span></div>':empty('No invitations','Partner Managers invite companies they have already spoken to.','mail');
  }
  return ph([['Overview','a-home'],['Partners']],'Partners',(u.all?'Partners in all territories.':'Partners in '+esc(terrText(u))+'.'),hasRole('Partner Manager')?btn('Invite a partner',{cls:'btn-p',icon:'plus',act:'invitePartner'}):'')+
  '<div class="pn">'+tabs('apartners',['Partners','Applications','Invitations'],{Partners:ps.length,Applications:apItems().filter(function(it){return it.k==='app'&&canSeeItem(it)}).length,Invitations:invs.filter(function(i){return i.status==='Sent'}).length})+(t==='Partners'&&showScope()?'<div class="tbar"><span class="sp"></span>'+scopeCtl()+'</div>':'')+body+'</div>';
}
function aPayouts(){
  var fin=hasRole('Finance'),rank={'Ready for payment':0,'Invoice submitted':1,'Awaiting invoice':2,Paid:3};
  var rows=S.commissions.filter(function(c){var p=partnerById(c.partnerId);return fin||canSeePartner(p)&&inScope(p)}).slice().sort(function(x,y){return fin?rank[x.status]-rank[y.status]:0}).map(function(c){var it=c.status==='Invoice submitted'?apItem('pay',c.id):null;
    var a=it?btn(myTurn(it)?'Review':'View',{cls:'btn-s'+(myTurn(it)?' btn-p':''),act:'apOpen',k:'pay',id:c.id}):c.status==='Ready for payment'?(fin?btn('Record payment',{cls:'btn-s btn-p',act:'recordPay',id:c.id}):'<span class="small muted">With '+esc(pmName(FINANCE))+', Finance</span>'):c.status==='Paid'?'<span class="small muted">Paid '+fmtD(c.paidAt)+(c.payRef?' · ref '+esc(c.payRef):'')+'</span>':'<span class="small muted">Waiting for invoice</span>';
    return '<tr><td class="id">'+(allowed('deal')?'<button type="button" class="link" data-act="nav" data-v="deal" data-id="'+c.dealId+'">'+c.dealId+'</button>':c.dealId)+'</td><td class="ink">'+esc(partnerById(c.partnerId).name)+(fin?'<span class="sub">'+esc(partnerById(c.partnerId).country)+'</span>':'')+'</td><td class="nowrap">'+ownerChip(partnerById(c.partnerId).pmId)+'</td><td>'+esc(c.customer)+'</td><td class="r num nowrap b ink">'+mon(c.amount,c.partnerId)+myrNote(c.amount,c.partnerId)+'</td><td>'+(c.invoice?esc(c.invoice):'<span class="muted">-</span>')+'</td><td>'+badge(c.status)+(it?'<span class="sub">With '+(myTurn(it)?'you':esc(pmName(apWho(it))))+' · step '+(it.o.appr.step+1)+' of 3</span>':'')+'</td><td class="r">'+a+'</td></tr>'}).join('');
  return ph([['Overview','a-home'],['Payouts']],'Payouts',fin?'Approved commission payouts from every country. Make the bank transfer, then record the payment here.':'Commission lines from won registrations in your territory.',btn('Export',{icon:'down',act:'export'}))+
  panel('',(showScope()?'<div class="tbar"><span class="sp"></span>'+scopeCtl()+'</div>':'')+(rows?'<div class="tw"><table class="tb"><thead><tr><th>Registration</th><th>Partner</th><th>Owner</th><th>Customer</th><th class="r">Commission</th><th>Invoice</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+rows+'</tbody></table></div>':empty('No payouts','')),{flush:true});
}
function aCases(){
  var T=['Open','In progress','Waiting on you','Resolved','All'];var cur=curTab('acases','Open');
  var vis=S.tickets.filter(function(x){return canSeePartner(partnerById(x.partnerId))});
  var counts={};T.forEach(function(t){counts[t]=t==='All'?vis.length:vis.filter(function(x){return x.status===t}).length});
  var list=vis.filter(function(x){return cur==='All'||x.status===cur});
  return ph([['Overview','a-home'],['Support cases']],'Support cases','Questions from partners in your territory.')+'<div class="pn">'+tabs('acases',T,counts)+caseTable(list,true)+'</div>';
}
function reqForm(err){return '<form class="pn" data-form="creq" novalidate><div class="pn-h"><h2>Request content</h2></div><div class="pn-b stack"><p class="small muted">Requests go to '+esc(pmName('S-ZAR'))+' in Marketing.</p>'+
  '<div class="fld"><label for="cr-title" class="req">What do you need?</label><input id="cr-title" name="title" placeholder="For example: banking case study for Sri Lanka"></div>'+
  '<div class="fld"><label for="cr-det">Details</label><textarea id="cr-det" name="detail" style="min-height:110px" placeholder="Which partner or customer it is for, and when you need it"></textarea></div>'+err+'</div><div class="pn-f" style="justify-content:flex-end">'+btn('Send request',{cls:'btn-p',type:'submit'})+'</div></form>'}
function msgForm(err){var ps=myPartnersAll();if(!ps.length)return panel('Message my partners','<p class="muted">You do not own any partners yet.</p>');
  return '<form class="pn" data-form="pmmsg" novalidate><div class="pn-h"><h2>Message my partners</h2></div><div class="pn-b stack"><p class="small muted">Only the partners you own receive this. Company-wide announcements are posted by Marketing.</p>'+
  '<fieldset class="fld"><legend>Send to</legend>'+ps.map(function(p){return '<label class="chk" for="mm-'+p.id+'"><input id="mm-'+p.id+'" name="pid" value="'+p.id+'" type="checkbox" checked>'+esc(p.name)+'</label>'}).join('')+'</fieldset>'+
  '<div class="fld"><label for="mm-title" class="req">Subject</label><input id="mm-title" name="title"></div>'+
  '<div class="fld"><label for="mm-body" class="req">Message</label><textarea id="mm-body" name="body" style="min-height:140px"></textarea></div>'+err+'</div><div class="pn-f" style="justify-content:flex-end">'+btn('Send message',{cls:'btn-p',type:'submit'})+'</div></form>'}
function reqTable(){var list=(S.contentReqs||[]).filter(function(r){return canPublish()||r.by===me().id});
  if(!list.length)return panel('',empty('No content requests','Partner Managers can ask Marketing for new sales material from the Resources tab.','folder'));
  return panel('',  '<div class="tw"><table class="tb"><thead><tr><th>Request</th><th>Requested by</th><th>Date</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+list.map(function(r){
    return '<tr><td><span class="ink b">'+esc(r.title)+'</span>'+(r.detail?'<span class="sub">'+esc(r.detail)+'</span>':'')+'</td><td class="nowrap">'+ownerChip(r.by)+'</td><td class="nowrap">'+fmtD(r.at)+'</td><td>'+badge(r.status==='Open'?'Pending':'Approved',r.status)+'</td><td class="r">'+(canPublish()&&r.status==='Open'?btn('Mark as done',{cls:'btn-s',act:'reqDone',id:r.id}):'')+'</td></tr>'}).join('')+'</tbody></table></div>',{flush:true})}
function aTeam(){var admin=hasRole('Portal admin');
  var rows=STAFF_LIST.map(function(x){var n=S.partners.filter(function(p){return p.pmId===x.id&&p.status==='Active'}).length,left=x.status==='Left';
    var st=left?(x.handedTo?badge('Left')+'<span class="sub">'+fmtD(x.leftAt)+(x.handedTo==='none'?'':' · handed to '+esc(x.handedTo.split(',').map(pmName).join(' and ')))+'</span>':badge('Rejected','Handover needed')+'<span class="sub">Account disabled '+fmtD(x.leftAt)+'</span>'):badge('Active');
    var act=!admin||x.roles.indexOf('Portal admin')>-1?'':left?(x.handedTo?'':btn('Hand over',{cls:'btn-s btn-p',act:'offboard',id:x.id})):btn('Offboard',{cls:'btn-s',act:'offboard',id:x.id});
    return '<tr'+(left?' class="gone"':'')+'><td><span class="own"><span class="av xs">'+initials(x.name)+'</span><span><span class="ink b">'+esc(x.name)+'</span><span class="sub">'+esc(x.email)+'</span></span></span></td><td>'+(x.terrs.length?x.terrs.map(esc).join('<br>'):'-')+'</td><td>'+(left?'<span class="muted">-</span>':x.roles.map(function(r){return '<span class="rtag">'+esc(r)+'</span>'}).join(' '))+'</td><td class="r num">'+(x.baseRoles.indexOf('Partner Manager')>-1?n:'<span class="muted">-</span>')+'</td><td class="nowrap">'+st+'</td><td class="r nowrap">'+act+'</td></tr>'}).join('');
  var orph=orphans().map(function(x){var n=S.partners.filter(function(p){return p.pmId===x.id}).length;return '<div class="al al-bad">'+ic('alert')+'<span><span class="b">'+esc(x.name)+'\'s account was disabled without a handover.</span> '+n+' partner'+(n===1?' is':'s are')+' covered by '+esc(pmName(APPROVER3))+' until you hand '+(n===1?'it':'them')+' over.</span>'+(admin?btn('Hand over',{cls:'btn-s',act:'offboard',id:x.id}):'')+'</div>'}).join('');
  var demo=admin?'<div class="pn-f"><span class="small muted">Demo: simulate an account disabled in Microsoft Entra ID before any handover</span><span class="sp"></span><label class="sr" for="sim-who">Staff member</label><select id="sim-who" class="sel">'+STAFF_LIST.filter(function(x){return x.status!=='Left'&&x.roles.indexOf('Partner Manager')>-1&&x.id!==APPROVER3}).map(function(x){return '<option value="'+x.id+'">'+esc(x.name)+'</option>'}).join('')+'</select>'+btn('Disable account',{cls:'btn-s',act:'simExit'})+'</div>':'';
  return ph([['Team']],'Team','Northwind Security staff with access to the partner portal. Everyone signs in with Microsoft Entra ID.')+orph+
  panel('','<div class="tw"><table class="tb"><thead><tr><th>Name</th><th>Territory</th><th>Roles</th><th class="r">Partners owned</th><th>Status</th><th><span class="sr">Action</span></th></tr></thead><tbody>'+rows+'</tbody></table></div>',{flush:true,foot:demo})+
  '<dl class="dl rkey"><dt>Partner Manager</dt><dd>Owns partners in the countries they cover and approves step 1. Some people cover more than one country.</dd><dt>Approver</dt><dd>Approves step 2 or the final step for every territory.</dd><dt>Marketing</dt><dd>Publishes resources and company announcements.</dd><dt>Finance</dt><dd>Pays approved commission payouts and records each payment. Cannot approve anything.</dd><dt>Portal admin</dt><dd>Manages staff accounts and roles. Cannot see deals or payouts.</dd></dl>'}
/* what a leaver is responsible for, and who can take it over */
function leaverLoad(id){return {partners:S.partners.filter(function(p){return p.pmId===id}),apps:S.applications.filter(function(a){return a.status==='New'&&a.pmId===id}),invites:(S.invites||[]).filter(function(i){return i.status==='Sent'&&i.pmId===id}),
  waiting:apItems().filter(function(it){return chainFor(it.pm)[it.o.appr.step]===id||it.pm===id&&it.o.appr.step===0})}}
function heirsFor(x,country){var same=pmsFor(country).filter(function(y){return y.id!==x.id});return same.length?same:x.id===APPROVER3?[]:[staffById(APPROVER3)]}
function leaverCountries(L){var c=[];L.partners.concat(L.apps).concat(L.invites).forEach(function(o){if(c.indexOf(o.country)<0)c.push(o.country)});return c}
function approverHeirs(x){return STAFF_LIST.filter(function(y){return y.id!==x.id&&y.status!=='Left'&&y.baseRoles.indexOf('Partner Manager')>-1})}
function aContent(){
  var t=curTab('acontent','Resources');var err=ui.formErr?'<div class="al al-bad" role="alert">'+ic('alert')+'<span>'+esc(ui.formErr)+'</span></div>':'';var body;
  if(t==='Resources'){
    var list=S.resources.slice().sort(function(a,b){return a.date<b.date?1:-1});
    body='<div class="g2"><div class="col">'+panel('Published resources','<div class="tw"><table class="tb"><thead><tr><th>Name</th><th>Category</th><th>Visible to</th><th>Updated</th><th class="r">Downloads</th></tr></thead><tbody>'+list.map(function(r){return '<tr><td><div class="row" style="flex-wrap:nowrap;gap:10px"><span class="ftag f-'+r.type+'">'+r.type+'</span><span class="ink">'+esc(r.title)+'</span></div></td><td>'+esc(r.cat)+'</td><td class="nowrap">'+esc(r.minTier)+' and above</td><td class="nowrap">'+fmtD(r.date)+'</td><td class="r num">'+r.downloads+'</td></tr>'}).join('')+'</tbody></table></div>',{flush:true,meta:list.length+' files'})+'</div><div class="col">'+
    (canPublish()?'<form class="pn" data-form="publish" novalidate><div class="pn-h"><h2>Publish a resource</h2></div><div class="pn-b stack">'+
    '<div class="fld"><label for="pb-title" class="req">Title</label><input id="pb-title" name="title"></div>'+
    '<div class="fld"><label for="pb-cat">Category</label><select id="pb-cat" name="cat"><option>Sales decks</option><option>Datasheets</option><option>Price lists</option><option>Case studies</option><option>Proposal templates</option><option>Battlecards</option><option>Marketing kit</option><option>Brand assets</option></select></div>'+
    '<div class="fgrid"><div class="fld"><label for="pb-type">File type</label><select id="pb-type" name="type"><option>PDF</option><option>PPTX</option><option>DOCX</option><option>XLSX</option><option>ZIP</option></select></div><div class="fld"><label for="pb-tier">Visible to</label><select id="pb-tier" name="minTier">'+TIERS.map(function(x){return '<option value="'+x+'">'+x+' and above</option>'}).join('')+'</select></div></div>'+
    '<div class="fld"><label for="pb-file">File</label><input id="pb-file" name="file" type="file"><span class="hint">Scanned for malware before it is published.</span></div>'+
    '<label class="chk" for="pb-announce"><input id="pb-announce" name="announce" type="checkbox" checked>Post an announcement to partners</label>'+err+'</div><div class="pn-f" style="justify-content:flex-end">'+btn('Publish',{cls:'btn-p',type:'submit'})+'</div></form>':reqForm(err))+'</div></div>';
  }else{
    body='<div class="g2"><div class="col">'+panel('Announcements','<div class="list">'+S.news.filter(function(n){return canPublish()||!n.from||n.from===me().id}).map(function(n){return '<div class="li"><div><div class="small muted">'+fmtD(n.at)+' · '+(n.from?'Message from '+esc(pmName(n.from))+' to '+esc(n.pids.map(function(x){return partnerById(x).name}).join(', ')):esc(n.cat))+'</div><button type="button" class="link b" data-act="nav" data-v="news-item" data-id="'+n.id+'">'+esc(n.title)+'</button></div></div>'}).join('')+'</div>',{flush:true,meta:S.news.length+' posted'})+'</div><div class="col">'+
    (canPublish()?'<form class="pn" data-form="news" novalidate><div class="pn-h"><h2>Post an announcement</h2></div><div class="pn-b stack">'+
    '<div class="fld"><label for="nw-title" class="req">Headline</label><input id="nw-title" name="title"></div>'+
    '<div class="fld"><label for="nw-cat">Category</label><select id="nw-cat" name="cat"><option>Product</option><option>Pricing</option><option>Partner program</option><option>Events</option><option>Security advisory</option><option>Company</option></select></div>'+
    '<div class="fld"><label for="nw-sum" class="req">Summary</label><input id="nw-sum" name="summary"><span class="hint">One sentence shown in lists and emails.</span></div>'+
    '<div class="fld"><label for="nw-body" class="req">Full text</label><textarea id="nw-body" name="body" style="min-height:140px"></textarea><span class="hint">Leave a blank line between paragraphs.</span></div>'+
    '<label class="chk" for="nw-email"><input id="nw-email" name="email" type="checkbox" checked>Also email all partner users</label>'+err+'</div><div class="pn-f" style="justify-content:flex-end">'+btn('Post announcement',{cls:'btn-p',type:'submit'})+'</div></form>':msgForm(err))+'</div></div>';
  }
  if(t==='Requests')body=reqTable();
  if(t==='Price lists'){var codes=['MYR','SGD','LKR','USD'],cn={MYR:'Malaysia',SGD:'Singapore',LKR:'Sri Lanka',USD:'United States'};
    var pl='<div class="tw"><table class="tb"><thead><tr><th>Service</th>'+codes.map(function(c){return '<th>'+cn[c]+' ('+c+')</th>'}).join('')+'</tr></thead><tbody>'+S.products.map(function(x){return '<tr><td class="ink b">'+esc(x.name)+'</td>'+codes.map(function(c){return '<td>'+esc(regionalize(x.price,c))+'<span class="sub">Typical deal: '+esc(regionalize(x.deal,c))+'</span></td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
    var tt='<div class="tw"><table class="tb"><thead><tr><th>Won sales, last 12 months</th>'+codes.map(function(c){return '<th>'+cn[c]+' ('+c+')</th>'}).join('')+'</tr></thead><tbody>'+['Silver','Gold','Platinum'].map(function(tier,i){return '<tr><td class="ink b">'+tier+'</td>'+codes.map(function(c){return '<td class="num">'+monC(TARGETS[c][i+1],{code:c})+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
    body=panel('Partner price lists by territory',pl,{flush:true,meta:'Set separately for each territory'})+panel('Tier targets by territory',tt,{flush:true,meta:'Partners are measured in their own currency'})+
      '<p class="small muted">Prices and targets are sample figures. RM equivalents shown to staff use sample exchange rates: 1 SGD = RM 3.45, 1 USD = RM 4.70, 100 LKR = RM 1.55.</p>'}
  var openReq=(S.contentReqs||[]).filter(function(r){return r.status==='Open'&&(canPublish()||r.by===me().id)}).length;
  return ph([['Overview','a-home'],['Content']],'Content',canPublish()?'Sales material, announcements and price lists for partners.':'Published by Marketing. Ask Marketing for new material, or send a message to your own partners.')+tabs('acontent',['Resources','Announcements','Requests','Price lists'],{Requests:openReq||null})+body;
}
function aAudit(){
  var cur=curTab('aaudit','All events'),q=(ui.q.audit||'').toLowerCase();
  var list=S.audit.filter(function(a){return (cur==='All events'||a.level==='warn')&&(!q||(a.actor+' '+a.text).toLowerCase().indexOf(q)>-1)});
  var pg=paged('audit',list);
  return ph([['Overview','a-home'],['Audit log']],'Audit log','Every sign-in, download, registration change and administrative action. Retained for 12 months and streamed to the Northwind Security SIEM.',btn('Export',{icon:'down',act:'export'}))+
  '<div class="pn">'+tabs('aaudit',['All events','Security events'],{'All events':S.audit.length,'Security events':S.audit.filter(function(a){return a.level==='warn'}).length})+'<div class="tbar">'+searchBox('audit','Search user or event')+'</div>'+
  (pg.rows.length?'<div class="tw"><table class="tb"><thead><tr><th>Time</th><th>User</th><th>Event</th><th>Type</th></tr></thead><tbody>'+pg.rows.map(function(a){return '<tr><td class="nowrap">'+fmtTime(a.at)+'</td><td>'+esc(a.actor)+'</td><td'+(a.level==='warn'?' style="color:var(--danger)"':'')+'>'+esc(a.text)+'</td><td>'+badge(a.level==='warn'?'Security':'Activity')+'</td></tr>'}).join('')+'</tbody></table></div>':empty('No matching events',''))+pager('audit',pg)+'</div>';
}

/* ---------- modals ---------- */
function md(title,body,foot,wide){return '<div class="ov" data-act="ovClose"><div class="md'+(wide?' w':'')+'" role="dialog" aria-modal="true" aria-labelledby="md-title"><div class="md-h"><h2 id="md-title">'+title+'</h2><button type="button" class="ib" aria-label="Close" id="md-close" data-act="closeModal">'+ic('x')+'</button></div><div class="md-b">'+body+'</div>'+(foot?'<div class="md-f">'+foot+'</div>':'')+'</div></div>'}
function mdForm(name,title,body,submitLabel,wide){var err=ui.formErr?'<div class="al al-bad" role="alert">'+ic('alert')+'<span>'+esc(ui.formErr)+'</span></div>':'';
  return '<div class="ov" data-act="ovClose"><form class="md'+(wide?' w':'')+'" role="dialog" aria-modal="true" aria-labelledby="md-title" data-form="'+name+'" novalidate><div class="md-h"><h2 id="md-title">'+title+'</h2><button type="button" class="ib" aria-label="Close" id="md-close" data-act="closeModal">'+ic('x')+'</button></div><div class="md-b">'+body+err+'</div><div class="md-f">'+btn('Cancel',{act:'closeModal'})+btn(submitLabel,{cls:'btn-p',type:'submit'})+'</div></form></div>'}
function modalHTML(){
  var m=ui.modal;if(!m)return '';
  if(m.type==='confirm')return md(esc(m.title),'<p>'+esc(m.text)+'</p>',btn('Cancel',{act:'closeModal'})+btn(m.ok,{cls:m.danger?'btn-d':'btn-p',act:'confirmOk'}));
  if(m.type==='guide')return md('Demo guide','<p class="muted">A short walkthrough of the main flow.</p><ol class="bullets"><li>Sign in as <span class="b">Aina (Partner Admin)</span> with any password and any 6-digit code. Register a deal with a letter of intent.</li><li>Use <span class="b">Switch to Northwind Security staff view</span>. You are signed in as <span class="b">Marcus Yap</span>, Contoh Tech\'s Partner Manager (Malaysia). Approve step 1 of 3 on the new deal.</li><li>Use <span class="b">Viewing as</span> in this strip to switch to <span class="b">Irfan Halim</span> (step 2), then <span class="b">Hannah Lau</span> (final approval).</li><li>Switch to <span class="b">Clara Seah</span>: she only sees Singapore partners and deals. Try <span class="b">Partners → Invite a partner</span>.</li><li>Switch back to the partner view: the bell shows the approval. Open the deal and choose <span class="b">Mark as won</span>.</li><li>Also try a commission payout, a tier change, the Applications tab and the Audit log.</li></ol><div class="al al-info">'+ic('info')+'<span>Reset data in the demo strip returns everything to the original sample data.</span></div>',btn('Close',{cls:'btn-p',act:'closeModal'}));
  if(m.type==='legal')return md('Not available in the demo','<p>Privacy notice, terms of use and the partner agreement will be published here in the live portal.</p>',btn('Close',{act:'closeModal'}));
  if(m.type==='reject'){var d=dealById(m.id);return mdForm('reject','Reject registration','<p>'+esc(d.customer)+' · '+d.id+'</p><div class="fld"><label for="rj-reason" class="req">Reason shown to the partner</label><textarea id="rj-reason" name="reason">'+(rival(d)?'Another partner registered this customer first and is actively working on it, so it keeps protection.':'')+'</textarea></div>','Reject registration')}
  if(m.type==='custMail'){var cd=dealById(m.id),cp=partnerById(cd.partnerId),live=isStaff()&&cd.status==='Pending'&&cd.custConfirm==='Waiting';
    var mb=live?btn('Yes, I confirm',{cls:'btn-p',act:'custReply',id:cd.id,r:'Confirmed'})+btn('No, this is not correct',{act:'custReply',id:cd.id,r:'Declined'}):'<button type="button" class="btn btn-p" disabled>Yes, I confirm</button><button type="button" class="btn" disabled>No, this is not correct</button>';
    var st=cd.custConfirm==='Waiting'?(live?'<div class="al al-info">'+ic('info')+'<span>Demo: click a button in the email to simulate the customer\'s reply.</span></div>':'<p class="small muted">Sent '+fmtD(cd.custSentAt)+'. No reply yet.</p>'):'<p class="small muted">The customer replied on '+fmtD(cd.custConfirmAt)+': <span class="b ink">'+(cd.custConfirm==='Confirmed'?'confirmed':'not correct')+'</span>.</p>';
    return md('Email sent to the customer','<div class="stack">'+st+'<div class="mail"><dl class="mail-h"><dt>From</dt><dd>Northwind Security Partner Program &lt;partners@example.com&gt;</dd><dt>To</dt><dd>'+esc(cd.contact)+' &lt;'+esc(cd.contactEmail)+'&gt;</dd><dt>Subject</dt><dd class="b">Please confirm: Northwind Security services with '+esc(cp.name)+'</dd></dl>'+
      '<div class="mail-b"><img src="'+LOGO+'" alt="Northwind Security"><p>Dear '+esc(cd.contact)+',</p><p><span class="b ink">'+esc(cp.name)+'</span> has told us they are working with <span class="b ink">'+esc(cd.customer)+'</span> on the following Northwind Security services: '+esc(cd.services.join(', '))+'.</p><p>To protect your company from misuse of its name, please confirm that you are discussing these services with them.</p><div class="row">'+mb+'</div><p class="small muted">This link expires in 14 days. If you did not expect this email, choose "No" or contact partners@example.com. Northwind Security does not share your details with other partners.</p></div></div></div>',btn('Close',{act:'closeModal'}),true)}
  if(m.type==='reqInfo'){var rd=dealById(m.id),miss=checks(rd).filter(function(c){return c.state!=='ok'&&!c.opt}).map(function(c){return c.label.toLowerCase()});
    return mdForm('reqInfo','Request information','<p class="muted" style="margin-bottom:12px">'+esc(rd.customer)+' · '+rd.id+' · '+esc(partnerById(rd.partnerId).name)+'</p><div class="fld"><label for="ri-text" class="req">Message to the partner</label><textarea id="ri-text" name="text">'+esc('Before we can approve this registration, please '+(miss.length?'provide: '+miss.join(', ')+'. ':'')+'Upload proof of budget from the customer, such as a letter of intent or purchase order, and any evidence that you are working with them.')+'</textarea></div>','Send request')}
  if(m.type==='addInfo'){var ad=dealById(m.id);
    var og=function(l,a){return '<optgroup label="'+l+'">'+a.map(function(o){return '<option>'+o+'</option>'}).join('')+'</optgroup>'};
    return mdForm('addInfo',ad.infoRequest?'Add information':'Add document','<p class="muted" style="margin-bottom:12px">'+esc(ad.customer)+' · '+ad.id+'</p>'+(ad.infoRequest?'<div class="al al-warn" style="margin-bottom:12px">'+ic('info')+'<span>'+esc(ad.infoRequest.text)+'</span></div>':'')+
      '<div class="fgrid"><div class="fld"><label for="ai-type">Document type</label><select id="ai-type" name="type">'+og('Proof of budget',DOC_BUDGET)+og('Financial',['Customer audited accounts'])+og('Evidence of engagement',DOC_EVIDENCE)+'</select></div><div class="fld"><label for="ai-file" class="req">File</label><input id="ai-file" name="file" type="file"><span class="hint">Scanned for malware before Northwind Security opens it.</span></div>'+
      '<div class="fld full"><label class="chk" for="ai-consent"><input id="ai-consent" name="consent" type="checkbox"><span>If this is the customer\'s audited accounts, I confirm the customer agreed to share them with Northwind Security.</span></label></div>'+
      '<div class="fld full"><label for="ai-note">Note to Northwind Security</label><textarea id="ai-note" name="note"></textarea></div></div><div class="restricted">'+ic('lock')+'<span>Financial documents can only be opened by your Partner Manager and the Northwind Security approvers. Every view is recorded.</span></div>','Upload',true)}
  if(m.type==='apNote'){var it0=apItem(m.k,m.id);if(!it0)return '';var pre='';if(m.k==='deal'&&m.d==='Rejected'&&rival(it0.o))pre='Another partner registered this customer first and is actively working on it, so it keeps protection.';
    return mdForm('apNote',m.d==='Rejected'?'Reject':'Send back','<p class="muted" style="margin-bottom:12px">'+esc(it0.type)+' · '+esc(it0.title)+' · '+esc(apStepText(it0))+'</p><div class="fld"><label for="an-note"'+(m.d==='Rejected'?' class="req"':'')+'>'+(m.d==='Rejected'?(m.k==='app'||m.k==='tier'?'Reason':'Reason shown to the partner'):'Note to '+esc(pmName(chainFor(it0.pm)[Math.max(0,it0.o.appr.step-1)])))+'</label><textarea id="an-note" name="note">'+esc(pre)+'</textarea></div>'+(m.d==='Rejected'?'<div class="al al-warn" style="margin-top:12px">'+ic('alert')+'<span>Rejecting ends the approval. The earlier approvers are not asked again.</span></div>':''),m.d==='Rejected'?'Reject':'Send back')}
  if(m.type==='apView'){var iv=apItem(m.k,m.id);if(!iv)return md('Already decided','<p class="muted">This item is no longer waiting for approval.</p>',btn('Close',{act:'closeModal'}));
    var det=m.k==='tier'?'<dl class="dl"><dt>Partner</dt><dd>'+esc(iv.p.name)+'</dd><dt>Country</dt><dd>'+esc(iv.p.country)+'</dd><dt>Change</dt><dd>'+esc(iv.o.from)+' to <span class="b ink">'+esc(iv.o.to)+'</span></dd><dt>New margin</dt><dd>'+RATE[iv.o.to]+'% (from '+RATE[iv.o.from]+'%)</dd><dt>Requested by</dt><dd>'+esc(iv.o.by)+', '+fmtD(iv.o.at)+'</dd></dl>':
      '<dl class="dl"><dt>Partner</dt><dd>'+esc(iv.p.name)+'</dd><dt>Customer</dt><dd>'+esc(iv.o.customer)+'</dd><dt>Registration</dt><dd>'+esc(iv.o.dealId)+'</dd><dt>Deal value</dt><dd class="num">'+mon(iv.o.value,iv.o.partnerId)+'</dd><dt>Rate</dt><dd>'+iv.o.rate+'%</dd><dt>Commission</dt><dd class="num b">'+mon(iv.o.amount,iv.o.partnerId)+'</dd><dt>Invoice</dt><dd>'+esc(iv.o.invoice||'-')+'</dd></dl>';
    return md(esc(iv.type)+' · '+esc(iv.p.name),'<div class="stack">'+apWaitingNote(iv)+det+tracker(iv)+'</div>',myTurn(iv)?apButtons(iv,iv.o.appr.step===2?'Final approval':null):btn('Close',{act:'closeModal'}),true)}
  if(m.type==='offboard'){var lx=staffById(m.id),L=leaverLoad(lx.id),apIdx=[APPROVER2,APPROVER3].indexOf(lx.id),left=lx.status==='Left',cs=leaverCountries(L);
    var li=function(label,list,f){return '<div class="li"><div><div class="ink b">'+label+'</div><div class="small muted">'+(list.length?list.map(f).map(esc).join(', '):'None')+'</div></div><span class="num b">'+list.length+'</span></div>'};
    var sel=cs.map(function(c){var hs=heirsFor(lx,c),only=hs.length===1&&hs[0].id===APPROVER3&&!covers(hs[0],c);
      return '<div class="fld"><label for="ob-to-'+esc(c)+'" class="req">New owner in '+esc(c)+'</label><select id="ob-to-'+esc(c)+'" name="to_'+esc(c)+'">'+hs.map(function(y){return '<option value="'+y.id+'">'+esc(y.name)+(only?' (until a replacement joins)':'')+'</option>'}).join('')+'</select><span class="hint">'+(only?'Nobody else covers '+esc(c)+', so '+esc(pmName(APPROVER3))+' covers it for now.':'Only staff who cover '+esc(c)+' can be chosen.')+'</span></div>'}).join('');
    var body='<p class="muted" style="margin-bottom:12px">'+(left?'The account is already disabled. Choose who takes over.':'Everything below moves to the new owners, the partners are told, and the account is disabled.')+'</p>'+
      '<div class="list bordered">'+li('Partners',L.partners,function(p){return p.name+' ('+p.country+')'})+li('Waiting for their approval',L.waiting,function(it){return it.title})+li('Partner applications',L.apps,function(a){return a.company})+li('Open invitations',L.invites,function(i){return i.company})+'</div>'+
      '<div class="fgrid" style="margin-top:14px">'+sel+
      (apIdx>-1?'<div class="fld"><label for="ob-ap" class="req">'+(apIdx===0?'Second approval':'Final approval')+' moves to</label><select id="ob-ap" name="ap">'+approverHeirs(lx).map(function(y){return '<option value="'+y.id+'">'+esc(y.name)+'</option>'}).join('')+'</select><span class="hint">'+esc(lx.name)+' is an approver for every territory.</span></div>':'')+'</div>';
    return mdForm('offboard',(left?'Hand over ':'Offboard ')+esc(lx.name),body,left?'Hand over':'Hand over and disable account',true)}
  if(m.type==='recordPay'){var rc=S.commissions.filter(function(x){return x.id===m.id})[0],rp=partnerById(rc.partnerId);
    return mdForm('recordPay','Record payment','<dl class="dl" style="grid-template-columns:140px minmax(0,1fr)"><dt>Partner</dt><dd>'+esc(rp.name)+' · '+esc(rp.country)+'</dd><dt>Customer</dt><dd>'+esc(rc.customer)+' · '+rc.dealId+'</dd><dt>Invoice</dt><dd>'+esc(rc.invoice||'-')+'</dd><dt>Amount</dt><dd class="num b">'+mon(rc.amount,rc.partnerId)+myrNote(rc.amount,rc.partnerId)+'</dd><dt>Approved</dt><dd>'+fmtD(rc.approvedAt)+', all three approvals</dd></dl>'+
      '<p class="muted" style="margin:12px 0">Make the bank transfer first, then record it here. The partner is told the date and reference.</p><div class="fgrid"><div class="fld"><label for="pay-date" class="req">Payment date</label><input id="pay-date" name="date" type="date" max="'+today()+'" value="'+today()+'"></div><div class="fld"><label for="pay-ref" class="req">Bank reference</label><input id="pay-ref" name="ref" placeholder="e.g. MBB-TRF-20261014-0042"></div></div>','Mark as paid',true)}
  if(m.type==='invitePartner'){var me0=me();
    return mdForm('invitePartner','Invite a partner','<p class="muted" style="margin-bottom:12px">Invite a company you have already spoken to. Their application form will show you as their Partner Manager.</p><div class="fgrid"><div class="fld full"><label for="ip-co" class="req">Company name</label><input id="ip-co" name="company"></div><div class="fld"><label for="ip-name" class="req">Contact name</label><input id="ip-name" name="contact"></div><div class="fld"><label for="ip-email" class="req">Contact work email</label><input id="ip-email" name="email" type="email"></div>'+(me0.terrs.length>1?'<div class="fld"><label for="ip-country">Country</label><select id="ip-country" name="country">'+me0.terrs.map(function(t){return '<option>'+esc(t)+'</option>'}).join('')+'</select></div>':'<div class="fld"><label>Country</label><input value="'+esc(me0.terrs[0])+'" disabled></div>')+'<div class="fld"><label>Partner Manager</label><input value="'+esc(me0.name)+'" disabled></div></div>','Send invitation',true)}
  if(m.type==='progress'){var pd=dealById(m.id);
    return mdForm('progress','Update progress','<p class="muted" style="margin-bottom:12px">'+esc(pd.customer)+' · '+pd.id+' · last update '+daysAgo(idle(pd)).toLowerCase()+'</p><div class="fgrid"><div class="fld"><label for="pg-stage">Sales stage</label><select id="pg-stage" name="stage">'+STAGES.map(function(s){return '<option'+(s===pd.stage?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div><div class="fld"><label for="pg-close">Expected close date</label><input id="pg-close" name="closeDate" type="date" min="'+today()+'" value="'+(pd.closeDate&&daysUntil(pd.closeDate)>=0?pd.closeDate:'')+'"></div>'+
    '<div class="fld full"><label for="pg-note" class="req">What happened since the last update?</label><textarea id="pg-note" name="note" placeholder="e.g. Demo done with the IT manager. Customer is reviewing the quote with finance."></textarea></div>'+
    '<div class="fld"><label for="pg-next" class="req">Next step</label><input id="pg-next" name="next" placeholder="e.g. Follow-up call with the CFO"></div><div class="fld"><label for="pg-nextd" class="req">Next step date</label><input id="pg-nextd" name="nextDate" type="date" min="'+today()+'"></div></div>'+
    '<div class="al al-info">'+ic('info')+'<span>Update each deal at least every 30 days. After 50 days without an update, protection is suspended and another partner may be given the customer.</span></div>','Save update',true)}
  if(m.type==='invite')return mdForm('invite','Invite user','<div class="fgrid"><div class="fld full"><label for="iv-name" class="req">Full name</label><input id="iv-name" name="name"></div><div class="fld full"><label for="iv-email" class="req">Work email</label><input id="iv-email" name="email" type="email" placeholder="name@'+myDomain()+'"><span class="hint">Only @'+myDomain()+' addresses can be invited.</span></div><div class="fld full"><label for="iv-role">Role</label><select id="iv-role" name="role">'+ROLES.map(function(r){return '<option>'+r+'</option>'}).join('')+'</select></div></div><div class="al al-info">'+ic('lock')+'<span>New users must set up two-step verification before they can access any data.</span></div>','Send invitation');
  if(m.type==='invoice'){var c=S.commissions.filter(function(x){return x.id===m.id})[0];return mdForm('invoice','Upload invoice','<dl class="dl" style="grid-template-columns:120px minmax(0,1fr)"><dt>Registration</dt><dd>'+c.dealId+'</dd><dt>Customer</dt><dd>'+esc(c.customer)+'</dd><dt>Amount</dt><dd class="num b">'+mon(c.amount,c.partnerId)+'</dd></dl><div class="fld"><label for="inv-no" class="req">Invoice number</label><input id="inv-no" name="no"></div><div class="fld"><label for="inv-file">Invoice (PDF)</label><input id="inv-file" name="file" type="file" accept=".pdf"><span class="hint">Quote registration '+c.dealId+' on the invoice.</span></div>','Submit invoice')}
  if(m.type==='newcase'){var cust=myDeals().filter(function(d){return d.status==='Won'}).map(function(d){return '<option>'+esc(d.customer)+'</option>'}).join('');
    return mdForm('newcase','New support case','<div class="fgrid"><div class="fld"><label for="nc-type">Type</label><select id="nc-type" name="type">'+['Pre-sales question','Technical','Billing and commission','Portal access'].map(function(o){return '<option'+(o===m.t?' selected':'')+'>'+o+'</option>'}).join('')+'</select></div><div class="fld"><label for="nc-cust">Related customer</label><select id="nc-cust" name="customer"><option value="">None</option>'+cust+'</select></div><div class="fld full"><label for="nc-subject" class="req">Subject</label><input id="nc-subject" name="subject"></div><div class="fld full"><label for="nc-body" class="req">Description</label><textarea id="nc-body" name="body"></textarea></div><div class="fld full"><label for="nc-file">Attachment</label><input id="nc-file" name="file" type="file"><span class="hint">Scanned for malware before Northwind Security staff can open it.</span></div></div>','Submit case',true)}
  if(m.type==='report'){var dl=dealById(m.id),n=dl.value%97;
    return md('Service summary · '+esc(dl.customer),'<p class="small muted">Sample report. The live portal shows the monthly summary from the Northwind Security SOC platform.</p><div class="mx m3"><div><span class="l">Endpoints monitored</span><span class="v">'+(120+n)+'</span></div><div><span class="l">Alerts triaged, 30 days</span><span class="v">'+(300+n*7)+'</span></div><div><span class="l">Incidents escalated</span><span class="v">'+(dl.customer==='Pelangi Education'?1:0)+'</span></div></div><dl class="dl"><dt>Services</dt><dd>'+esc(dl.services.join(', '))+'</dd><dt>Active since</dt><dd>'+fmtD(dl.closedAt)+'</dd><dt>Report period</dt><dd>Last 30 days</dd></dl>',btn('Close',{act:'closeModal'}),true)}
  if(m.type==='cert'){var c2=S.courses.filter(function(x){return x.id===m.id})[0],u=me();
    return md('Certificate','<div class="cert"><img src="'+LOGO+'" alt="Northwind Security"><span class="eyebrow" style="margin-top:8px">Northwind Security Partner Program</span><h2 style="font-size:18px">'+esc(c2.title)+'</h2><p>Awarded to <span class="b ink">'+esc(u.name)+'</span>, '+esc(myPartner().name)+'</p><p class="small muted">Issued '+fmtD(c2.completedAt)+' · Valid until '+fmtD(addDays(c2.completedAt,365))+'</p><p class="small muted">Certificate ID DS-'+c2.id+'-'+c2.completedAt.replace(/-/g,'')+'</p></div>',btn('Close',{act:'closeModal'}),true)}
  if(m.type==='app'){var a=S.applications.filter(function(x){return x.id===m.id})[0];
    return md('Review application · '+esc(a.company),'<dl class="dl"><dt>Reference</dt><dd>'+esc(a.id)+'</dd><dt>Registration no.</dt><dd>'+esc(a.reg)+'</dd><dt>Country</dt><dd>'+esc(a.country)+'</dd><dt>Website</dt><dd>'+esc(a.website||'-')+'</dd><dt>Partnership type</dt><dd>'+esc(a.type)+'</dd><dt>Primary contact</dt><dd>'+esc(a.contact)+(a.title?', '+esc(a.title):'')+'<br><span class="muted">'+esc(a.email)+(a.phone?' · '+esc(a.phone):'')+'</span></dd><dt>Documents</dt><dd>'+esc(a.docs||'None uploaded')+'</dd><dt>Submitted</dt><dd>'+fmtD(a.submitted)+'</dd><dt>Partner Manager</dt><dd>'+esc(pmName(a.pmId))+(a.invite?' · invited by them':' · chosen by the applicant')+'</dd><dt>Status</dt><dd>'+badge(a.status)+'</dd></dl>'+(function(){var ai=a.status==='New'?apItem('app',a.id):null;return ai?'<div class="stack" style="margin-top:14px">'+apWaitingNote(ai)+tracker(ai)+'</div>':''})()+'<div class="al al-info" style="margin-top:12px">'+ic('info')+'<span>Final approval creates the partner at Registered tier, managed by '+esc(pmName(a.pmId))+', and sends a portal invitation to '+esc(a.email)+'.</span></div>',(function(){var ai=a.status==='New'?apItem('app',a.id):null;return ai&&myTurn(ai)?apButtons(ai,ai.o.appr.step===2?'Final approval':null):btn('Close',{act:'closeModal'})})(),true)}
  return '';
}

/* ---------- toasts ---------- */
var tid=0;
function toast(msg){var root=document.getElementById('toasts');if(!root)return;var id='t'+(++tid);var el=document.createElement('div');el.className='toast';el.id=id;el.setAttribute('role','status');
  el.innerHTML=ic('checkc')+'<span>'+esc(msg)+'</span><button type="button" aria-label="Dismiss" data-act="dismissToast" data-id="'+id+'">'+ic('x')+'</button>';
  root.appendChild(el);while(root.children.length>3)root.removeChild(root.firstChild);setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el)},4500)}

/* ---------- render ---------- */
var $app=document.getElementById('app');
function render(){
  var a=document.activeElement,fid=a&&a.id,pos=null;try{if(fid&&a.selectionStart!=null)pos=a.selectionStart}catch(e){}
  applyStaff();sweep();if(S.session&&(!me()||isStaff()&&me().status==='Left'))S.session=null;
  $app.innerHTML=S.session?shell():envStrip()+authView();
  if(fid){var el=document.getElementById(fid);if(el){el.focus();try{if(pos!=null)el.setSelectionRange(pos,pos)}catch(e){}}}
  save();
}
function go(v,id){if(v!=='deal-new')ui.prefill=null;if(v==='deal-new'&&ui.v!=='deal-new'){ui.step=1;ui.draft=ui.prefill?{services:[ui.prefill]}:{}}
  if(v!==ui.v){ui.tab.product=undefined}
  ui.v=v;ui.id=id||null;ui.navOpen=false;ui.dd=null;ui.formErr='';ui.gq='';ui.modal=null;render();window.scrollTo(0,0)}
function openModal(m){ui.modal=m;ui.formErr='';ui.dd=null;render();var f=document.querySelector('.md input:not([type=hidden]):not([type=checkbox]),.md textarea,.md select');if(f)f.focus();else{var c=document.getElementById('md-close');if(c)c.focus()}}
function closeModal(){ui.modal=null;ui.formErr='';render()}
function signIn(userId,via){
  S.session={userId:userId,at:nowISO()};var u=me();
  if(u&&u.status==='Invited'){u.status='Active';u.mfa='Authenticator app'}
  if(u&&!isStaff())u.last=nowISO();
  log('Signed in'+(via?' with '+via:''));
  ui.auth='login';ui.authErr='';ui.pending=null;ui.mfaFails=0;ui.modal=null;ui.v=isStaff()?staffHome():'home';ui.id=null;ui.tab={};ui.apSort=null;ui.formErr='';
  render();window.scrollTo(0,0);toast('Signed in as '+u.name+'.');
}

var CONFIRM={
  won:function(id){var d=dealById(id),p=partnerById(d.partnerId),rate=RATE[p.tier];d.status='Won';d.closedAt=today();d.history.push({at:today(),by:me().name,text:'Closed as won'});
    var amt=Math.round(d.value*rate/100);S.commissions.unshift({id:'CM-'+(S.seq.comm++),dealId:d.id,partnerId:d.partnerId,customer:d.customer,service:d.services.join(', '),value:d.value,rate:rate,amount:amt,status:'Awaiting invoice',paidAt:null,invoice:null,closedAt:today()});
    log('Marked registration '+d.id+' as won ('+mon(d.value,d.partnerId)+')');notify('staff',p.name+' closed '+d.customer+' as won ('+mon(d.value,d.partnerId)+').','a-payouts');toast('Marked as won. Commission of '+mon(amt,d.partnerId)+' added.')},
  approve:function(id){var d=dealById(id),p=partnerById(d.partnerId);d.status='Approved';d.approvedAt=today();d.protectedUntil=addDays(today(),90);d.history.push({at:today(),by:me().name,text:'Approved'+(verifyState(d)==='Verified'?'':' with open verification checks')+'. Protected for 90 days'});
    log('Approved registration '+d.id+' for '+p.name+(verifyState(d)==='Verified'?'':' (not fully verified)'),verifyState(d)==='Verified'?'info':'warn');notifyP(d.partnerId,'Registration approved: '+d.customer+'. Protected until '+fmtD(d.protectedUntil)+'.','deals',d.id);toast(d.customer+' approved. The partner has been notified.')},
  award:function(id){var d=dealById(id),r=rival(d),p=partnerById(d.partnerId);
    d.status='Approved';d.approvedAt=today();d.lastActivity=today();d.protectedUntil=addDays(today(),90);d.history.push({at:today(),by:me().name,text:'Approved after conflict review. Protected for 90 days'});
    if(r){var rp=partnerById(r.partnerId),why=activity(r)==='Inactive'?'no progress update for '+idle(r)+' days':'Northwind Security conflict review';
      if(r.status==='Approved'){r.status='Lost';r.closedAt=today();r.lostReason='Northwind Security gave this customer to another partner after '+why+'.';r.history.push({at:today(),by:me().name,text:'Closed: customer reassigned to another partner after '+why})}
      else{r.status='Rejected';r.rejectReason='Northwind Security gave this customer to another partner after conflict review.';r.history.push({at:today(),by:me().name,text:'Rejected: customer given to another partner'})}
      notifyP(r.partnerId,d.customer+' was reassigned to another partner: '+why+'.','deal',r.id);
      log('Resolved conflict on '+d.customer+': awarded to '+p.name+' ('+d.id+'), closed '+r.id+' for '+rp.name)}
    notifyP(d.partnerId,'Registration approved: '+d.customer+'. Protected until '+fmtD(d.protectedUntil)+'.','deals',d.id);
    toast(d.customer+' awarded to '+p.name+'. Both partners have been notified.')},
  lost:function(id){var d=dealById(id);d.status='Lost';d.closedAt=today();d.history.push({at:today(),by:me().name,text:'Closed as lost'});log('Marked registration '+d.id+' as lost');toast('Marked as lost. Protection has ended.')},
  removeUser:function(id){var u=S.users.filter(function(x){return x.id===id})[0];S.users=S.users.filter(function(x){return x.id!==id});log('Removed user '+u.email+' and ended their sessions');toast(u.name+' was removed and signed out of all devices.')},
  reset:function(){S=seed();try{localStorage.removeItem(KEY)}catch(e){}ui.v=null;ui.id=null;ui.auth='login';ui.tab={};ui.q={};ui.f={};ui.pg={};toast('Demo data has been reset.')},
  revokeAll:function(){S.sessions=S.sessions.filter(function(s){return s.current});log('Signed out all other sessions');toast('All other sessions were signed out.')},
  apApprove:function(key){var p=key.split('|');decide(p[0],p[1],'Approved')},
  awardStart:function(id){var d=dealById(id),r=rival(d);d.awardIntent=r?r.id:true;decide('deal',id,'Approved')},
  rejectApp:function(id){var a=S.applications.filter(function(x){return x.id===id})[0];a.status='Rejected';log('Rejected partner application '+a.id+' ('+a.company+')');toast('Application rejected.')}
};
var A={
  nav:function(el){go(el.dataset.v,el.dataset.id)},
  tab:function(el){ui.tab[el.dataset.k]=el.dataset.t;ui.pg[el.dataset.k]=1;render()},
  facet:function(el){ui.f[el.dataset.k]=el.dataset.t;render()},
  page:function(el){var k=el.dataset.k;ui.pg[k]=(ui.pg[k]||1)+Number(el.dataset.d);render()},
  sort:function(el){var k=el.dataset.k;if(ui.sort.key===k)ui.sort.dir*=-1;else{ui.sort.key=k;ui.sort.dir=k==='customer'?1:-1}render()},
  toggleNav:function(){ui.navOpen=!ui.navOpen;render()},
  dd:function(el){var k=el.dataset.k;ui.dd=ui.dd===k?null:k;render()},
  readAll:function(){myNtf().forEach(function(n){n.read=true});render()},
  openNotif:function(el){var n=S.notifications.filter(function(x){return x.id===el.dataset.id})[0];n.read=true;ui.dd=null;
    if(n.ref&&dealById(n.ref))go('deal',n.ref);else if(n.ref&&caseById(n.ref))go('case',n.ref);else if(n.view&&allowed(n.view))go(n.view);else render()},
  guide:function(){openModal({type:'guide'})},
  legal:function(){openModal({type:'legal'})},
  forgot:function(){toast('Password reset emails are disabled in the demo environment.')},
  fillDemo:function(el){ui.loginEmail=el.dataset.email;ui.authErr='';render();var p=document.getElementById('login-pass');if(p)p.focus()},
  sso:function(){ui.pending=staffById('S-MAR');signIn('S-MAR','Microsoft Entra ID')},
  gotoApply:function(){ui.auth='apply';ui.applyErr='';render();window.scrollTo(0,0)},
  backToLogin:function(){ui.invite=null;ui.auth='login';ui.authErr='';ui.pending=null;render()},
  unlock:function(){ui.mfaFails=0;ui.authErr='';render()},
  passkey:function(){signIn(ui.pending.id,'a passkey')},
  signOut:function(){log('Signed out');S.session=null;ui.auth='login';ui.loginEmail='';ui.modal=null;ui.dd=null;render();toast('You have signed out.')},
  quickSwitch:function(){var toStaff=!isStaff(),u0=me(),pm=toStaff?myPartner().pmId:null,pu=!toStaff?S.users.filter(function(x){var pp=partnerById(x.partnerId);return x.role==='Partner Admin'&&covers(u0,pp.country)})[0]:null;log('Signed out');S.session=null;signIn(toStaff?pm:(pu?pu.id:'U1'),toStaff?'Microsoft Entra ID':null)},
  resetDemo:function(){openModal({type:'confirm',title:'Reset demo data?',text:'All registrations, cases, users and other changes made in this browser return to the original sample data, and you are signed out.',ok:'Reset data',act:'reset',danger:true})},
  confirmOk:function(){var m=ui.modal;ui.modal=null;CONFIRM[m.act](m.id);render()},
  closeModal:closeModal,
  ovClose:function(el,ev){if(ev.target===el)closeModal()},
  dismissToast:function(el){var t=document.getElementById(el.dataset.id);if(t)t.parentNode.removeChild(t)},
  export:function(){toast('Exports are disabled in the demo environment.')},
  newCase:function(el){if(isStaff())return;openModal({type:'newcase',t:el&&el.dataset?el.dataset.t:null})},
  prodDeal:function(el){var pr=prodById(el.dataset.id);ui.prefill=pr.svc;ui.step=1;ui.draft={services:[pr.svc]};ui.v='deal-new';go('deal-new');ui.prefill=pr.svc},
  stepBack:function(){var f=document.querySelector('form[data-form=deal]');if(f)captureDraft(new FormData(f));ui.step=Math.max(1,ui.step-1);ui.formErr='';render();window.scrollTo(0,0)},
  campaign:function(el){ui.f.cmp=el.dataset.id||'';render()},
  newsAllRead:function(){newsFor().forEach(function(n){if(S.newsRead.indexOf(n.id)<0)S.newsRead.push(n.id)});render();toast('All announcements marked as read.')},
  download:function(el){var r=resById(el.dataset.id);r.downloads++;var wm=r.cat==='Price lists';log('Downloaded "'+r.title+'"'+(wm?' (watermarked)':''));render();toast((wm?'Watermarked with '+myPartner().name+'. ':'')+'File downloads are simulated in the demo.')},
  course:function(el){var c=S.courses.filter(function(x){return x.id===el.dataset.id})[0];
    if(!c.started){c.started=true;log('Enrolled in '+c.title);render();toast('Enrolled in '+c.title+'.');return}
    c.done=Math.min(c.modules,c.done+1);
    if(c.done===c.modules){c.completedAt=today();log('Completed certification: '+c.title);notify('staff',me().name+' ('+myPartner().name+') completed '+c.title+'.','a-partners');render();toast('Certificate issued: '+c.title+'.')}
    else{render();toast('Module '+c.done+' of '+c.modules+' completed.')}},
  cert:function(el){openModal({type:'cert',id:el.dataset.id})},
  report:function(el){openModal({type:'report',id:el.dataset.id})},
  invoice:function(el){openModal({type:'invoice',id:el.dataset.id})},
  resolveCase:function(el){var t=caseById(el.dataset.id);t.status='Resolved';t.updated=nowISO();log('Resolved case '+t.id);render();toast('Case marked as resolved.')},
  invite:function(){openModal({type:'invite'})},
  resend:function(el){var u=S.users.filter(function(x){return x.id===el.dataset.id})[0];log('Resent invitation to '+u.email);toast('Invitation resent to '+u.email+'.')},
  removeUser:function(el){var u=S.users.filter(function(x){return x.id===el.dataset.id})[0];openModal({type:'confirm',title:'Remove '+u.name+'?',text:u.name+' loses access immediately and is signed out on every device. Their registrations stay with your company.',ok:'Remove user',act:'removeUser',id:u.id,danger:true})},
  revoke:function(el){var s=S.sessions.filter(function(x){return x.id===el.dataset.id})[0];S.sessions=S.sessions.filter(function(x){return x.id!==s.id});log('Signed out session: '+s.device+', '+s.where);render();toast(s.device+' was signed out.')},
  revokeAll:function(){openModal({type:'confirm',title:'Sign out other sessions?',text:'Every device except this browser will be signed out.',ok:'Sign out other sessions',act:'revokeAll'})},
  won:function(el){var d=dealById(el.dataset.id),t=partnerById(d.partnerId).tier;openModal({type:'confirm',title:'Mark '+d.customer+' as won?',text:'Commission is calculated at your '+t+' rate of '+RATE[t]+'% ('+mon(d.value*RATE[t]/100,d.partnerId)+') and the customer is added to your Customers page.',ok:'Mark as won',act:'won',id:d.id})},
  lost:function(el){var d=dealById(el.dataset.id);openModal({type:'confirm',title:'Mark '+d.customer+' as lost?',text:'Protection ends and other partners can register this customer.',ok:'Mark as lost',act:'lost',id:d.id,danger:true})},
  progress:function(el){openModal({type:'progress',id:el.dataset.id})},
  nudge:function(el){var d=dealById(el.dataset.id),p=partnerById(d.partnerId);d.history.push({at:today(),by:me().name,text:'Reminder sent: no progress update for '+idle(d)+' days'});log('Sent progress reminder to '+p.name+' for '+d.id);
    notifyP(d.partnerId,'Northwind Security asked for a progress update on '+d.customer+' ('+idle(d)+' days without an update).','deal',d.id);render();toast('Reminder sent to '+p.name+'.')},
  apApprove:function(el){var k=el.dataset.k,id=el.dataset.id;
    if(k==='deal'){var d=dealById(id),p=partnerById(d.partnerId),v=verifyState(d);if(v!=='Verified'){var open=checks(d).filter(function(c){return c.state!=='ok'&&!c.opt}).map(function(c){return c.label.toLowerCase()});
      openModal({type:'confirm',title:v==='Customer declined'?'The customer did not confirm this deal':'Approve without full verification?',text:d.customer+' has open checks: '+(open.join(', ')||'customer declined')+'. You can still approve; it will be recorded.',ok:'Approve anyway',act:'apApprove',id:k+'|'+id,danger:v==='Customer declined'});return}}
    ui.modal=null;decide(k,id,'Approved');render()},
  apNote:function(el){openModal({type:'apNote',k:el.dataset.k,id:el.dataset.id,d:el.dataset.d})},
  apOpen:function(el){var k=el.dataset.k,id=el.dataset.id;if(k==='deal')go('deal',id);else if(k==='app')openModal({type:'app',id:id});else openModal({type:'apView',k:k,id:id})},
  invitePartner:function(){openModal({type:'invitePartner'})},
  openInvite:function(el){var i=(S.invites||[]).filter(function(x){return x.id===el.dataset.id})[0];log('Opened invitation link for '+i.company+' (demo)');S.session=null;ui.invite=i.id;ui.auth='apply';ui.applyErr='';ui.modal=null;render();window.scrollTo(0,0)},
  award:function(el){var d=dealById(el.dataset.id),r=rival(d),p=partnerById(d.partnerId);openModal({type:'confirm',title:'Propose awarding '+d.customer+' to '+p.name+'?',text:'This approves step 1 of 3. When Irfan Halim and Hannah Lau also approve, '+p.name+' gets 90 days of protection'+(r?' and the registration by '+partnerById(r.partnerId).name+' ('+r.id+') is closed. Both partners are told the reason.':'.'),ok:'Approve and send to Irfan Halim',act:'awardStart',id:d.id})},
  custMail:function(el){openModal({type:'custMail',id:el.dataset.id})},
  custReply:function(el){var d=dealById(el.dataset.id),r=el.dataset.r;d.custConfirm=r;d.custConfirmAt=today();
    d.history.push({at:today(),by:d.contact+' (customer)',text:r==='Confirmed'?'Confirmed the opportunity by email':'Replied that they are not discussing Northwind Security services with this partner'});
    S.audit.unshift({at:nowISO(),actor:d.contactEmail,text:(r==='Confirmed'?'Customer confirmed registration ':'Customer did not confirm registration ')+d.id,level:r==='Confirmed'?'info':'warn'});
    notifyP(d.partnerId,r==='Confirmed'?d.customer+' confirmed your registration.':d.customer+' did not confirm your registration. Northwind Security will contact you.','deal',d.id);
    ui.modal=null;render();toast(r==='Confirmed'?'Customer confirmation recorded.':'The customer did not confirm. Review before approving.')},
  reqInfo:function(el){openModal({type:'reqInfo',id:el.dataset.id})},
  viewDoc:function(el){var d=dealById(el.dataset.id),docs=(d.budgetDocs||[]).map(function(x){return x.name}).concat(d.auditDoc?[d.auditDoc.name]:[]),n=docs[Number(el.dataset.i)];log('Opened financial document "'+n+'" on '+d.id);render();toast('Opened '+n+'. This view is recorded in the audit log.')},
  addInfo:function(el){openModal({type:'addInfo',id:el.dataset.id})},
  scope:function(el){ui.f.scope=el.dataset.s;['adeals'].forEach(function(k){ui.pg[k]=1});render()},
  reqDone:function(el){var r=(S.contentReqs||[]).filter(function(x){return x.id===el.dataset.id})[0];if(!r)return;r.status='Done';notifyStaff(r.by,'Your content request is done: '+r.title,'content',null);log('Completed content request "'+r.title+'"');render();toast('Marked as done. '+pmName(r.by)+' has been told.')},
  offboard:function(el){openModal({type:'offboard',id:el.dataset.id})},
  simExit:function(){var id=document.getElementById('sim-who').value,x=staffById(id);S.staffMeta=S.staffMeta||{};S.staffMeta[id]={status:'Left',leftAt:today()};applyStaff();
    notifyStaff(APPROVER3,x.name+'\'s account was disabled without a handover. You cover their partners until the Portal admin hands them over.','partners',null);log('Account '+x.email+' disabled in Microsoft Entra ID without a handover','warn');render();toast(x.name+'\'s account is disabled.')},
  recordPay:function(el){openModal({type:'recordPay',id:el.dataset.id})},
  fillApply:function(){var v={'ap-company':'Kenanga Cyber Sdn Bhd','ap-reg':'202401056677','ap-web':'kenangacyber.example','ap-name':'Hakim Rosli','ap-title':'Managing Director','ap-email':'hakim@kenangacyber.example','ap-phone':'+60 12 345 6789'};
    Object.keys(v).forEach(function(k){var e=document.getElementById(k);if(e)e.value=v[k]});var c=document.getElementById('ap-country');if(c)c.value='Malaysia';var pm=document.getElementById('ap-pm');if(pm)pm.value='S-MAR';var ok=document.getElementById('ap-consent');if(ok)ok.checked=true;toast('Sample details filled in.')},
  fillDeal:function(){var cd=new Date(T0);cd.setDate(cd.getDate()+60);var lm=new Date(T0);lm.setDate(lm.getDate()-3);var iso=function(x){return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
    var d=ui.draft=ui.draft||{};Object.assign(d,{customer:'Maju Jaya Sdn Bhd',industry:'Manufacturing',country:'Malaysia',regNo:'201801023344',website:'majujaya.example',employees:'51-200',contact:'Ali Hassan',contactTitle:'IT Director',contactEmail:'ali@majujaya.example',contactPhone:'+60 5 254 7788',
      services:['MDR'],value:'60000',closeDate:iso(cd),stage:'Qualified',notes:'They want 24/7 monitoring before the new plant opens in March.',budgetType:'Letter of Intent',budgetName:'Letter of Intent - Maju Jaya Sdn Bhd.pdf',lastMeeting:iso(lm),source:'Partner outreach',need:'Their factory network was hit by ransomware last year. They want 24/7 monitoring before the new plant opens.'});
    ui.formErr='';render();toast('Sample details filled in.')},
  apSort:function(el){var k=el.dataset.k,so=ui.apSort||{key:'since',dir:1};if(so.key===k)so.dir*=-1;else{so={key:k,dir:1}}ui.apSort=so;render()},
  apOrder:function(el){ui.apSort={key:'since',dir:Number(el.dataset.d)};render()},
  tabTo:function(el){ui.tab[el.dataset.k]=el.dataset.t;go(el.dataset.v)},
  askExt:function(el){var d=dealById(el.dataset.id);d.extensionRequested=true;d.lastActivity=today();d.history.push({at:today(),by:me().name,text:'Requested a 30-day extension'});log('Requested extension on '+d.id);notify('staff',myPartner().name+' requested a 30-day extension on '+d.customer+'.','a-deals',d.id);render();toast('Extension requested. Northwind Security will reply within 1 business day.')},
  approve:function(el){var d=dealById(el.dataset.id),p=partnerById(d.partnerId),v=verifyState(d);
    if(v!=='Verified'){var open=checks(d).filter(function(c){return c.state!=='ok'&&!c.opt}).map(function(c){return c.label.toLowerCase()});openModal({type:'confirm',title:v==='Customer declined'?'The customer did not confirm this deal':'Approve without full verification?',text:d.customer+' has open checks: '+open.join(', ')+'. Approving gives '+p.name+' 90 days of protection on this customer.',ok:'Approve anyway',act:'approve',id:d.id,danger:v==='Customer declined'});return}
    CONFIRM.approve(d.id);render()},
  reject:function(el){openModal({type:'reject',id:el.dataset.id})},
  approveExt:function(el){var d=dealById(el.dataset.id);d.extensionRequested=false;d.extensionUsed=true;d.protectedUntil=addDays(d.protectedUntil,30);d.history.push({at:today(),by:me().name,text:'Extension approved. Protected until '+fmtD(d.protectedUntil)});
    log('Approved 30-day extension on '+d.id);notifyP(d.partnerId,'Extension approved for '+d.customer+'. Protected until '+fmtD(d.protectedUntil)+'.','deals',d.id);render();toast('Extension approved.')},
  markPaid:function(el){var c=S.commissions.filter(function(x){return x.id===el.dataset.id})[0];c.status='Paid';c.paidAt=today();log('Released payout of '+mon(c.amount,c.partnerId)+' to '+partnerById(c.partnerId).name);
    notifyP(c.partnerId,'Commission paid: '+mon(c.amount,c.partnerId)+' for '+c.customer+'.','commissions');render();toast('Payout released. The partner has been notified.')},
  reviewApp:function(el){openModal({type:'app',id:el.dataset.id})},
  approveApp:function(el){var a=S.applications.filter(function(x){return x.id===el.dataset.id})[0];a.status='Approved';
    S.partners.push({id:'P'+String(S.seq.partner++).padStart(3,'0'),name:a.company,country:a.country,city:a.country,type:a.type,tier:'Registered',status:'Active',joined:today()});
    log('Approved partner application '+a.id+' ('+a.company+')');ui.modal=null;render();toast(a.company+' approved. An invitation was sent to '+a.email+'.')},
  rejectApp:function(el){var a=S.applications.filter(function(x){return x.id===el.dataset.id})[0];openModal({type:'confirm',title:'Reject '+a.company+'?',text:'The applicant is told the application was not accepted.',ok:'Reject application',act:'rejectApp',id:a.id,danger:true})},
  gpick:function(el){var k=el.dataset.k,id=el.dataset.id;ui.gq='';
    if(k==='deal')go('deal',id);else if(k==='prod')go('product',id);else if(k==='news')go('news-item',id);else if(k==='case')go('case',id);
    else if(k==='res'){ui.q.res=el.dataset.q;ui.f.res='All';go(isStaff()?'a-content':'resources')}}
};
var CH={
  stage:function(el){var d=dealById(el.dataset.id);d.stage=el.value;d.lastActivity=today();d.history.push({at:today(),by:me().name,text:'Stage changed to '+el.value});log('Changed stage of '+d.id+' to '+el.value);render();toast('Stage updated.')},
  userRole:function(el){var u=S.users.filter(function(x){return x.id===el.dataset.id})[0],old=u.role;u.role=el.value;log('Changed role of '+u.email+' from '+old+' to '+u.role);render();toast(u.name+' is now '+u.role+'.')},
  tier:function(el){var p=partnerById(el.dataset.id);if(!ownsPartner(p)||el.value===p.tier){render();return}var u=me();
    p.tierReq={to:el.value,from:p.tier,by:u.name,at:today(),appr:{step:1,since:today(),log:[{step:0,by:u.name,at:today(),decision:'Approved',note:'Requested by the Partner Manager'}]}};
    notifyStaff(APPROVER2,'Waiting for your approval: tier change for '+p.name+' ('+p.tier+' to '+el.value+').','tier',p.id);log('Requested tier change for '+p.name+' from '+p.tier+' to '+el.value);render();toast('Tier change sent to Irfan Halim for approval.')},
  reassign:function(el){var p=partnerById(el.dataset.id),old=pmName(p.pmId);p.pmId=el.value;log('Reassigned '+p.name+' from '+old+' to '+pmName(p.pmId));render();toast(p.name+' is now managed by '+pmName(p.pmId)+'.')},
  asStaff:function(el){var to=el.value;log('Signed out');S.session=null;ui.pending=staffById(to);signIn(to,'Microsoft Entra ID')},
  caseStatus:function(el){var t=caseById(el.dataset.id);t.status=el.value;t.updated=nowISO();log('Set case '+t.id+' to '+t.status);render();toast('Case status updated.')},
  filter:function(el){ui.f[el.dataset.k]=el.value;ui.pg[el.dataset.k.replace('svc','')]=1;render()}
};
var IN={
  q:function(el){ui.q[el.dataset.k]=el.value;ui.pg[el.dataset.k]=1;render()},
  dupCheck:function(el){var m=document.getElementById('dup-msg');if(m)m.innerHTML=dupHTML(el.value)},
  gsearch:function(el){
    ui.gq=el.value;var box=document.getElementById('gres');var q=el.value.trim().toLowerCase();if(!box)return;
    if(q.length<2){box.innerHTML='';return}
    var staff=isStaff(),out=[];
    var add=function(k,id,kind,title,extra){out.push('<button type="button" data-act="gpick" data-k="'+k+'" data-id="'+esc(id)+'"'+(extra||'')+'><span class="k">'+esc(kind)+'</span><span class="t">'+esc(title)+'</span></button>')};
    (staff?S.deals.filter(seeDeal):myDeals()).forEach(function(d){if((d.customer+' '+d.id).toLowerCase().indexOf(q)>-1)add('deal',d.id,'Registration · '+d.status,d.customer+' · '+d.id)});
    if(!staff)S.products.forEach(function(p){if((p.name+' '+p.short).toLowerCase().indexOf(q)>-1)add('prod',p.id,'Product',p.name)});
    newsFor().forEach(function(n){if(n.title.toLowerCase().indexOf(q)>-1)add('news',n.id,'Announcement',n.title)});
    S.resources.forEach(function(r){if(r.title.toLowerCase().indexOf(q)>-1)add('res',r.id,'Resource · '+r.cat,r.title,' data-q="'+esc(r.title)+'"')});
    S.tickets.forEach(function(t){if((staff?canSeePartner(partnerById(t.partnerId)):t.partnerId===myPartner().id)&&(t.subject+' '+t.id).toLowerCase().indexOf(q)>-1)add('case',t.id,'Case · '+t.status,t.subject)});
    box.innerHTML='<div class="gres">'+(out.length?out.slice(0,10).join(''):'<div class="empty" style="padding:20px">No results for "'+esc(el.value)+'"</div>')+'</div>';
  }
};
function captureDraft(fd){fd.forEach(function(v,k){if(k==='services')return;if(k!=='confirm')ui.draft[k]=v});if(fd.has('value')||document.querySelector('input[name=services]'))ui.draft.services=fd.getAll('services')}
var F={
  recordPay:function(fd){var ref=(fd.get('ref')||'').trim(),dt=fd.get('date')||today();if(!ref){ui.formErr='Enter the bank reference.';render();return}
    var c=S.commissions.filter(function(x){return x.id===ui.modal.id})[0];c.status='Paid';c.paidAt=dt;c.payRef=ref;c.paidBy=me().name;
    notifyP(c.partnerId,'Commission paid: '+mon(c.amount,c.partnerId)+' for '+c.customer+' on '+fmtD(dt)+'. Bank reference '+ref+'.','commissions');
    log('Recorded payment of '+mon(c.amount,c.partnerId)+' to '+partnerById(c.partnerId).name+' for '+c.dealId+' (reference '+ref+')');closeModal();toast('Payment recorded. The partner has been notified.')},
  offboard:function(fd){var x=staffById(ui.modal.id),ap=fd.get('ap'),L=leaverLoad(x.id),cs=leaverCountries(L),to={},got={};
    for(var k=0;k<cs.length;k++){var t=fd.get('to_'+cs[k]);if(!staffById(t)){ui.formErr='Choose the new owner in '+cs[k]+'.';render();return}to[cs[k]]=t}
    L.partners.forEach(function(p){p.pmId=to[p.country];(got[p.pmId]=got[p.pmId]||[]).push(p.name);notifyP(p.id,'Your Partner Manager is now '+pmName(p.pmId)+'. '+x.name+' has left Northwind Security.','home')});
    L.apps.forEach(function(a){a.pmId=to[a.country]});L.invites.forEach(function(i){i.pmId=to[i.country]});
    if(ap){S.approvers=S.approvers||[APPROVER2,APPROVER3];S.approvers[S.approvers.indexOf(x.id)]=ap}
    var heirs=Object.keys(to).map(function(c){return to[c]}).filter(function(v,i,a){return a.indexOf(v)===i});
    S.staffMeta=S.staffMeta||{};var e=S.staffMeta[x.id]=S.staffMeta[x.id]||{};e.status='Left';e.leftAt=e.leftAt||today();e.handedTo=heirs.length?heirs.join(','):(ap||'none');applyStaff();
    L.waiting.forEach(function(it){var cur=apItem(it.k,it.id);if(cur){cur.o.appr.since=today();notifyStaff(apWho(cur),'Handed over from '+x.name+': '+cur.type+', '+cur.title+'.',cur.k,cur.id)}});
    Object.keys(got).forEach(function(id){notifyStaff(id,'You now own '+got[id].length+' partner'+(got[id].length>1?'s':'')+' from '+x.name+': '+got[id].join(', ')+'.','partners',null)});
    if(ap)notifyStaff(ap,'You are now an approver ('+(S.approvers.indexOf(ap)===0?'second':'final')+' approval) in place of '+x.name+'.','approvals',null);
    var names=heirs.map(pmName).join(' and ');
    log('Offboarded '+x.name+': '+L.partners.length+' partners, '+L.waiting.length+' approvals, '+L.apps.length+' applications and '+L.invites.length+' invitations handed to '+(names||'nobody')+(ap?'; approver role to '+pmName(ap):'')+'. Account disabled');
    closeModal();toast(names?x.name+' has been handed over to '+names+'.':x.name+'\'s account has been disabled.')},
  creq:function(fd){var title=(fd.get('title')||'').trim();if(!title){ui.formErr='Say what you need.';render();return}
    S.contentReqs=S.contentReqs||[];S.contentReqs.unshift({id:'CR-'+(S.seq.creq=(S.seq.creq||5)+1),by:me().id,at:today(),title:title,detail:(fd.get('detail')||'').trim(),status:'Open'});
    notifyStaff('S-ZAR','Content request from '+me().name+': '+title,'content',null);log('Requested content "'+title+'"');ui.formErr='';ui.tab.acontent='Requests';render();toast('Request sent to '+pmName('S-ZAR')+'.')},
  pmmsg:function(fd){var pids=fd.getAll('pid'),title=(fd.get('title')||'').trim(),body=(fd.get('body')||'').trim(),u=me();
    if(!pids.length||!title||!body){ui.formErr='Choose at least one partner and add a subject and message.';render();return}
    pids=pids.filter(function(id){return ownsPartner(partnerById(id))});var paras=body.split(/\n\s*\n/).map(function(p){return p.trim()}).filter(Boolean);
    var n={id:'NW-'+(S.seq.news++),at:today(),cat:'From your Partner Manager',title:title,summary:paras[0].length>140?paras[0].slice(0,137)+'...':paras[0],body:paras,pids:pids,from:u.id};S.news.unshift(n);
    pids.forEach(function(pid){notifyP(pid,'Message from '+u.name+': '+title,'news-item',n.id)});log('Sent message "'+title+'" to '+pids.length+' partner'+(pids.length>1?'s':''));ui.formErr='';render();toast('Message sent to '+pids.length+' partner'+(pids.length>1?'s':'')+'.')},
  login:function(fd){var email=(fd.get('email')||'').trim().toLowerCase(),pass=fd.get('password')||'';ui.loginEmail=email;
    if(!email||!pass){ui.authErr='Enter your work email and password.';render();return}
    var st=STAFF_LIST.filter(function(x){return x.email===email})[0];if(st&&st.status==='Left'){ui.authErr='This account has been disabled. Contact your administrator.';log('Blocked sign-in for disabled account '+email,'warn');render();return}if(st)ui.pending=st;else{var u=S.users.filter(function(x){return x.email.toLowerCase()===email})[0];
      if(!u){var ap=S.applications.filter(function(a){return a.email.toLowerCase()===email})[0],ai=ap&&ap.status==='New'?apItem('app',ap.id):null;ui.authErr=ai?'Your application '+ap.id+' is waiting for approval: step '+(ai.o.appr.step+1)+' of 3, with '+pmName(apWho(ai))+'. You can sign in after the final approval.':ap&&ap.status==='Rejected'?'Your application '+ap.id+' was not approved. Contact Northwind Security for details.':'We could not find an account or a partner application for this email in this browser. A new partner can sign in after the final approval. (Demo: data is saved per browser, and Reset data removes it.)';S.audit.unshift({at:nowISO(),actor:email,text:'Failed sign-in: unknown account',level:'warn'});render();return}ui.pending=u}
    ui.auth='mfa';ui.authErr='';render();var f=document.getElementById('mfa-0');if(f)f.focus()},
  mfa:function(){var code='';for(var i=0;i<6;i++){var e=document.getElementById('mfa-'+i);code+=e?e.value:''}
    if(!/^\d{6}$/.test(code)){ui.authErr='Enter all 6 digits.';render();return}
    if(code==='000000'){ui.mfaFails++;S.audit.unshift({at:nowISO(),actor:ui.pending.email,text:'Incorrect verification code ('+ui.mfaFails+' of 5)'+(ui.mfaFails>=5?'. Account locked for 15 minutes':''),level:'warn'});
      ui.authErr='The code is incorrect. '+(5-ui.mfaFails)+' attempt'+(5-ui.mfaFails===1?'':'s')+' remaining.';render();var f=document.getElementById('mfa-0');if(f)f.focus();return}
    signIn(ui.pending.id,'two-step verification')},
  apply:function(fd,form){var need=['company','reg','contact','email'];
    for(var i=0;i<need.length;i++)if(!(fd.get(need[i])||'').trim()){ui.applyErr='Complete the required fields: company name, registration number, contact name and email.';render();return}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fd.get('email'))){ui.applyErr='Enter a valid work email.';render();return}
    var pmId=fd.get('pmId'),pmx=staffById(pmId);if(!pmx){ui.applyErr='Choose your Northwind Security Partner Manager.';render();return}
    if(!covers(pmx,fd.get('country'))){ui.applyErr=pmx.name+' is not a Partner Manager for '+fd.get('country')+'. Choose the person for your country.';render();return}
    if(!fd.get('consent')){ui.applyErr='Confirm your consent so we can process the application.';render();return}
    var file=form.querySelector('#ap-doc').files[0];
    var a={id:'PA-2026-00'+(S.seq.app++),company:fd.get('company').trim(),reg:fd.get('reg').trim(),country:fd.get('country'),website:(fd.get('website')||'').trim(),type:fd.get('type'),contact:fd.get('contact').trim(),title:(fd.get('title')||'').trim(),email:fd.get('email').trim(),phone:(fd.get('phone')||'').trim(),submitted:today(),status:'New',docs:file?file.name:null,pmId:pmId,invite:ui.invite||null,appr:{step:0,since:today(),log:[]}};
    if(ui.invite){(S.invites||[]).forEach(function(x){if(x.id===ui.invite)x.status='Applied'});ui.invite=null}
    S.applications.unshift(a);S.audit.unshift({at:nowISO(),actor:a.email,text:'Submitted partner application '+a.id+' ('+a.company+')',level:'info'});notify('staff','New partner application: '+a.company+'.','a-partners');notifyStaff(pmId,'Waiting for your approval: partner application from '+a.company+'.','app',a.id);
    ui.applied=a;ui.auth='applied';ui.applyErr='';render();window.scrollTo(0,0)},
  deal:function(fd){
    captureDraft(fd);var d=ui.draft;
    if(ui.step===1){if(!(d.customer||'').trim()||!(d.regNo||'').trim()||!(d.website||'').trim()||!(d.contact||'').trim()||!(d.contactTitle||'').trim()||!(d.contactEmail||'').trim()){ui.formErr='Complete the company name, registration number, website, decision maker, job title and email.';render();return}
      if(FREE_MAIL.indexOf(domainOf(d.contactEmail.split('@')[1]))>-1){ui.formErr='Use the decision maker\'s company email address. Personal addresses such as Gmail cannot be verified.';render();return}
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.contactEmail)){ui.formErr='Enter a valid email address for the decision maker.';render();return}
      ui.step=2;ui.formErr='';render();window.scrollTo(0,0);return}
    if(ui.step===2){var val=Number(String(d.value||'').replace(/[^\d.]/g,''));
      if(!d.services||!d.services.length){ui.formErr='Select at least one Northwind Security service.';render();return}
      if(!(val>0)){ui.formErr='Enter the estimated value in RM, for example 48000.';render();return}
      if(!d.closeDate){ui.formErr='Choose the expected close date.';render();return}
      var ef=fd.get('evidenceFile');if(ef&&ef.name)d.evidenceName=ef.name;delete d.evidenceFile;
      var bf=fd.get('budgetFile');if(bf&&bf.name)d.budgetName=bf.name;delete d.budgetFile;
      var af=fd.get('auditFile');if(af&&af.name)d.auditName=af.name;delete d.auditFile;d.auditConsent=!!fd.get('auditConsent');
      if(!d.budgetName){ui.formErr='Attach proof of budget from the customer, such as a letter of intent or purchase order.';render();return}
      if(d.auditName&&!d.auditConsent){ui.formErr='Confirm the customer agreed to share their audited accounts, or remove the file.';render();return}
      if(d.lastMeeting&&daysUntil(d.lastMeeting)>0){ui.formErr='The last meeting date cannot be in the future.';render();return}
      if(!(d.need||'').trim()){ui.formErr='Describe the customer\'s business need.';render();return}
      d.value=String(val);ui.step=3;ui.formErr='';render();window.scrollTo(0,0);return}
    if(!fd.get('confirm')){ui.formErr='Confirm the declaration to submit the registration.';render();return}
    var dup=findDup(d.customer);var id='NS-DR-2026-0'+(S.seq.deal++);
    var deal={id:id,partnerId:myPartner().id,customer:d.customer.trim(),industry:d.industry,country:d.country,employees:d.employees,contact:d.contact.trim(),contactEmail:d.contactEmail.trim(),contactTitle:d.contactTitle.trim(),contactPhone:(d.contactPhone||'').trim(),regNo:d.regNo.trim(),website:domainOf(d.website),lastMeeting:d.lastMeeting,source:d.source,budget:d.budget,need:d.need.trim(),
      evidence:d.evidenceName?[{name:d.evidenceName,type:d.evidenceType||'Meeting notes',at:today(),by:me().name}]:[],budgetDocs:[{name:d.budgetName,type:d.budgetType||'Letter of Intent',at:today(),by:me().name}],auditDoc:d.auditName?{name:d.auditName,at:today(),by:me().name,consent:true}:null,companyCheck:null,custConfirm:'Waiting',custSentAt:today(),custConfirmAt:null,infoRequest:null,services:d.services,value:Number(d.value),stage:d.stage||'Qualified',status:'Pending',submitted:today(),closeDate:d.closeDate,
      conflict:dup?dupText(dup):null,notes:(d.notes||'').trim(),submittedBy:me().name,extensionRequested:false,extensionUsed:false,appr:{step:0,since:today(),log:[]},
      history:[{at:today(),by:me().name,text:'Submitted for approval'},{at:today(),by:'System',text:dup?'Possible conflict found with '+dup.id:'No existing registration found'},{at:today(),by:'System',text:'Confirmation email sent to '+d.contact.trim()+' ('+d.contactEmail.trim()+')'}]};
    S.deals.unshift(deal);log('Submitted registration '+id+' ('+deal.customer+', '+mon(deal.value,deal.partnerId)+')');notify('staff',myPartner().name+' registered '+deal.customer+' ('+mon(deal.value,deal.partnerId)+')'+(dup?'. Possible conflict.':'.'),'a-deals',id);notifyStaff(myPartner().pmId,'Waiting for your approval: deal registration for '+deal.customer+'.','deal',id);
    ui.draft={};ui.step=1;ui.prefill=null;go('deal',id);toast('Registration '+id+' submitted. Northwind Security has emailed '+deal.contact+' to confirm it.')},
  apNote:function(fd){var m=ui.modal,n=(fd.get('note')||'').trim();if(m.d==='Rejected'&&!n){ui.formErr='Enter the reason.';render();return}
    ui.modal=null;ui.formErr='';decide(m.k,m.id,m.d,n);render()},
  invitePartner:function(fd){var u=me(),co=(fd.get('company')||'').trim(),ct=(fd.get('contact')||'').trim(),em=(fd.get('email')||'').trim().toLowerCase();
    if(!co||!ct||!em){ui.formErr='Enter the company, contact name and email.';render();return}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ui.formErr='Enter a valid email address.';render();return}
    S.invites=S.invites||[];S.seq.invite=S.seq.invite||2;S.invites.unshift({id:'INV-'+(S.seq.invite++),company:co,contact:ct,email:em,country:covers(u,fd.get('country'))?fd.get('country'):u.terrs[0],pmId:u.id,at:today(),status:'Sent'});
    log('Invited '+co+' ('+em+') to apply as a partner');ui.modal=null;ui.formErr='';ui.tab.apartners='Invitations';render();toast('Invitation sent to '+em+'.')},
  reqInfo:function(fd){var t=(fd.get('text')||'').trim();if(!t){ui.formErr='Write a message to the partner.';render();return}
    var d=dealById(ui.modal.id),p=partnerById(d.partnerId);d.infoRequest={text:t,at:today()};d.history.push({at:today(),by:me().name,text:'Requested more information: '+t});log('Requested more information from '+p.name+' on '+d.id);
    notifyP(d.partnerId,'Northwind Security needs more information on your registration for '+d.customer+'.','deal',d.id);ui.modal=null;ui.formErr='';render();toast('Request sent to '+p.name+'.')},
  addInfo:function(fd){var f=fd.get('file'),ty=fd.get('type');if(!f||!f.name){ui.formErr='Choose the file to upload.';render();return}
    if(ty==='Customer audited accounts'&&!fd.get('consent')){ui.formErr='Confirm the customer agreed to share their audited accounts.';render();return}
    var d=dealById(ui.modal.id),note=(fd.get('note')||'').trim(),doc={name:f.name,type:ty,at:today(),by:me().name},had=!!d.infoRequest;
    if(DOC_BUDGET.indexOf(ty)>-1)(d.budgetDocs=d.budgetDocs||[]).push(doc);else if(ty==='Customer audited accounts'){doc.consent=true;d.auditDoc=doc}else d.evidence.push(doc);
    d.infoRequest=null;
    d.history.push({at:today(),by:me().name,text:'Uploaded '+ty+' ('+f.name+')'+(note?'. '+note:'')});log('Uploaded '+ty+' to '+d.id);notify('staff',myPartner().name+' uploaded '+ty.toLowerCase()+' for '+d.customer+'.','deal',d.id);
    ui.modal=null;ui.formErr='';render();toast('Sent to Northwind Security for review.')},
  progress:function(fd){var d=dealById(ui.modal.id),note=(fd.get('note')||'').trim(),next=(fd.get('next')||'').trim(),nd=fd.get('nextDate');
    if(!note){ui.formErr='Describe what happened since the last update.';render();return}
    if(!next||!nd){ui.formErr='Enter the next step and its date.';render();return}
    var was=activity(d),days=idle(d),st=fd.get('stage');
    if(st&&st!==d.stage){d.stage=st;note+=' Stage changed to '+st+'.'}
    if(fd.get('closeDate'))d.closeDate=fd.get('closeDate');
    d.nextStep=next;d.nextStepDate=nd;d.lastActivity=today();
    d.history.push({at:today(),by:me().name,text:'Progress update: '+note+' Next step: '+next+' ('+fmtD(nd)+')'});
    if(was==='Inactive'){d.history.push({at:today(),by:'System',text:'Protection restored after '+days+' days without an update'});notify('staff',myPartner().name+' updated '+d.customer+' after '+days+' days without an update.','deal',d.id)}
    log('Posted progress update on '+d.id);ui.modal=null;ui.formErr='';render();toast(was==='Inactive'?'Update saved. Protection is restored.':'Progress update saved.')},
  reject:function(fd){var r=(fd.get('reason')||'').trim();if(!r){ui.formErr='Enter a reason for the partner.';render();return}
    var d=dealById(ui.modal.id);d.status='Rejected';d.rejectReason=r;d.history.push({at:today(),by:me().name,text:'Rejected: '+r});log('Rejected registration '+d.id+' for '+partnerById(d.partnerId).name);
    notifyP(d.partnerId,'Registration not approved: '+d.customer+'.','deals',d.id);ui.modal=null;ui.formErr='';render();toast('Registration rejected. The partner has been notified.')},
  invite:function(fd){var name=(fd.get('name')||'').trim(),email=(fd.get('email')||'').trim().toLowerCase();
    if(!name||!email){ui.formErr='Enter a name and work email.';render();return}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ui.formErr='Enter a valid email address.';render();return}
    if(email.split('@')[1]!==myDomain()){ui.formErr='Only @'+myDomain()+' addresses can be invited. Ask Northwind Security to approve another domain.';log('Blocked invitation to external domain: '+email,'warn');render();return}
    if(S.users.some(function(u){return u.email===email})){ui.formErr='This person already has an account.';render();return}
    S.users.push({id:'U'+(S.seq.user++),partnerId:myPartner().id,name:name,email:email,role:fd.get('role'),mfa:'Not set up',status:'Invited',last:null});
    log('Invited '+email+' as '+fd.get('role'));ui.modal=null;ui.formErr='';render();toast('Invitation sent to '+email+'.')},
  invoice:function(fd,form){var no=(fd.get('no')||'').trim();if(!no){ui.formErr='Enter the invoice number.';render();return}
    var f=form.querySelector('#inv-file').files[0],c=S.commissions.filter(function(x){return x.id===ui.modal.id})[0];
    c.status='Invoice submitted';c.invoice=no+(f?' ('+f.name+')':'');c.appr={step:0,since:today(),log:[]};notifyStaff(myPartner().pmId,'Waiting for your approval: commission payout for '+c.customer+'.','pay',c.id);log('Uploaded invoice '+no+' for '+c.dealId);notify('staff',myPartner().name+' uploaded invoice '+no+' for '+mon(c.amount,c.partnerId)+'.','a-payouts');
    ui.modal=null;ui.formErr='';render();toast('Invoice submitted. Northwind Security will approve and release the payment.')},
  newcase:function(fd){var sub=(fd.get('subject')||'').trim(),body=(fd.get('body')||'').trim();if(!sub||!body){ui.formErr='Enter a subject and description.';render();return}
    var id='TCK-'+(S.seq.ticket++);S.tickets.unshift({id:id,partnerId:myPartner().id,subject:sub,type:fd.get('type'),customer:fd.get('customer')||'',status:'Open',updated:nowISO(),messages:[{by:me().name,staff:false,at:nowISO(),text:body}]});
    log('Opened case '+id);notify('staff','New case from '+myPartner().name+': '+sub,'a-cases',id);ui.modal=null;ui.formErr='';go('case',id);toast('Case '+id+' created.')},
  reply:function(fd){var txt=(fd.get('text')||'').trim();if(!txt){ui.formErr='Write a reply first.';render();return}
    var t=caseById(ui.id),staff=isStaff();t.messages.push({by:staff?'Northwind Security Partner Team':me().name,staff:staff,at:nowISO(),text:txt});t.updated=nowISO();
    if(staff){if(t.status==='Open')t.status='In progress';notifyP(t.partnerId,'Northwind Security replied on '+t.id+'.','cases',t.id)}
    else{if(t.status==='Waiting on you'||t.status==='Resolved')t.status='Open';notify('staff',myPartner().name+' replied on '+t.id+'.','a-cases',t.id)}
    log('Replied on case '+t.id);ui.formErr='';render();toast('Reply sent.')},
  news:function(fd){if(!canPublish())return;var title=(fd.get('title')||'').trim(),sum=(fd.get('summary')||'').trim(),body=(fd.get('body')||'').trim();
    if(!title||!sum||!body){ui.formErr='Add a headline, a summary and the full text.';render();return}
    S.news.unshift({id:'NW-'+(S.seq.news++),at:today(),cat:fd.get('cat'),title:title,summary:sum,body:body.split(/\n\s*\n/).map(function(p){return p.trim()}).filter(Boolean)});
    log('Posted announcement "'+title+'"');notify('partner','New announcement: '+title,'news');ui.formErr='';render();toast('Announcement posted'+(fd.get('email')?' and emailed to partners (simulated).':'.'))},
  publish:function(fd,form){if(!canPublish())return;var title=(fd.get('title')||'').trim();if(!title){ui.formErr='Enter a title.';render();return}
    var f=form.querySelector('#pb-file').files[0];
    var r={id:'R'+(S.seq.res++),cat:fd.get('cat'),type:fd.get('type'),title:title,date:today(),size:f?(f.size>1048576?(f.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(f.size/1024))+' KB'):'1.0 MB',minTier:fd.get('minTier'),downloads:0};
    S.resources.unshift(r);log('Published resource "'+title+'" for '+r.minTier+' and above');
    if(fd.get('announce')){S.news.unshift({id:'NW-'+(S.seq.news++),at:today(),cat:'Product',title:'New in the Resource library: '+title,summary:r.cat+' for '+r.minTier+' partners and above.',body:['"'+title+'" is now available in the Resource library under '+r.cat+'.','It can be downloaded by '+r.minTier+' partners and above.']});
      if(tierRank(myPartner().tier)>=tierRank(r.minTier))notify('partner','New resource: '+title,'resources')}
    ui.formErr='';render();toast('"'+title+'" is published.')}
};

/* ---------- events ---------- */
document.addEventListener('click',function(ev){
  var el=ev.target.closest('[data-act]');
  if(!el){var changed=false;if(ui.dd&&!ev.target.closest('.dd')){ui.dd=null;changed=true}var g=document.getElementById('gres');if(g&&!ev.target.closest('.gsearch'))g.innerHTML='';if(changed)render();return}
  var act=el.dataset.act;
  if(act==='ovClose'){if(ev.target===el)closeModal();return}
  if(el.tagName==='TR'){var inner=ev.target.closest('button,a,select,input');if(inner&&inner!==el)return}
  if(el.disabled)return;
  if(A[act]){ev.preventDefault();A[act](el,ev)}
});
document.addEventListener('submit',function(ev){var f=ev.target.closest('[data-form]');if(!f)return;ev.preventDefault();var fn=F[f.dataset.form];if(fn)fn(new FormData(f),f)});
document.addEventListener('change',function(ev){var el=ev.target.closest('[data-change]');if(el&&CH[el.dataset.change])CH[el.dataset.change](el)});
document.addEventListener('input',function(ev){var el=ev.target;
  if(el.id&&el.id.indexOf('mfa-')===0){el.value=el.value.replace(/\D/g,'').slice(0,1);var i=Number(el.id.slice(4));if(el.value&&i<5){var n=document.getElementById('mfa-'+(i+1));if(n)n.focus()}return}
  var h=el.closest('[data-input]');if(h&&IN[h.dataset.input])IN[h.dataset.input](h)});
document.addEventListener('paste',function(ev){var el=ev.target;if(!el.id||el.id.indexOf('mfa-')!==0)return;var t=(ev.clipboardData&&ev.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);if(!t)return;ev.preventDefault();for(var i=0;i<6;i++){var e=document.getElementById('mfa-'+i);if(e)e.value=t[i]||''}});
document.addEventListener('keydown',function(ev){var el=ev.target;
  if(el.id&&el.id.indexOf('mfa-')===0&&ev.key==='Backspace'&&!el.value){var i=Number(el.id.slice(4));if(i>0){var p=document.getElementById('mfa-'+(i-1));if(p){p.focus();p.value=''}}}
  if(ev.key==='Escape'){if(ui.modal)closeModal();else if(ui.dd){ui.dd=null;render()}else if(ui.navOpen){ui.navOpen=false;render()}}
  if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='k'){var g=document.getElementById('gsearch');if(g){ev.preventDefault();g.focus()}}
  if(ev.key==='Enter'&&el.tagName==='TR'&&el.dataset.act&&A[el.dataset.act])A[el.dataset.act](el,ev)});

render();
})();
