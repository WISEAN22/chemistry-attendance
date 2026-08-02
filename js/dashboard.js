import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { collection, doc, getDoc, onSnapshot, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { SUBJECTS, SEMESTER_START, SEMESTER_END } from "./app-config.js";
import { localISO, prettyDate, monthLabel, scheduledSubjects, daysInMonth, recordId, calc, statsHTML, subjectSummaryHTML, pad, toast } from "./utils.js";

let userProfile=null, targetRoll=null, records={}, unsub=null;
let shown=new Date(); shown.setDate(1);
const params=new URLSearchParams(location.search);
document.getElementById("today").textContent=prettyDate();

document.getElementById("logoutBtn").onclick=()=>signOut(auth).then(()=>location.replace("index.html"));
document.getElementById("prevMonth").onclick=()=>{shown.setMonth(shown.getMonth()-1);render()};
document.getElementById("nextMonth").onclick=()=>{shown.setMonth(shown.getMonth()+1);render()};
document.getElementById("thisMonth").onclick=()=>{shown=new Date();shown.setDate(1);render()};

onAuthStateChanged(auth,async user=>{
  if(!user){location.replace("index.html");return}
  const p=await getDoc(doc(db,"users",user.uid));
  if(!p.exists()){await signOut(auth);return}
  userProfile=p.data();
  targetRoll=userProfile.role==="admin" && params.get("roll") ? params.get("roll") : userProfile.roll;
  if(userProfile.role!=="admin" && targetRoll!==userProfile.roll){location.replace("dashboard.html");return}
  document.getElementById("studentRoll").textContent=targetRoll+(userProfile.role==="admin"?" · Admin editing":"");
  listen();
});

function listen(){
  if(unsub)unsub();
  unsub=onSnapshot(collection(db,"attendance",targetRoll,"records"),snap=>{
    records={};snap.forEach(d=>records[d.id]=d.data());render();
  });
}

function render(){
  const y=shown.getFullYear(),m=shown.getMonth(),prefix=`${y}-${pad(m+1)}-`;
  document.getElementById("monthTitle").textContent=monthLabel(y,m);
  document.getElementById("overallCards").innerHTML=statsHTML(calc(records));
  document.getElementById("monthCards").innerHTML=statsHTML(calc(records,r=>r.date.startsWith(prefix)));
  document.getElementById("subjectSummary").innerHTML=subjectSummaryHTML(records,y,m);
  const tbody=document.querySelector("#attendanceTable tbody");tbody.innerHTML="";
  const today=localISO();
  for(const date of daysInMonth(y,m)){
    const iso=localISO(date);
    if(iso<SEMESTER_START || iso>SEMESTER_END) continue;
    const sched=scheduledSubjects(date);
    if(!sched.length) continue;
    const tr=document.createElement("tr");if(iso>today)tr.className="future";
    const day=date.toLocaleDateString("en-IN",{weekday:"long"});
    tr.innerHTML=`<td>${date.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</td><td>${day}</td>`;
    for(const subject of SUBJECTS){
      const td=document.createElement("td");
      const slots=sched.map((s,i)=>({s,i})).filter(x=>x.s===subject.id);
      if(!slots.length){td.innerHTML='<span class="dash">—</span>'}
      else{
        const wrap=document.createElement("div");wrap.className="class-slots";
        slots.forEach((x,displayIndex)=>{
          const id=recordId(date,subject.id,x.i), rec=records[id];
          const b=document.createElement("button");
          b.className=`slot ${rec?.status==="P"?"present":rec?.status==="A"?"absent":""}`;
          b.textContent=slots.length>1?`${displayIndex+1}: ${rec?.status||"—"}`:(rec?.status||"—");
          b.title="Click: Not marked → Present → Absent → Not marked";
          b.disabled=iso>today;
          b.onclick=()=>cycle(date,subject.id,x.i,rec?.status||"");
          wrap.appendChild(b);
        });td.appendChild(wrap);
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

async function cycle(date,subject,slot,current){
  const next=current===""?"P":current==="P"?"A":"";
  const id=recordId(date,subject,slot), ref=doc(db,"attendance",targetRoll,"records",id);
  document.getElementById("saveState").textContent="Saving…";
  try{
    await setDoc(ref,{roll:targetRoll,date:localISO(date),subject,slot,status:next,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid},{merge:true});
    await setDoc(doc(collection(db,"audit_logs")),{
      roll:targetRoll,date:localISO(date),subject,slot,from:current,to:next,actorUid:auth.currentUser.uid,
      actorRole:userProfile.role,createdAt:serverTimestamp()
    });
    document.getElementById("saveState").textContent="Synced";toast("Attendance saved");
  }catch(e){console.error(e);document.getElementById("saveState").textContent="Save failed";toast("Could not save")}
}
