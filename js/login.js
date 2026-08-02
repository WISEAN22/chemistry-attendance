import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { LOGIN_DOMAIN, ADMIN_USERNAME, ADMIN_EMAIL } from "./firebase-config.js";

async function routeUser(user){
  const snap=await getDoc(doc(db,"users",user.uid));
  if(!snap.exists()) throw new Error("User profile not found.");
  const data=snap.data();
  location.replace(data.role==="admin"?"admin.html":"dashboard.html");
}
onAuthStateChanged(auth,u=>{if(u)routeUser(u).catch(()=>{})});

document.getElementById("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const id=document.getElementById("loginId").value.trim().toLowerCase();
  const pw=document.getElementById("password").value;
  const err=document.getElementById("loginError"); err.textContent="";
  const email=id===ADMIN_USERNAME?ADMIN_EMAIL:`${id}@${LOGIN_DOMAIN}`;
  try{const cred=await signInWithEmailAndPassword(auth,email,pw);await routeUser(cred.user)}
  catch(ex){err.textContent="Invalid roll number/username or password."}
});
