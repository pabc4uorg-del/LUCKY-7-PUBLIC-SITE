
const $=id=>document.getElementById(id);const API_BASE=(window.LUCKY7_API_BASE||"").replace(/\/+$/,"");let activeTier="FREE",activeJob=null,pollTimer=null,cancelRequested=false;
function toast(m,ms=2600){const t=$("toast");t.textContent=m;t.classList.remove("hidden");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.add("hidden"),ms)}
function setPage(id){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll(".bottom button[data-go]").forEach(x=>x.classList.toggle("active",x.dataset.go===id));closeDrawer();scrollTo({top:0,behavior:"smooth"})}
function openDrawer(){$("drawer").classList.add("open");$("scrim").classList.add("show");$("drawer").setAttribute("aria-hidden","false")}function closeDrawer(){$("drawer").classList.remove("open");$("scrim").classList.remove("show");$("drawer").setAttribute("aria-hidden","true")}
function token(){return localStorage.getItem("lucky7_token")||""}function headers(json=true){const h={};if(json)h["Content-Type"]="application/json";if(token())h["Authorization"]="Bearer "+token();return h}
async function api(path,o={}){if(!API_BASE)throw Error("CLOUD_BACKEND_NOT_CONNECTED");const r=await fetch(API_BASE+path,{...o,headers:{...headers(o.body!==undefined),...(o.headers||{})}});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.detail||d.message||("Request failed: "+r.status));return d}
const backendMessage=()=> "The Lucky 7 public interface is live, but the secure analytics backend has not been connected to this website yet.";
const MAX_FIXTURE_FILES=5;
const MAX_TEXT_FILE_BYTES=1024*1024;
const MAX_COMBINED_TEXT_CHARS=1048576;
let uploadedFixtureFiles=[];

function appendFixtureText(text,sourceLabel="TEXT"){
  const incoming=String(text||"").replace(/\r\n?/g,"\n").trim();
  if(!incoming)return false;
  const box=$("fixtures");
  const current=String(box.value||"").trim();
  const combined=current ? current+"\n\n"+incoming : incoming;
  if(combined.length>MAX_COMBINED_TEXT_CHARS){
    toast("Combined fixture text is too large. Maximum is 1 MB.",3600);
    return false;
  }
  box.value=combined;
  box.dispatchEvent(new Event("input",{bubbles:true}));
  return true;
}

function updateUploadStatus(){
  const count=uploadedFixtureFiles.length;
  const countEl=$("uploadCount"),namesEl=$("uploadNames"),status=$("uploadStatus");
  if(countEl)countEl.textContent=`${count} / ${MAX_FIXTURE_FILES} TEXT FILES ADDED`;
  if(namesEl){
    namesEl.textContent=count
      ? uploadedFixtureFiles.map(x=>x.name).join(" • ")
      : "TXT • CSV • TSV • LOG • MD • OTHER PLAIN-TEXT FILES";
  }
  if(status)status.classList.toggle("limit",count>=MAX_FIXTURE_FILES);
}

function isTextLikeFile(file){
  const name=(file?.name||"").toLowerCase();
  const ext=name.includes(".") ? name.split(".").pop() : "";
  const allowedExt=new Set(["txt","csv","tsv","log","md","text","lst","dat"]);
  return Boolean(file && (
    (file.type||"").toLowerCase().startsWith("text/") ||
    allowedExt.has(ext) ||
    !file.type
  ));
}

async function pasteText(){
  try{
    const t=await navigator.clipboard.readText();
    if(!t){toast("Clipboard is empty.");return}
    if(appendFixtureText(t,"PASTE"))toast("Fixture text added to the current input.");
  }catch{
    toast("Clipboard permission blocked. You can paste directly into the fixture box.");
  }
}

function readFileAsText(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result||""));
    r.onerror=()=>reject(new Error("Could not read "+(file.name||"file")));
    r.readAsText(file);
  });
}

