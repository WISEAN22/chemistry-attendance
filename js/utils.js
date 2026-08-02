import { SUBJECTS, WEEKLY_SCHEDULE, SEMESTER_START, SEMESTER_END } from "./app-config.js";

export const pad=n=>String(n).padStart(2,"0");
export function localISO(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
export function parseISO(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
export function prettyDate(d=new Date()){return d.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
export function monthLabel(y,m){return new Date(y,m,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
export function scheduledSubjects(date){
  const iso=localISO(date);
  if(iso<SEMESTER_START || iso>SEMESTER_END) return [];
  return WEEKLY_SCHEDULE[date.getDay()]||[];
}
export function daysInMonth(y,m){
  const out=[], last=new Date(y,m+1,0).getDate();
  for(let d=1;d<=last;d++) out.push(new Date(y,m,d));
  return out;
}
export function recordId(date,subject,slot){return `${localISO(date)}_${subject}_${slot}`}
export function statusText(s){return s==="P"?"P":s==="A"?"A":"—"}
export function calc(records, filter=()=>true){
  let p=0,a=0;
  Object.values(records).forEach(r=>{if(!filter(r))return;if(r.status==="P")p++;if(r.status==="A")a++});
  const total=p+a, pct=total?100*p/total:0;
  return {p,a,total,pct};
}
export function pctClass(pct,total){if(!total)return "";return pct>=75?"attendance-good":pct>=65?"attendance-warn":"attendance-bad"}
export function statsHTML(s){
  return `<div class="stat ${s.total&&s.pct>=75?"good":""}"><div class="label">Attendance</div><div class="value">${s.total?s.pct.toFixed(1):"0.0"}%</div></div>
  <div class="stat"><div class="label">Present</div><div class="value">${s.p}</div></div>
  <div class="stat ${s.a?"bad":""}"><div class="label">Absent</div><div class="value">${s.a}</div></div>
  <div class="stat"><div class="label">Marked classes</div><div class="value">${s.total}</div></div>`;
}
export function subjectSummaryHTML(records,y,m){
  return SUBJECTS.map(s=>{
    const st=calc(records,r=>r.subject===s.id && r.date.startsWith(`${y}-${pad(m+1)}-`));
    return `<div class="subject-box"><b>${s.name}</b><div class="pct ${pctClass(st.pct,st.total)}">${st.total?st.pct.toFixed(1):"0.0"}%</div><small>${st.p} present · ${st.a} absent</small></div>`;
  }).join("");
}
export function toast(msg){const el=document.getElementById("toast");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
