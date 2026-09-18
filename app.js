const CENTER_KEY="betonTG.v2.centers";
const DATA_KEY="betonTG.v2.centerData";
const LANG_KEY="betonTG.language";
const TRUCK_KEY="betonTG.v2.trucks";
const DEFAULT_CENTERS=[
 {name:"CAB AGADIR",pin:""},{name:"CAB MARRAKECH",pin:""},
 {name:"CAB BENGUERIR",pin:""},{name:"GAB FES",pin:""}
];
const DEFAULT_DATA={
 formulas:{
  B30:{G1:543,G2:534,SL:427,SC:427,Ciment:320,Adjuvant:3.4,Eau:158},
  B35:{G1:543,G2:530,SL:418,SC:417,Ciment:350,Adjuvant:3.8,Eau:156}
 },
 densities:{G1:1450,G2:1450,SL:1600,SC:1450}
};
function $(id){return document.getElementById(id);}
function getCenters(){const s=localStorage.getItem(CENTER_KEY);if(!s){localStorage.setItem(CENTER_KEY,JSON.stringify(DEFAULT_CENTERS));return DEFAULT_CENTERS;}return JSON.parse(s);}
function saveCenters(x){localStorage.setItem(CENTER_KEY,JSON.stringify(x));}
function currentCenter(){return sessionStorage.getItem("betonTG.current");}
function getData(center){
 const all=JSON.parse(localStorage.getItem(DATA_KEY)||"{}");
 if(!all[center]){all[center]=JSON.parse(JSON.stringify(DEFAULT_DATA));localStorage.setItem(DATA_KEY,JSON.stringify(all));}
 return all[center];
}
function saveData(center,data){const all=JSON.parse(localStorage.getItem(DATA_KEY)||"{}");all[center]=data;localStorage.setItem(DATA_KEY,JSON.stringify(all));}
function setLanguage(lang){
 localStorage.setItem(LANG_KEY,lang);
 document.documentElement.lang=lang==="ar"?"ar":"fr";
 document.documentElement.dir=lang==="ar"?"rtl":"ltr";
 document.querySelectorAll("[data-fr]").forEach(el=>el.textContent=el.getAttribute("data-"+lang));
 document.querySelectorAll(".lang").forEach(b=>b.classList.toggle("active",(lang==="fr"&&b.textContent==="FR")||(lang==="ar"&&b.textContent==="ع")));
}
function lang(){return localStorage.getItem(LANG_KEY)||"fr";}
function hideAll(){["welcome","login","register","home","calcul","formules"].forEach(id=>$(id)?.classList.add("hidden"));}
function showWelcome(){hideAll();$("welcome").classList.remove("hidden");}
function showLogin(){hideAll();$("login").classList.remove("hidden");$("loginMsg").textContent="";$("loginCenter").innerHTML=getCenters().map(c=>`<option value="${c.name}">${c.name}</option>`).join("");setLanguage(lang());}
function showRegister(){hideAll();$("register").classList.remove("hidden");$("registerMsg").textContent="";setLanguage(lang());}
function register(){
 const name=$("registerCenter").value.trim().toUpperCase(),p=$("registerPin").value.trim(),p2=$("registerPin2").value.trim();
 if(!name){$("registerMsg").textContent=lang()==="ar"?"أدخل اسم المركز.":"Entrez le nom du centre.";return;}
 if(!/^\d{4}$/.test(p)){ $("registerMsg").textContent=lang()==="ar"?"الرقم السري يجب أن يكون 4 أرقام.":"Le PIN doit contenir exactement 4 chiffres.";return;}
 if(p!==p2){$("registerMsg").textContent=lang()==="ar"?"الرقمان غير متطابقين.":"Les deux PIN ne correspondent pas.";return;}
 const list=getCenters(),existing=list.find(c=>c.name===name);
 if(existing){if(existing.pin){$("registerMsg").textContent=lang()==="ar"?"هذا المركز لديه حساب بالفعل.":"Ce centre possède déjà un compte.";return;}existing.pin=p;}else list.push({name,pin:p});
 saveCenters(list);getData(name);alert(lang()==="ar"?"تم إنشاء الحساب.":"Compte créé.");showLogin();$("loginCenter").value=name;
}
function login(){
 const name=$("loginCenter").value,pin=$("loginPin").value.trim(),c=getCenters().find(x=>x.name===name);
 if(!c||!c.pin){$("loginMsg").textContent=lang()==="ar"?"الحساب غير مفعّل بعد.":"Ce compte n'est pas encore activé.";return;}
 if(pin!==c.pin){$("loginMsg").textContent=lang()==="ar"?"الرقم السري غير صحيح.":"PIN incorrect.";return;}
 sessionStorage.setItem("betonTG.current",name);openHome();
}
function openHome(){const c=currentCenter();if(!c)return;$("currentCenter").textContent=(lang()==="ar"?"المركز: ":"Centre : ")+c;hideAll();$("home").classList.remove("hidden");setLanguage(lang());}
function logout(){sessionStorage.removeItem("betonTG.current");showWelcome();}
function openCalcul(){hideAll();$("calcul").classList.remove("hidden");fillConcreteTypes();$("qty").focus();$("results").innerHTML="";$("calcMsg").textContent="";setLanguage(lang());}
function fillConcreteTypes(){const f=getData(currentCenter()).formulas;const old=$("type").value;$("type").innerHTML=Object.keys(f).map(k=>`<option value="${k}">${k}</option>`).join("");if(f[old])$("type").value=old;}
function calculate(){
 const data=getData(currentCenter()),type=$("type").value,qty=parseFloat($("qty").value);
 if(!qty||qty<=0){$("results").innerHTML="";$("calcMsg").textContent=lang()==="ar"?"أدخل كمية صحيحة.":"Veuillez saisir une quantité valide.";return;}
 const r=data.formulas[type];if(!r)return;
 const rows=[["G1",r.G1,data.densities.G1],["G2",r.G2,data.densities.G2],["SL",r.SL,data.densities.SL],["SC",r.SC,data.densities.SC],["Ciment",r.Ciment,null],["Adjuvant",r.Adjuvant,null],["Eau",r.Eau,null]];
 $("results").innerHTML=rows.map(([n,dose,density])=>{const kg=dose*qty,m3=density?kg/density:null;return `<tr><td><strong>${n}</strong></td><td>${kg.toFixed(2)} kg</td><td>${m3===null?"—":m3.toFixed(3)+" m³"}</td></tr>`}).join("");
 $("calcMsg").textContent="";
}
function openFormules(){hideAll();$("formules").classList.remove("hidden");renderFormula();setLanguage(lang());}
function renderFormula(){
 const data=getData(currentCenter()),f=data.formulas,old=$("formulaType").value;
 $("formulaType").innerHTML=Object.keys(f).map(k=>`<option value="${k}">${k}</option>`).join("");
 if(f[old])$("formulaType").value=old;
 const r=f[$("formulaType").value];if(!r)return;
 ["G1","G2","SL","SC","Ciment","Adjuvant","Eau"].forEach(k=>$(k).value=r[k]);
 ["D_G1","D_G2","D_SL","D_SC"].forEach((id,i)=>$(id).value=data.densities[["G1","G2","SL","SC"][i]]);
}
function confirmPin(){
 const pin=prompt(lang()==="ar"?"أدخل الرقم السري للمركز لتأكيد العملية:":"Entrez le PIN du centre pour confirmer :");
 if(pin===null)return false;const c=getCenters().find(x=>x.name===currentCenter());
 if(!c||pin!==c.pin){alert(lang()==="ar"?"الرقم السري غير صحيح.":"PIN incorrect.");return false;}return true;
}
function saveFormula(){if(!confirmPin())return;const data=getData(currentCenter()),type=$("formulaType").value;
 data.formulas[type]={G1:+$("G1").value||0,G2:+$("G2").value||0,SL:+$("SL").value||0,SC:+$("SC").value||0,Ciment:+$("Ciment").value||0,Adjuvant:+$("Adjuvant").value||0,Eau:+$("Eau").value||0};
 data.densities={G1:+$("D_G1").value||0,G2:+$("D_G2").value||0,SL:+$("D_SL").value||0,SC:+$("D_SC").value||0};
 saveData(currentCenter(),data);fillConcreteTypes();calculate();alert(lang()==="ar"?"تم حفظ الفورمول والكثافات.":"Formule et densités enregistrées.");}