async function loadTextFiles(fileList){
  const chosen=Array.from(fileList||[]);
  if(!chosen.length)return;

  const remaining=MAX_FIXTURE_FILES-uploadedFixtureFiles.length;
  if(remaining<=0){
    toast("Maximum 5 fixture text files per input.",3400);
    updateUploadStatus();
    return;
  }

  const accepted=chosen.slice(0,remaining);
  if(chosen.length>remaining){
    toast(`Only ${remaining} more text file${remaining===1?"":"s"} can be added. Maximum is 5.`,3800);
  }

  let added=0;
  for(const file of accepted){
    if(!isTextLikeFile(file)){
      toast(`${file.name}: text files only.`,3200);
      continue;
    }
    if(file.size>MAX_TEXT_FILE_BYTES){
      toast(`${file.name}: maximum 1 MB per text file.`,3400);
      continue;
    }

    const sig=`${file.name}|${file.size}|${file.lastModified}`;
    if(uploadedFixtureFiles.some(x=>x.sig===sig)){
      toast(`${file.name}: already added.`,2800);
      continue;
    }

    try{
      const text=await readFileAsText(file);
      if(!text.trim()){
        toast(`${file.name}: file is empty.`,2800);
        continue;
      }
      if(!appendFixtureText(text,file.name))break;
      uploadedFixtureFiles.push({name:file.name,sig});
      added++;
      updateUploadStatus();
    }catch(err){
      toast(err.message||`Could not read ${file.name}.`,3200);
    }
  }

  if(added){
    toast(`${added} text file${added===1?"":"s"} added. ${uploadedFixtureFiles.length} / 5 used.`,3200);
  }
  const input=$("fixtureFile");
  if(input)input.value="";
}


function clearAllFixtureInput(){
  const box=$("fixtures");
  if(box)box.value="";
  uploadedFixtureFiles=[];
  const fileInput=$("fixtureFile");
  const shotInput=$("screenshotFile");
  if(fileInput)fileInput.value="";
  if(shotInput)shotInput.value="";
  const ocr=$("ocrBox");
  const preview=$("ocrPreview");
  const ocrStatus=$("ocrStatus");
  if(ocr)ocr.classList.add("hidden");
  if(preview){preview.classList.add("hidden");preview.removeAttribute("src")}
  if(ocrStatus)ocrStatus.textContent="Screenshot reader ready.";
  updateUploadStatus();
  toast("Fixture input cleared.");
}

