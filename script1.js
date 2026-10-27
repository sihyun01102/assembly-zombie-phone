
(() => {
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const initial={unlocked:false,firstChoice:null,ymLocation:false,selfLocation:false,videoViewed:false,videoShared:false,screenshotReceived:false,noticeOld:false,stage1:false,radioOld:false,signalFound:false,radioSaved:false,assignSeen:false,zoneFound:false,phoneUnlocked:false,called204:false,mapUnlocked:false,routeDone:false,fiveArrived:false,finalRadio:false,finalBroadcast:false,ended:false,battery:9,time:'16:38',officeEvent:false,jionEvent:false,ymMessages:[],jionMessages:[],officeMessages:[]};
let S=Object.assign({},initial,JSON.parse(localStorage.getItem('assemblyZombiePhone')||'{}'));
const save=()=>localStorage.setItem('assemblyZombiePhone',JSON.stringify(S));
const set=(patch)=>{Object.assign(S,patch);save();renderState();};
function toast(t,x){$('#toastTitle').textContent=t;$('#toastText').textContent=x;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2500)}
function battery(n,time){S.battery=n;if(time)S.time=time;save();renderState()}
function renderState(){
 $('#batnum').textContent=S.battery+'%'; $('#batfill').style.width=S.battery+'%'; $('#clock').textContent=S.time;
 $$('.battery').forEach(x=>x.classList.toggle('low',S.battery<=10));
 $('#radioIcon').classList.toggle('locked',!S.stage1); $('#phoneIcon').classList.toggle('locked',!S.phoneUnlocked); $('#mapIcon').classList.toggle('locked',!S.mapUnlocked);
 $('#assignFile').style.display=S.signalFound?'flex':'none'; $('#clueThumb').style.display=S.assignSeen?'block':'none';
 let m='여명 비서관의 이동을 멈추고 현재 상황을 확인하세요.', sub='확인되지 않은 이동은 위험합니다.';
 if(S.firstChoice && !S.noticeOld){m='도서관 집결 안내의 시각을 확인하세요.';sub='영상과 파일의 시간을 비교할 수 있습니다.'}
 if(S.noticeOld && !S.stage1){m='도서관 영상과 안내 원본을 모두 확인하세요.';sub='확인한 자료를 여명에게 전달해야 합니다.'}
 if(S.stage1 && !S.signalFound){m='라디오에서 본청 현장 교신을 찾으세요.';sub='91.4 안내 방송과 93.0~94.0 현장 대역을 확인하세요.'}
 if(S.signalFound && !S.zoneFound){m='여섯 명이 있는 대기실의 정확한 위치를 찾으세요.';sub='배정표와 어제 찍은 표지 사진을 확인하세요.'}
 if(S.zoneFound && !S.called204){m='찾아낸 내선으로 현재 위치와 인원을 확인하세요.';sub='자료검토실 · 제2대기실의 연락처를 사용하세요.'}
 if(S.called204 && !S.routeDone){m='여명과 시설 담당자가 이동할 내부 경로를 확인하세요.';sub='외부로 나가지 않고 본청 내부에서 접근해야 합니다.'}
 if(S.routeDone && !S.finalRadio){m='후속 이송 한 명의 도착을 확인하세요.';sub='지온이 알려준 예비 중계 101.2를 확인하세요.'}
 if(S.finalRadio && !S.finalBroadcast){m='처음의 안내 방송이 정정됐는지 확인하세요.';sub='91.4 MHz를 다시 맞춰보세요.'}
 if(S.finalBroadcast){m='본청 고립 인원 6/6 확인 완료';sub='연락현황에서 마지막 상태를 확인하세요.'}
 $('#mission').textContent=m;$('#missionsub').textContent=sub;
 $('#msgbadge').style.display=(S.firstChoice&&S.officeEvent)?'grid':'none';
 renderNotes(); renderStatus();
}
function showView(id){$$('.view,.appview').forEach(v=>v.classList.remove('active'));$('#'+id).classList.add('active');$('#homebar').style.display=(id==='lock'||id==='poweroff')?'none':'block';}
function openApp(id){if((id==='radio'&&!S.stage1)||(id==='phoneapp'&&!S.phoneUnlocked)||(id==='map'&&!S.mapUnlocked)){toast('잠겨 있음','아직 사용할 이유가 없습니다.');return} showView(id); if(id==='messages')showChatList(); if(id==='radio')updateRadio(); if(id==='status')renderStatus();}
function unlock(target){S.unlocked=true;save();showView(target||'home');if(target==='gallery')openMedia('video');if(target==='messages'){openChat('ym')}}
// lock interactions
let sy=0;$('#lock').addEventListener('pointerdown',e=>sy=e.clientY);$('#lock').addEventListener('pointerup',e=>{if(sy-e.clientY>55)unlock('home')});
$$('[data-locktarget]').forEach(b=>b.onclick=()=>unlock(b.dataset.locktarget));
$$('.app').forEach(b=>b.onclick=()=>openApp(b.dataset.app));$$('[data-close]').forEach(b=>b.onclick=()=>showView('home'));$('#homebar').onclick=()=>showView('home');
// Messages
const baseYM=[
 {who:'me',time:'08:41',text:'수정본 올렸습니다! 표 숫자 한 번만 같이 체크해주세요ㅠ'},
 {who:'them',time:'08:42',text:'오케이. 본청 도착하면 확인할게.'},
 {who:'me',time:'08:43',text:'오늘 끝나면 국밥 먹으러 가용ㅋㅋㅋ'},
 {who:'them',time:'08:44',text:'오늘 끝나기는 하냐ㅋㅋ'},
 {who:'me',time:'10:47',text:'저는 회관으로 들어왔어요. 어디세요?',fail:true},
 {who:'them',time:'16:38',text:'도서관으로 집결하래.\n난 그쪽으로 가보려고.\n너 어디야?'}
];
const baseOffice=[
 {who:'them',name:'이시환 보좌관',time:'10:28',text:'지금 밖에 무슨 일이에요?'},
 {who:'them',name:'김인철 비서관',time:'10:29',text:'감사 중단됐어요. 일단 안에서 대기하래요.'},
 {who:'them',name:'서용호 선임비서관',time:'10:30',text:'여명비서관님 본청 들어갔죠?'},
 {who:'them',name:'김인철 비서관',time:'10:31',text:'상황공유방에서 온 안내입니다. 일단 공유드려요.\n📎 임시_집결_안내.pdf'}
];
function showChatList(){ $('#chatList').style.display='block';$('#chatWrap').style.display='none';$('#chatTitle').textContent='메시지'; }
$$('[data-chat]').forEach(r=>r.onclick=()=>openChat(r.dataset.chat));
function bubble(m){const d=document.createElement('div');d.className='bubble '+(m.who==='me'?'me':'')+(m.fail?' fail':'');d.innerHTML=(m.name?'<b style="font-size:11px;color:#b7c1c8">'+m.name+'</b><br>':'')+escapeHtml(m.text).replace(/\n/g,'<br>')+'<span class="time">'+m.time+'</span>'+(m.fail?'<div class="failtag">전송 실패 · 다시 보내기</div>':'');return d}
function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function openChat(type){$('#chatList').style.display='none';$('#chatWrap').style.display='flex';const log=$('#chatLog'), choices=$('#chatChoices');log.innerHTML='';choices.innerHTML='';
 if(type==='ym'){ $('#chatTitle').textContent='여명';[...baseYM,...S.ymMessages].forEach(m=>log.appendChild(bubble(m))); renderYMChoices(choices); }
 if(type==='office'){ $('#chatTitle').textContent='의원실 단톡방';[...baseOffice,...S.officeMessages].forEach(m=>log.appendChild(bubble(m))); choices.innerHTML='<button class="choice" id="backChats">‹ 대화 목록</button>'; }
 if(type==='jion'){ $('#chatTitle').textContent='한지온'; if(!S.jionMessages.length)log.appendChild(bubble({who:'them',time:'—',text:'아직 새 메시지가 없습니다.'}));S.jionMessages.forEach(m=>log.appendChild(bubble(m))); choices.innerHTML='<button class="choice" id="backChats">‹ 대화 목록</button>'; }
 const b=$('#backChats');if(b)b.onclick=showChatList; log.scrollTop=log.scrollHeight;
}
function renderYMChoices(c){
 if(!S.firstChoice){['아직 본청 안에 계세요?','일단 움직이지 마세요.','그 안내 어디서 받으셨어요?'].forEach((t,i)=>{const b=document.createElement('button');b.className='choice';b.textContent=t;b.onclick=()=>chooseFirst(i+1);c.appendChild(b)});return}
 const back=document.createElement('button');back.className='choice';back.textContent='‹ 대화 목록';back.onclick=showChatList;c.appendChild(back);
 if(!S.videoShared){const b=document.createElement('button');b.className='choice';b.textContent='최근 동영상 확인하기';b.onclick=()=>{showView('gallery');openMedia('video')};c.prepend(b)}
 else if(!S.noticeOld){const b=document.createElement('button');b.className='choice';b.textContent='받은 안내와 원본 비교하기';b.onclick=()=>{showView('files');openFile('notice')};c.prepend(b)}
}
function addYM(who,text,time=S.time){S.ymMessages.push({who,text,time});save()}
function chooseFirst(n){S.firstChoice=n;S.ymLocation=true;S.selfLocation=true;
 if(n===1){addYM('me','아직 본청 안에 계세요?');addYM('them','응. 본청 안. 아직 안 나갔어. 너는?');addYM('me','저는 회관이에요. 도서관 앞에 감염자 몰려 있었어요. 일단 안에서 대기해주세요.');addYM('them','확인. 본청에서 대기할게. 찍어둔 거 있으면 보내줘.');}
 if(n===2){addYM('me','일단 움직이지 마세요.');addYM('them','아직 안 나갔어. 무슨 상황인데?');addYM('me','저는 회관이에요. 빠져나올 때 도서관 앞 상황이 안 좋았습니다. 영상 확인해볼게요.');}
 if(n===3){addYM('me','그 안내 어디서 받으셨어요?');addYM('them','직원 단톡. 오후에 다시 올라왔어.');addYM('them','📎 집결 안내 캡처');addYM('me','제가 빠져나올 때는 도서관 앞에 감염자 있었어요. 안내 확인할 동안 움직이지 마세요.');addYM('them','응. 아직 본청 안이야. 확인해봐.');S.screenshotReceived=true;}
 battery(9,'16:39');save();openChat('ym');toast('위치 확인','윤여명 · 본청 내부 · 16:39');
}
