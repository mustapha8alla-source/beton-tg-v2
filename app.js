const KEY="betonTG.v2.centers";
const FORMKEY="betonTG.v2.formulas";
const initialCenters=[
  {name:"CAB AGADIR",pin:""},
  {name:"CAB MARRAKECH",pin:""},
  {name:"CAB BENGUERIR",pin:""},
  {name:"GAB FES",pin:""}
];
const initialFormulas={
 B30:{G1:543,G2:534,SL:427,SC:427,Ciment:320,Adjuvant:3.4,Eau:158},
 B35:{G1:543,G2:530,SL:418,SC:417,Ciment:350,Adjuvant:3.8,Eau:156}
};
const defaultDensities={G1:1450,G2:1450,SL:1600,SC:1450};

function centers(){
 const s=localStorage.getItem(KEY);
 if(!s){localStorage.setItem(KEY,JSON.stringify(initialCenters));return initialCenters;}
 return JSON.parse(s);
}
function saveCenters(x){localStorage.setItem(KEY,JSON.stringify(x));}
function formulasFor(center){
 const all=JSON.parse(localStorage.getItem(FORMKEY)||"{}");
 if(!all[center]) {
   all[center]={formulas:JSON.parse(JSON.stringify(initialFormulas)),densities:JSON.parse(JSON.stringify(defaultDensities))};
   localStorage.setItem(FORMKEY,JSON.stringify(all));
 }
 return all[center];
}
function saveFormulas(center,data){
 const all=JSON.parse(localStorage.getItem(FORMKEY)||"{}");
 all[center]=data;
 localStorage.setItem(FORMKEY,JSON.stringify(all));
}
function $(id){return document.getElementById(id);}
function hideAll(){["welcome","login","register","home","calcul","formules"].forEach(x=>$(x)?.classList.add("hidden"));}
function showWelcome(){hideAll();$("welcome").classList.remove("hidden");}
function showLogin(){
 hideAll();$("login").classList.remove("hidden");$("loginMsg").textContent="";
 $("loginCenter").innerHTML=centers().map(c=>`<option>${c.name}</option>`).join("");
}
function showRegister(){hideAll();$("register").classList.remove("hidden");$("registerMsg").textContent="";}
function register(){
 const name=$("registerCenter").value.trim().toUpperCase(), p=$("registerPin").value.trim(), p2=$("registerPin2").value.trim();
 if(!name){$("registerMsg").textContent="أدخل اسم المركز.";return}
 if(!/^\d{4}$/.test(p)){$("registerMsg").textContent="الرقم السري يجب أن يتكون من 4 أرقام.";return}
 if(p!==p2){$("registerMsg").textContent="الرقمان السريان غير متطابقين.";return}
 const list=centers(), existing=list.find(c=>c.name===name);
 if(existing){
   if(existing.pin){$("registerMsg").textContent="هذا المركز لديه حساب بالفعل. استخدم تسجيل الدخول.";return}
   existing.pin=p;
 }else list.push({name,pin:p});
 saveCenters(list); alert("تم إنشاء حساب "+name); showLogin(); $("loginCenter").value=name;
}
function login(){
 const name=$("loginCenter").value,pin=$("loginPin").value.trim(),c=centers().find(x=>x.name===name);
 if(!c||!c.pin){$("loginMsg").textContent="هذا المركز لم يتم تفعيل حسابه بعد.";return}
 if(pin!==c.pin){$("loginMsg").textContent="الرقم السري غير صحيح.";return}
 sessionStorage.setItem("betonTG.current",name); openHome();
}
function openHome(){
 const c=sessionStorage.getItem("betonTG.current"); if(!c)return;
 $("currentCenter").textContent="المركز: "+c; hideAll(); $("home").classList.remove("hidden");
}
function logout(){sessionStorage.removeItem("betonTG.current");showWelcome();}
function openCalcul(){hideAll();$("calcul").classList.remove("hidden");populateTypes();calculate();}
function populateTypes(){
 const f=formulasFor(sessionStorage.getItem("betonTG.current"));
 $("type").innerHTML=Object.keys(f).map(x=>`<option>${x}</option>`).join("");
}
function calculate(){
 const center=sessionStorage.getItem("betonTG.current"), f=formulasFor(center), type=$("type").value, q=parseFloat($("qty").value)||0, r=f[type];
 if(!r)return;
 const rows=[
  ["G1",r.G1,data.densities.G1],["G2",r.G2,data.densities.G2],["SL",r.SL,data.densities.SL],["SC",r.SC,data.densities.SC],
  ["Ciment",r.Ciment,null],["Adjuvant",r.Adjuvant,null],["Eau",r.Eau,null]
 ];
 $("results").innerHTML=rows.map(([n,v,d])=>{
   const kg=v*q, vol=d?(kg/d):null;
   return `<tr><td>${n}</td><td>${kg.toFixed(2)} kg</td><td>${vol===null?"—":vol.toFixed(2)+" m³"}</td></tr>`;
 }).join("");
}
function openFormules(){
 hideAll();$("formules").classList.remove("hidden");
 renderFormula();
}
function renderFormula(){
 const f=formulasFor(sessionStorage.getItem("betonTG.current")), type=$("formulaType").value || Object.keys(f)[0];
 $("formulaType").innerHTML=Object.keys(f).map(x=>`<option ${x===type?"selected":""}>${x}</option>`).join("");
 const r=f[type];
 ["G1","G2","SL","SC","Ciment","Adjuvant","Eau"].forEach(k=>$(k).value=r[k]);
}
function saveFormula(){
 const center=sessionStorage.getItem("betonTG.current");
 const pin=prompt("أدخل الرقم السري للمركز لتأكيد الحفظ:");
 if(pin===null)return;
 const c=centers().find(x=>x.name===center);
 if(!c || pin!==c.pin){alert("الرقم السري غير صحيح. لم يتم الحفظ.");return}
 const all=formulasFor(center), type=$("formulaType").value;
 all[type]={};
 ["G1","G2","SL","SC","Ciment","Adjuvant","Eau"].forEach(k=>all[type][k]=parseFloat($(k).value)||0);
 saveFormulas(center,all);
 alert("تم حفظ التعديلات بنجاح.");
}
function addFormula(){
 const name=prompt("اسم نوع الخرسانة الجديد، مثلاً B40:");
 if(!name)return;
 const f=formulasFor(sessionStorage.getItem("betonTG.current")), n=name.trim().toUpperCase();
 if(f[n]){alert("هذا النوع موجود بالفعل.");return}
 f[n]={G1:0,G2:0,SL:0,SC:0,Ciment:0,Adjuvant:0,Eau:0};
 saveFormulas(sessionStorage.getItem("betonTG.current"),f); renderFormula();
}
function deleteFormula(){
 const center=sessionStorage.getItem("betonTG.current"), f=formulasFor(center), type=$("formulaType").value;
 if(Object.keys(f).length<=1){alert("يجب الاحتفاظ بنوع واحد على الأقل.");return}
 const pin=prompt("أدخل الرقم السري للمركز لتأكيد الحذف:");
 if(pin===null)return;
 const c=centers().find(x=>x.name===center);
 if(!c||pin!==c.pin){alert("الرقم السري غير صحيح. لم يتم الحذف.");return}
 delete f[type]; saveFormulas(center,f); renderFormula(); alert("تم حذف الوصفة.");
}
window.addEventListener("load",()=>{if(sessionStorage.getItem("betonTG.current"))openHome();});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