function addFormula(){const n=(prompt(lang()==="ar"?"اسم نوع الخرسانة الجديد:":"Nom de la nouvelle formule :")||"").trim().toUpperCase();if(!n)return;const data=getData(currentCenter());if(data.formulas[n]){alert(lang()==="ar"?"هذه الفورمول موجودة بالفعل.":"Cette formule existe déjà.");return;}if(!confirmPin())return;data.formulas[n]={G1:0,G2:0,SL:0,SC:0,Ciment:0,Adjuvant:0,Eau:0};saveData(currentCenter(),data);renderFormula();alert(lang()==="ar"?"تمت إضافة الفورمول. أدخل القيم ثم اضغط حفظ.":"Formule ajoutée. Saisissez les valeurs puis cliquez sur Enregistrer.");}
function deleteFormula(){const data=getData(currentCenter()),type=$("formulaType").value;if(Object.keys(data.formulas).length<=1){alert(lang()==="ar"?"يجب الاحتفاظ بفورمول واحدة على الأقل.":"Gardez au moins une formule.");return;}if(!confirmPin())return;delete data.formulas[type];saveData(currentCenter(),data);renderFormula();fillConcreteTypes();alert(lang()==="ar"?"تم حذف الفورمول.":"Formule supprimée.");}

function getTrucks(center){
 const all=JSON.parse(localStorage.getItem(TRUCK_KEY)||"{}");
 if(!all[center]){all[center]={list:[],days:{}};localStorage.setItem(TRUCK_KEY,JSON.stringify(all));}
 return all[center];
}
function saveTrucks(center,data){const all=JSON.parse(localStorage.getItem(TRUCK_KEY)||"{}");all[center]=data;localStorage.setItem(TRUCK_KEY,JSON.stringify(all));}
function todayLocal(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
function openTrucks(){
 hideAll();$("trucks").classList.remove("hidden");
 const t=todayLocal();$("truckDate").value=t;$("truckFrom").value=t;$("truckTo").value=t;
 renderDailyTrucks();truckSummary();setLanguage(lang());
}
function addTruck(){
 const name=(prompt(lang()==="ar"?"أدخل اسم أو رقم الشاحنة:":"Entrez le nom ou numéro du camion :")||"").trim().toUpperCase();
 if(!name)return;
 const data=getTrucks(currentCenter());
 if(data.list.some(t=>t.name===name)){alert(lang()==="ar"?"هذه الشاحنة موجودة بالفعل.":"Ce camion existe déjà.");return;}
 data.list.push({id:Date.now().toString(),name});saveTrucks(currentCenter(),data);renderDailyTrucks();truckSummary();
}
function deleteTruck(){
 const data=getTrucks(currentCenter());
 if(!data.list.length){alert(lang()==="ar"?"لا توجد شاحنات.":"Aucun camion.");return;}
 const list=data.list.map((t,i)=>`${i+1}. ${t.name}`).join("\n");
 const n=parseInt(prompt((lang()==="ar"?"أدخل رقم الشاحنة المراد حذفها:\n":"Numéro du camion à supprimer :\n")+list),10)-1;
 if(n<0||n>=data.list.length)return;
 if(!confirm(lang()==="ar"?"هل تريد حذف هذه الشاحنة؟":"Voulez-vous supprimer ce camion ?"))return;
 data.list.splice(n,1);saveTrucks(currentCenter(),data);renderDailyTrucks();truckSummary();
}
function renderDailyTrucks(){
 const data=getTrucks(currentCenter()),date=$("truckDate").value||todayLocal();
 if(!data.list.length){$("truckDailyList").innerHTML='<div class="notice">'+(lang()==="ar"?"لم تتم إضافة أي شاحنة بعد.":"Aucun camion ajouté.")+'</div>';return;}
 $("truckDailyList").innerHTML=data.list.map(t=>{
  const work=data.days[date]?.[t.id]==="work";
  return `<div class="truck-row"><strong>${t.name}</strong><label class="status-toggle"><input type="checkbox" data-truck="${t.id}" ${work?"checked":""}> <span>${work?(lang()==="ar"?"تشتغل":"En marche"):(lang()==="ar"?"متوقفة":"À l'arrêt")}</span></label></div>`;
 }).join("");
 document.querySelectorAll("[data-truck]").forEach(cb=>cb.addEventListener("change",()=>{cb.nextElementSibling.textContent=cb.checked?(lang()==="ar"?"تشتغل":"En marche"):(lang()==="ar"?"متوقفة":"À l'arrêt");}));
}
function saveDailyTruckStatus(){
 const date=$("truckDate").value;if(!date){alert("Choisissez la date.");return;}
 const data=getTrucks(currentCenter());data.days[date]={};
 document.querySelectorAll("[data-truck]").forEach(cb=>data.days[date][cb.dataset.truck]=cb.checked?"work":"stop");
 saveTrucks(currentCenter(),data);truckSummary();alert(lang()==="ar"?"تم حفظ حالة الشاحنات لهذا اليوم.":"État des camions enregistré pour cette journée.");
}
function truckSummary(){
 const data=getTrucks(currentCenter()),from=$("truckFrom")?.value,to=$("truckTo")?.value;
 if(!from||!to||from>to){if($("truckSummary"))$("truckSummary").innerHTML="";return;}
 const dates=Object.keys(data.days).filter(d=>d>=from&&d<=to);
 const rows=data.list.map(t=>{
  let work=0,stop=0;
  dates.forEach(d=>{const s=data.days[d]?.[t.id];if(s==="work")work++;if(s==="stop")stop++;});
  return `<tr><td><strong>${t.name}</strong></td><td>${work}</td><td>${stop}</td><td>${work+stop}</td></tr>`;
 }).join("");
 $("truckSummary").innerHTML=`<div class="summary-table"><table><thead><tr><th>Camion</th><th>Jours travaillés</th><th>Jours à l'arrêt</th><th>Jours enregistrés</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Aucun camion</td></tr>'}</tbody></table></div>`;
}

window.addEventListener("load",()=>{setLanguage(lang());if(currentCenter())openHome();});
if("serviceWorker"in navigator)
function getTrucks(center){
 const all=JSON.parse(localStorage.getItem(TRUCK_KEY)||"{}");
 if(!all[center]){all[center]={list:[],days:{}};localStorage.setItem(TRUCK_KEY,JSON.stringify(all));}
 return all[center];
}
function saveTrucks(center,data){const all=JSON.parse(localStorage.getItem(TRUCK_KEY)||"{}");all[center]=data;localStorage.setItem(TRUCK_KEY,JSON.stringify(all));}
function todayLocal(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
function openTrucks(){
 hideAll();$("trucks").classList.remove("hidden");
 const t=todayLocal();$("truckDate").value=t;$("truckFrom").value=t;$("truckTo").value=t;
 renderDailyTrucks();truckSummary();setLanguage(lang());
}
function addTruck(){
 const name=(prompt(lang()==="ar"?"أدخل اسم أو رقم الشاحنة:":"Entrez le nom ou numéro du camion :")||"").trim().toUpperCase();
 if(!name)return;
 const data=getTrucks(currentCenter());
 if(data.list.some(t=>t.name===name)){alert(lang()==="ar"?"هذه الشاحنة موجودة بالفعل.":"Ce camion existe déjà.");return;}
 data.list.push({id:Date.now().toString(),name});saveTrucks(currentCenter(),data);renderDailyTrucks();truckSummary();
}
function deleteTruck(){
 const data=getTrucks(currentCenter());
 if(!data.list.length){alert(lang()==="ar"?"لا توجد شاحنات.":"Aucun camion.");return;}
 const list=data.list.map((t,i)=>`${i+1}. ${t.name}`).join("\n");
 const n=parseInt(prompt((lang()==="ar"?"أدخل رقم الشاحنة المراد حذفها:\n":"Numéro du camion à supprimer :\n")+list),10)-1;
 if(n<0||n>=data.list.length)return;
 if(!confirm(lang()==="ar"?"هل تريد حذف هذه الشاحنة؟":"Voulez-vous supprimer ce camion ?"))return;
 data.list.splice(n,1);saveTrucks(currentCenter(),data);renderDailyTrucks();truckSummary();
}
function renderDailyTrucks(){
 const data=getTrucks(currentCenter()),date=$("truckDate").value||todayLocal();
 if(!data.list.length){$("truckDailyList").innerHTML='<div class="notice">'+(lang()==="ar"?"لم تتم إضافة أي شاحنة بعد.":"Aucun camion ajouté.")+'</div>';return;}
 $("truckDailyList").innerHTML=data.list.map(t=>{
  const work=data.days[date]?.[t.id]==="work";
  return `<div class="truck-row"><strong>${t.name}</strong><label class="status-toggle"><input type="checkbox" data-truck="${t.id}" ${work?"checked":""}> <span>${work?(lang()==="ar"?"تشتغل":"En marche"):(lang()==="ar"?"متوقفة":"À l'arrêt")}</span></label></div>`;
 }).join("");
 document.querySelectorAll("[data-truck]").forEach(cb=>cb.addEventListener("change",()=>{cb.nextElementSibling.textContent=cb.checked?(lang()==="ar"?"تشتغل":"En marche"):(lang()==="ar"?"متوقفة":"À l'arrêt");}));
}
function saveDailyTruckStatus(){
 const date=$("truckDate").value;if(!date){alert("Choisissez la date.");return;}
 const data=getTrucks(currentCenter());data.days[date]={};
 document.querySelectorAll("[data-truck]").forEach(cb=>data.days[date][cb.dataset.truck]=cb.checked?"work":"stop");
 saveTrucks(currentCenter(),data);truckSummary();alert(lang()==="ar"?"تم حفظ حالة الشاحنات لهذا اليوم.":"État des camions enregistré pour cette journée.");
}
function truckSummary(){
 const data=getTrucks(currentCenter()),from=$("truckFrom")?.value,to=$("truckTo")?.value;
 if(!from||!to||from>to){if($("truckSummary"))$("truckSummary").innerHTML="";return;}
 const dates=Object.keys(data.days).filter(d=>d>=from&&d<=to);
 const rows=data.list.map(t=>{
  let work=0,stop=0;
  dates.forEach(d=>{const s=data.days[d]?.[t.id];if(s==="work")work++;if(s==="stop")stop++;});
  return `<tr><td><strong>${t.name}</strong></td><td>${work}</td><td>${stop}</td><td>${work+stop}</td></tr>`;
 }).join("");
 $("truckSummary").innerHTML=`<div class="summary-table"><table><thead><tr><th>Camion</th><th>Jours travaillés</th><th>Jours à l'arrêt</th><th>Jours enregistrés</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Aucun camion</td></tr>'}</tbody></table></div>`;
}

window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