async function readScreenshot(f){
  if(!f)return;
  if(f.size>8388608){toast("Maximum screenshot size is 8 MB.");return}
  const p=$("ocrPreview"),s=$("ocrStatus");
  $("ocrBox").classList.remove("hidden");
  p.classList.remove("hidden");
  p.src=URL.createObjectURL(f);
  s.textContent="Reading screenshot…";
  if(!window.Tesseract){s.textContent="Screenshot reader could not load.";return}
  try{
    const out=await Tesseract.recognize(f,"eng",{logger:m=>{
      if(m.status==="recognizing text")s.textContent=`Reading screenshot… ${Math.round((m.progress||0)*100)}%`
    }});
    const t=(out.data?.text||"").trim();
    if(t){
      if(appendFixtureText(t,"SCREENSHOT")){
        s.textContent="Screenshot text added. Please check it before running.";
        toast("Screenshot text added to the fixture pool.");
      }else{
        s.textContent="Screenshot text was read, but the combined input limit was reached.";
      }
    }else{
      s.textContent="No readable fixture text was found.";
    }
  }catch{
    s.textContent="Screenshot reading failed. Use paste or text upload instead.";
  }
}
function chooseTier(t){activeTier=t;$("freeTierBtn").classList.toggle("selectedTier",t==="FREE");$("fullTierBtn").classList.toggle("selectedTier",t==="FULL")}
function showLoader(){cancelRequested=false;$("analysisLoader").classList.remove("hidden");updateLoader({stage:"Reading fixtures",processed:0,total:0,teams_checked:0,sources_ok:0,elapsed_seconds:0})}function hideLoader(){$("analysisLoader").classList.add("hidden")}
function updateLoader(j){const total=Math.max(1,+j.total||0),processed=+j.processed||0,pct=j.status==="COMPLETE"?100:Math.min(96,Math.max(4,processed/total*100));$("loaderProgress").style.width=pct+"%";$("loaderStage").textContent=j.stage||j.status||"Working";$("loaderFixtures").textContent=`Fixtures processed: ${processed} / ${+j.total||0}`;$("loaderTeams").textContent=`Teams checked: ${+j.teams_checked||0}`;$("loaderSources").textContent=`Sources responding: ${+j.sources_ok||0}`;$("loaderElapsed").textContent=`Elapsed: ${Math.round(+j.elapsed_seconds||0)} sec`}
async function pollJob(id){if(cancelRequested)return;try{const j=await api("/jobs/"+id,{method:"GET"});updateLoader(j);if(j.status==="COMPLETE"){activeJob=null;setTimeout(hideLoader,250);$("runStatus").textContent="Analysis complete.";renderResult(j.result);setPage("results");return}if(["FAILED","CANCELLED"].includes(j.status)){activeJob=null;hideLoader();$("runStatus").textContent=j.status==="CANCELLED"?"Analysis cancelled.":"Analysis failed: "+(j.error||"Unknown error");return}pollTimer=setTimeout(()=>pollJob(id),800)}catch(e){hideLoader();$("runStatus").textContent="Could not read analysis progress: "+e.message}}
function renderResult(r){const b=$("dynamicResults");b.innerHTML="";if(!r){$("resultsSummary").textContent="No result returned.";return}const L=r.lucky7||[],B=r.bonus||[],X=r.xxl||[];$("resultsSummary").textContent=`Lucky 7: ${L.length} • Bonus Set: ${B.length} • XXL: ${X.length}`;if(!L.length&&!B.length&&!X.length){b.innerHTML='<div class="status">No qualifying output was produced. Lucky 7 does not lower data-quality standards just to fill a result.</div>';return}[["LUCKY 7",L],["BONUS SET",B],["XXL",X]].forEach(([n,a])=>{if(!a.length)return;const h=document.createElement("h3");h.textContent=n;h.style.color="#ffd629";b.appendChild(h);a.forEach((x,i)=>{const d=document.createElement("div");d.className="metric";d.innerHTML=`<span>${i+1}. ${(x.home||x.fixture?.home||"Fixture")} ${(x.away||x.fixture?.away)?"vs "+(x.away||x.fixture?.away):""}</span><b>${x.data_quality||x.quality||""}</b>`;b.appendChild(d)})})}
async function runAnalysis(){const text=$("fixtures").value.trim();if(!text){toast("Add fixtures first.");return}if(!API_BASE){showLoader();$("loaderStage").textContent="Secure backend connection required";$("loaderProgress").style.width="18%";setTimeout(()=>{hideLoader();$("runStatus").textContent=backendMessage();toast("Frontend is live; backend connection is the next deployment step.",3500)},650);return}if(!token()){setPage("account");$("accountStatus").textContent="Sign in before running Lucky 7.";return}showLoader();try{const j=await api("/jobs/start",{method:"POST",body:JSON.stringify({text,mode:"LIVE_ANALYTICS",tier:activeTier})});activeJob=j.job_id;pollJob(j.job_id)}catch(e){hideLoader();$("runStatus").textContent=e.message}}
async function cancelRun(){cancelRequested=true;clearTimeout(pollTimer);if(activeJob&&API_BASE){try{await api("/jobs/"+activeJob+"/cancel",{method:"POST"})}catch{}}activeJob=null;hideLoader();$("runStatus").textContent="Analysis cancelled."}
async function register(){if(!API_BASE){$("accountStatus").textContent=backendMessage();return}try{const d=await api("/account/register",{method:"POST",body:JSON.stringify({email:$("email").value,password:$("password").value,display_name:$("displayName").value||null})});localStorage.setItem("lucky7_token",d.token);await refreshAccount();toast("Account created.")}catch(e){$("accountStatus").textContent=e.message}}
async function login(){if(!API_BASE){$("accountStatus").textContent=backendMessage();return}try{const d=await api("/account/login",{method:"POST",body:JSON.stringify({email:$("email").value,password:$("password").value})});localStorage.setItem("lucky7_token",d.token);await refreshAccount();toast("Signed in.")}catch(e){$("accountStatus").textContent=e.message}}
async function refreshAccount(){const t=token();$("accountPill").textContent=t?"ACCOUNT":"SIGN IN";$("signedOut").classList.toggle("hidden",!!t);$("signedIn").classList.toggle("hidden",!t);if(!t||!API_BASE)return;try{const d=await api("/account/me",{method:"GET"});$("accountEmail").textContent=d.account?.email||"Signed in";$("creditBalance").textContent=d.credit_balance??0}catch{localStorage.removeItem("lucky7_token");$("accountPill").textContent="SIGN IN";$("signedOut").classList.remove("hidden");$("signedIn").classList.add("hidden")}}
async function logout(){if(API_BASE&&token()){try{await api("/account/logout",{method:"POST"})}catch{}}localStorage.removeItem("lucky7_token");refreshAccount();toast("Signed out.")}
function setOfflineAccountState(){
  if(API_BASE)return;
  $("backendNotice")?.classList.remove("hidden");
  ["displayName","email","password","registerBtn","loginBtn"].forEach(id=>{const el=$(id);if(el)el.disabled=true;});
  if($("accountStatus"))$("accountStatus").textContent="REAL SIGN-IN WILL ACTIVATE AFTER THE SECURE FASTAPI BACKEND IS DEPLOYED.";
  if($("accountPill"))$("accountPill").textContent="ACCOUNT";
}
function bind(){$("menuBtn").onclick=openDrawer;$("closeDrawer").onclick=closeDrawer;$("scrim").onclick=closeDrawer;$("bellBtn").onclick=()=>toast("No new notifications.");$("accountPill").onclick=()=>setPage("account");document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>setPage(b.dataset.go));$("drawerAdd").onclick=()=>{setPage("home");setTimeout(()=>$("fixtures").focus(),250)};$("pasteBtn").onclick=pasteText;$("uploadBtn").onclick=()=>$("fixtureFile").click();$("screenshotBtn").onclick=()=>$("screenshotFile").click();
$("clearBtn").onclick=clearAllFixtureInput;$("fixtureFile").onchange=e=>loadTextFiles(e.target.files);$("screenshotFile").onchange=e=>readScreenshot(e.target.files[0]);$("freeTierBtn").onclick=()=>chooseTier("FREE");$("fullTierBtn").onclick=()=>chooseTier("FULL");$("runBtn").onclick=runAnalysis;$("cancelAnalysisBtn").onclick=cancelRun;$("registerBtn").onclick=register;$("loginBtn").onclick=login;$("logoutBtn").onclick=logout;$("pipelineBtn").onclick=()=>{$("pipelineStatus").textContent=API_BASE?"Cloud backend configured. Full diagnostics remain private/admin-only.":"Public frontend: online. Analytics backend: not yet connected."};$("backendState").textContent=API_BASE?"CONNECTED":"NOT CONNECTED";if(API_BASE)$("runStatus").textContent="Backend configured. Sign in before running analysis.";refreshAccount();setOfflineAccountState();updateUploadStatus()}
document.addEventListener("DOMContentLoaded",()=>{bind();const target=(location.hash||'').replace('#','');if(['home','results','account','reports','settings','help','about'].includes(target))setPage(target);});
