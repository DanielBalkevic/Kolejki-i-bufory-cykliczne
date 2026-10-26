/* Interfejs edukacyjny. Algorytmy są w queue-core.js. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const names = { shifting:"Kolejka z przesuwaniem", circular:"Kolejka cykliczna", deque:"Deque" };
  let mode = "circular", capacity = 6, structure, operations = [], cursor = 0, timer = null, delay = 900;
  let history = [], lastMessage = "Wybierz scenariusz lub wykonaj operację.";
  const presets = {
    wrap: { title:"Zawijanie indeksów", values:[10,20,30], ops:[["left",null],["left",null],["right",40],["right",50],["right",60]] },
    full: { title:"Pełna kolejka", values:[1,2,3,4], ops:[["right",5]] },
    ends: { title:"Deque — oba końce", values:[20,30], ops:[["pushLeft",10],["pushRight",40],["popRight",null],["popLeft",null]] }
  };
  function create() {
    structure = mode==="shifting" ? new QueueCore.ShiftingQueue(capacity) :
      mode==="deque" ? new QueueCore.Deque(capacity) : new QueueCore.CircularQueue(capacity);
  }
  function snapshot() { return JSON.parse(JSON.stringify(structure.state())); }
  function record(label, result) {
    history.push({label, result, state:snapshot()});
    lastMessage = result.message;
    render();
  }
  function runOperation(op) {
    let result;
    if (mode==="deque") {
      if(op.type==="right" || op.type==="pushRight") result=structure.pushRight(op.value);
      else if(op.type==="pushLeft") result=structure.pushLeft(op.value);
      else if(op.type==="popRight") result=structure.popRight();
      else if(op.type==="popLeft" || op.type==="left" || op.type==="dequeue") result=structure.popLeft();
      else result={ok:false,message:"Nieznana operacja."};
    } else {
      if(op.type==="right" || op.type==="enqueue") result=structure.enqueue(op.value);
      else if(op.type==="left" || op.type==="dequeue") result=structure.dequeue();
      else result={ok:false,message:"Nieznana operacja."};
    }
    record(op.label || operationLabel(op), result);
    return result;
  }
  function operationLabel(op) {
    const map={right:`Dodaj ${op.value} z prawej`,left:"Usuń z lewej",enqueue:`Dodaj ${op.value}`,dequeue:"Usuń z początku",pushLeft:`Dodaj ${op.value} z lewej`,pushRight:`Dodaj ${op.value} z prawej`,popLeft:"Usuń z lewej",popRight:"Usuń z prawej"};
    return map[op.type] || op.type;
  }
  function buildQueueFromInput() {
    const raw=$("#initialValues").value.trim();
    const values=raw ? raw.split(/[,\s]+/).map(Number) : [];
    if(values.some(v=>!QueueCore.validValue(v))) { $("#status").textContent="Błąd: wpisz liczby całkowite od -99 do 99, oddzielone przecinkami lub spacją."; return false; }
    if(values.length>capacity) { $("#status").textContent=`Błąd: ${values.length} liczb przekracza pojemność ${capacity}.`; return false; }
    create(); history=[]; cursor=0; stop();
    for(const value of values) {
      const result = mode==="deque" ? structure.pushRight(value) : structure.enqueue(value);
      if(!result.ok) { $("#status").textContent=result.message; return false; }
    }
    history.push({label:"Stan początkowy",result:{ok:true,message:"Utworzono nowy przebieg."},state:snapshot()});
    lastMessage="Utworzono nowy przebieg z własnych danych.";
    render(); return true;
  }
  function setMode(newMode) {
    mode=newMode; $$(".mode-btn").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===mode)));
    $("#opLeft").textContent=mode==="shifting"?"Usuń z początku":"Usuń z lewej";
    $("#opRight").textContent=mode==="deque"?"Dodaj z prawej":"Dodaj na końcu";
    $("#dequeActions").hidden=mode!=="deque";
    $("#opLeft").hidden=mode==="deque"; $("#opRightPop").hidden=mode!=="deque";
    buildQueueFromInput();
  }
  function render() {
    const s=structure.state();
    $("#modeTitle").textContent=names[mode];
    $("#capacityLabel").textContent=capacity;
    $("#sizeLabel").textContent=s.size;
    $("#headLabel").textContent=s.head===null?"—":s.head;
    $("#tailLabel").textContent=s.tail===null?"—":s.tail;
    $("#status").textContent=lastMessage;
    $("#emptyState").textContent=s.size===0?"TAK":"NIE";
    $("#fullState").textContent=s.size===capacity?"TAK":"NIE";
    $("#logical").innerHTML=s.items.length ? s.items.map((v,i)=>`<span class="item"><small>${i===0?"PIERWSZY":""}</small>${v}</span>`).join("") : '<span class="muted">[ pusta struktura ]</span>';
    $("#physical").innerHTML=s.physical.map((v,i)=>{
      const occupied=v!==null;
      const tags=[];
      if(mode!=="shifting" && s.head===i && s.size>0) tags.push("HEAD");
      if(mode!=="shifting" && s.tail===i) tags.push("TAIL");
      return `<div class="cell ${occupied?"occupied":"empty"}"><b>${v===null?"·":v}</b><small>indeks ${i}</small><em>${tags.join(" / ") || (occupied?"zajęte":"wolne")}</em></div>`;
    }).join("");
    $("#counters").innerHTML=`<div><b>${s.counters.reads}</b><span>odczyty</span></div><div><b>${s.counters.writes}</b><span>zapisy</span></div><div><b>${s.counters.shifts}</b><span>przesunięcia</span></div>`;
    const pseudo=mode==="shifting"
      ? ["Jeśli kolejka pełna: odrzuć","Zapisz nową wartość na końcu","Odczytaj pierwszy element","Przesuń pozostałe elementy w lewo","Zmniejsz rozmiar"]
      : mode==="circular"
      ? ["Jeśli size = capacity: odrzuć","Zapisz pod buffer[tail]","tail = (tail + 1) % capacity","size = size + 1","Przy usuwaniu: head = (head + 1) % capacity"]
      : ["Jeśli size = capacity: odrzuć","Dodawanie z lewej: head = (head - 1 + capacity) % capacity","Dodawanie z prawej: zapis pod tail","Usuwanie z lewej: head = (head + 1) % capacity","Usuwanie z prawej: tail = (tail - 1 + capacity) % capacity"];
    $("#pseudo").innerHTML=pseudo.map((line,i)=>`<li class="${i===highlightLine()? "current":""}">${line}</li>`).join("");
    $("#history").innerHTML=history.slice(-8).reverse().map(h=>`<li><b>${h.label}</b><span>${h.result.ok?"OK":"ODRZUCONO"} — ${h.result.message}</span></li>`).join("") || "<li>Brak operacji.</li>";
    $("#stepCount").textContent=history.length;
    $("#status").className=history.length && history[history.length-1].result.ok===false?"status error":"status";
    $("#questionState").textContent=`Aktualnie: size=${s.size}, pojemność=${capacity}, head=${s.head===null?"—":s.head}, tail=${s.tail===null?"—":s.tail}.`;
  }
  function highlightLine() {
    const last=history[history.length-1];
    if(!last) return 0;
    if(!last.result.ok) return 0;
    if(last.label.toLowerCase().includes("usuń")) return mode==="shifting"?2:4;
    if(last.label.toLowerCase().includes("lewej")) return 1;
    return 1;
  }
  function stop() { if(timer!==null) clearInterval(timer); timer=null; $("#play").textContent="▶ Start"; }
  function play() {
    if(timer!==null) {stop();return;}
    $("#play").textContent="Ⅱ Pauza";
    timer=setInterval(()=>{
      if(cursor>=operations.length){stop();return;}
      runOperation(operations[cursor++]);
      if(cursor>=operations.length) stop();
    },delay);
  }
  function loadPreset(key) {
    const p=presets[key]; stop(); create(); history=[];
    if(key==="wrap") {
      if(mode==="deque") p.values.forEach(v=>structure.pushRight(v));
      else p.values.forEach(v=>structure.enqueue(v));
      operations=[{type:"left",label:"Usuń z lewej"},{type:"left",label:"Usuń z lewej"},{type:"right",value:40,label:"Dodaj 40"},{type:"right",value:50,label:"Dodaj 50"},{type:"right",value:60,label:"Dodaj 60"}];
    } else if(key==="full") {
      for(let i=0;i<capacity;i++) {
        if(mode==="deque") structure.pushRight(i+1);
        else structure.enqueue(i+1);
      }
      operations=[{type:"right",value:5,label:"Spróbuj dodać 5 do pełnej struktury"}];
    } else {
      if(mode==="deque") {structure.pushRight(20);structure.pushRight(30);}
      else {structure.enqueue(20);structure.enqueue(30);}
      operations=[{type:"pushLeft",value:10,label:"Dodaj 10 z lewej"},{type:"pushRight",value:40,label:"Dodaj 40 z prawej"},{type:"popRight",label:"Usuń z prawej"},{type:"popLeft",label:"Usuń z lewej"}];
      if(mode!=="deque") operations=[{type:"left",label:"Usuń z lewej"},{type:"right",value:40,label:"Dodaj 40"}];
    }
    cursor=0; history.push({label:p.title,result:{ok:true,message:`Scenariusz: ${p.title}. Naciśnij Krok lub Start.`},state:snapshot()});
    lastMessage=`Scenariusz „${p.title}” gotowy. Naciśnij Krok lub Start.`;
    render();
  }
  function compare() {
    const rows=[];
    for(const cap of [4,8,16]) {
      for(const type of ["shifting","circular"]) {
        const q=type==="shifting"?new QueueCore.ShiftingQueue(cap):new QueueCore.CircularQueue(cap);
        for(let i=0;i<cap;i++) q.enqueue(i);
        for(let i=0;i<Math.floor(cap/2);i++) q.dequeue();
        for(let i=0;i<Math.floor(cap/2);i++) q.enqueue(90+i);
        const s=q.state(); rows.push({cap,type,size:s.size,reads:s.counters.reads,writes:s.counters.writes,shifts:s.counters.shifts});
      }
    }
    $("#compareRows").innerHTML=rows.map(r=>`<tr><td>${r.cap}</td><td>${r.type==="shifting"?"Przesuwanie":"Cykliczna"}</td><td>${r.size}</td><td>${r.reads}</td><td>${r.writes}</td><td>${r.shifts}</td></tr>`).join("");
    $("#compareNote").textContent="Wyniki pochodzą z wykonania kodu. Liczniki: odczyty i zapisy komórek oraz przesunięcia elementów; nie obejmują renderowania interfejsu.";
  }
  function runQuiz() {
    const q1=$("#quiz1").value, q2=$("#quiz2").value, q3=$("#quiz3").value;
    const answers=[
      q1==="size" ? "1. Dobrze: size rozróżnia pustą i pełną strukturę." : "1. Wskazówka: size przechowuje liczbę elementów.",
      q2==="mod" ? "2. Dobrze: modulo zawija indeks na początek tablicy." : "2. Wskazówka: użyj modulo po dodaniu 1 do indeksu.",
      q3==="reject" ? "3. Dobrze: pełna struktura odrzuca zapis bez nadpisywania danych." : "3. Wskazówka: pełna struktura nie powinna zmieniać danych."
    ];
    $("#quizResults").textContent=answers.join(" ");
  }
  $("#capacity").addEventListener("change",e=>{
    capacity=Number(e.target.value); buildQueueFromInput();
  });
  $$(".mode-btn").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
  $("#applyValues").addEventListener("click",buildQueueFromInput);
  $("#opRight").addEventListener("click",()=>{const v=Number($("#value").value);runOperation({type:"right",value:v});});
  $("#opLeft").addEventListener("click",()=>runOperation({type:"left"}));
  $("#opRightPop").addEventListener("click",()=>runOperation({type:"popRight"}));
  $("#opLeftPush").addEventListener("click",()=>{const v=Number($("#value").value);runOperation({type:"pushLeft",value:v});});
  $("#step").addEventListener("click",()=>{stop();if(cursor<operations.length)runOperation(operations[cursor++]);else lastMessage="Brak kolejnego kroku scenariusza. Możesz wykonać operację ręcznie.";render();});
  $("#play").addEventListener("click",play);
  $("#reset").addEventListener("click",()=>{stop();buildQueueFromInput();operations=[];cursor=0;});
  $("#speed").addEventListener("input",e=>{delay=Number(e.target.value);$("#speedLabel").textContent=`${(delay/1000).toFixed(1)} s`;if(timer!==null){stop();play();}});
  $$(".preset").forEach(b=>b.addEventListener("click",()=>loadPreset(b.dataset.preset)));
  $("#compare").addEventListener("click",compare);
  $("#checkQuiz").addEventListener("click",runQuiz);
  create(); buildQueueFromInput(); compare();
})();