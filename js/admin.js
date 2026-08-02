import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { ROLLS } from "./app-config.js";
import { calc, prettyDate, pctClass } from "./utils.js";

document.getElementById("today").textContent=prettyDate();
document.getElementById("logoutBtn").onclick=()=>signOut(auth).then(()=>location.replace("index.html"));
document.getElementById("refreshBtn").onclick=load;

onAuthStateChanged(auth,async user=>{
  if(!user){location.replace("index.html");return}
  const p=await getDoc(doc(db,"users",user.uid));
  if(!p.exists()||p.data().role!=="admin"){location.replace("dashboard.html");return}
  load();
});

async function load(){
  const tbody=document.querySelector("#classTable tbody");tbody.innerHTML=`<tr><td colspan="7">Loading…</td></tr>`;
  let totals={p:0,a:0};
  const rows=await Promise.all(ROLLS.map(async roll=>{
    const snap=await getDocs(collection(db,"attendance",roll,"records"));
    const rec={};let latest=null;
    snap.forEach(d=>{const x=d.data();rec[d.id]=x;if(x.updatedAt?.toDate){const t=x.updatedAt.toDate();if(!latest||t>latest)latest=t}});
    const s=calc(rec);totals.p+=s.p;totals.a+=s.a;
    return {roll,s,latest};
  }));
  const all=totals.p+totals.a, pct=all?100*totals.p/all:0;
  document.getElementById("classCards").innerHTML=`
    <div class="stat"><div class="label">Students</div><div class="value">13</div></div>
    <div class="stat good"><div class="label">Class present marks</div><div class="value">${totals.p}</div></div>
    <div class="stat bad"><div class="label">Class absent marks</div><div class="value">${totals.a}</div></div>
    <div class="stat"><div class="label">Combined attendance</div><div class="value">${all?pct.toFixed(1):"0.0"}%</div></div>`;
  tbody.innerHTML=rows.map(({roll,s,latest})=>`<tr>
    <td><b>${roll}</b></td><td class="${pctClass(s.pct,s.total)}">${s.total?s.pct.toFixed(1):"0.0"}%</td>
    <td>${s.p}</td><td>${s.a}</td><td>${s.total}</td>
    <td>${latest?latest.toLocaleString("en-IN"):"Never"}</td>
    <td><a class="action-link" href="dashboard.html?roll=${roll}">Open →</a></td></tr>`).join("");
}
