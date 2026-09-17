const KEY="betonTG.v2.centers";
const initial=[
  {name:"CAB AGADIR",pin:""},
  {name:"CAB MARRAKECH",pin:""},
  {name:"CAB BENGUERIR",pin:""},
  {name:"GAB FES",pin:""}
];

function centers(){
  const saved=localStorage.getItem(KEY);
  if(!saved){localStorage.setItem(KEY,JSON.stringify(initial));return initial;}
  return JSON.parse(saved);
}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));}
function $(id){return document.getElementById(id);}
function hideAll(){["welcome","login","register","home"].forEach(x=>$(x).classList.add("hidden"));}
function showWelcome(){hideAll();$("welcome").classList.remove("hidden");}
function showLogin(){
  hideAll(); $("login").classList.remove("hidden");
  $("loginMsg").textContent="";
  $("loginCenter").innerHTML=centers().map(c=>`<option>${c.name}</option>`).join("");
}
function showRegister(){hideAll();$("register").classList.remove("hidden");$("registerMsg").textContent="";}
function register(){
  const name=$("registerCenter").value.trim().toUpperCase();
  const p=$("registerPin").value.trim(), p2=$("registerPin2").value.trim();
  if(!name){$("registerMsg").textContent="Entrez le nom du centre.";return}
  if(!/^\d{4}$/.test(p)){$("registerMsg").textContent="Le PIN doit contenir exactement 4 chiffres.";return}
  if(p!==p2){$("registerMsg").textContent="Les deux PIN ne correspondent pas.";return}
  const list=centers();
  if(list.some(c=>c.name===name)){$("registerMsg").textContent="Ce centre existe déjà.";return}
  list.push({name,pin:p}); save(list);
  alert("Compte créé pour "+name);
  showLogin(); $("loginCenter").value=name;
}
function login(){
  const name=$("loginCenter").value, pin=$("loginPin").value.trim();
  const c=centers().find(x=>x.name===name);
  if(!c || !c.pin){$("loginMsg").textContent="Ce centre n'a pas encore de compte configuré.";return}
  if(pin!==c.pin){$("loginMsg").textContent="PIN incorrect.";return}
  sessionStorage.setItem("betonTG.current",name);
  $("currentCenter").textContent="Centre : "+name;
  hideAll();$("home").classList.remove("hidden");
}
function logout(){sessionStorage.removeItem("betonTG.current");showWelcome();}
window.addEventListener("load",()=>{
  const current=sessionStorage.getItem("betonTG.current");
  if(current){$("currentCenter").textContent="Centre : "+current;hideAll();$("home").classList.remove("hidden");}
});

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));}
