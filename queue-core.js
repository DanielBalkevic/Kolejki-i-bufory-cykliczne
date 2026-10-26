/* ASD1-M1-08 — podstawowe algorytmy kolejek. Bez bibliotek zewnętrznych. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.QueueCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function validCapacity(capacity) {
    return Number.isInteger(capacity) && capacity >= 4 && capacity <= 16;
  }
  function validValue(value) {
    return Number.isInteger(value) && value >= -99 && value <= 99;
  }

  class ShiftingQueue {
    constructor(capacity) {
      if (!validCapacity(capacity)) throw new RangeError("Pojemność musi być liczbą całkowitą 4–16.");
      this.capacity = capacity; this.items = []; this.counters = { reads: 0, writes: 0, shifts: 0 };
    }
    get size() { return this.items.length; }
    get isEmpty() { return this.size === 0; }
    get isFull() { return this.size === this.capacity; }
    enqueue(value) {
      if (!validValue(value)) return { ok:false, message:"Wartość musi być liczbą całkowitą od -99 do 99." };
      if (this.isFull) return { ok:false, message:"Kolejka jest pełna — dane nie zostały zmienione." };
      this.items.push(value); this.counters.writes++;
      return { ok:true, message:`Dodano ${value} na końcu kolejki.` };
    }
    dequeue() {
      if (this.isEmpty) return { ok:false, message:"Kolejka jest pusta — nie można usunąć elementu." };
      this.counters.reads++;
      const value = this.items[0];
      for (let i=1; i<this.items.length; i++) {
        this.counters.reads++; this.items[i-1] = this.items[i]; this.counters.writes++; this.counters.shifts++;
      }
      this.items.pop();
      return { ok:true, value, message:`Usunięto ${value}; pozostałe elementy przesunięto w lewo.` };
    }
    peek() { return this.isEmpty ? null : this.items[0]; }
    logical() { return this.items.slice(); }
    physical() { return Array.from({length:this.capacity}, (_,i)=>this.items[i] ?? null); }
    state() { return { type:"shifting", capacity:this.capacity, items:this.logical(), physical:this.physical(), head:this.isEmpty?null:0, tail:this.size, size:this.size, counters:{...this.counters} }; }
  }

  class CircularQueue {
    constructor(capacity) {
      if (!validCapacity(capacity)) throw new RangeError("Pojemność musi być liczbą całkowitą 4–16.");
      this.capacity=capacity; this.buffer=Array(capacity).fill(null);
      this.head=0; this.tail=0; this.size=0;
      this.counters={reads:0,writes:0,shifts:0};
    }
    get isEmpty(){return this.size===0;}
    get isFull(){return this.size===this.capacity;}
    enqueue(value){
      if(!validValue(value)) return {ok:false,message:"Wartość musi być liczbą całkowitą od -99 do 99."};
      if(this.isFull) return {ok:false,message:"Kolejka jest pełna — dane nie zostały zmienione."};
      this.buffer[this.tail]=value; this.counters.writes++;
      this.tail=(this.tail+1)%this.capacity; this.size++;
      return {ok:true,message:`Dodano ${value}; tail przesunął się na ${this.tail}.`};
    }
    dequeue(){
      if(this.isEmpty) return {ok:false,message:"Kolejka jest pusta — nie można usunąć elementu."};
      const value=this.buffer[this.head]; this.counters.reads++;
      this.buffer[this.head]=null; this.head=(this.head+1)%this.capacity; this.size--;
      return {ok:true,value,message:`Usunięto ${value}; head przesunął się na ${this.head}.`};
    }
    peek(){return this.isEmpty?null:this.buffer[this.head];}
    logical(){return Array.from({length:this.size},(_,i)=>this.buffer[(this.head+i)%this.capacity]);}
    physical(){return this.buffer.slice();}
    state(){return {type:"circular",capacity:this.capacity,items:this.logical(),physical:this.physical(),head:this.head,tail:this.tail,size:this.size,counters:{...this.counters}};}
  }

  class Deque {
    constructor(capacity) {
      if(!validCapacity(capacity)) throw new RangeError("Pojemność musi być liczbą całkowitą 4–16.");
      this.capacity=capacity; this.buffer=Array(capacity).fill(null);
      this.head=0; this.tail=0; this.size=0;
      this.counters={reads:0,writes:0,shifts:0};
    }
    get isEmpty(){return this.size===0;}
    get isFull(){return this.size===this.capacity;}
    pushRight(value){
      if(!validValue(value)) return {ok:false,message:"Wartość musi być liczbą całkowitą od -99 do 99."};
      if(this.isFull) return {ok:false,message:"Deque jest pełny — dane nie zostały zmienione."};
      this.buffer[this.tail]=value; this.counters.writes++;
      this.tail=(this.tail+1)%this.capacity; this.size++;
      return {ok:true,message:`Dodano ${value} z prawej strony.`};
    }
    pushLeft(value){
      if(!validValue(value)) return {ok:false,message:"Wartość musi być liczbą całkowitą od -99 do 99."};
      if(this.isFull) return {ok:false,message:"Deque jest pełny — dane nie zostały zmienione."};
      this.head=(this.head-1+this.capacity)%this.capacity; this.buffer[this.head]=value; this.counters.writes++; this.size++;
      return {ok:true,message:`Dodano ${value} z lewej strony; head=${this.head}.`};
    }
    popLeft(){
      if(this.isEmpty) return {ok:false,message:"Deque jest pusty — nie można usunąć elementu."};
      const value=this.buffer[this.head]; this.counters.reads++; this.buffer[this.head]=null;
      this.head=(this.head+1)%this.capacity; this.size--;
      return {ok:true,value,message:`Usunięto ${value} z lewej strony.`};
    }
    popRight(){
      if(this.isEmpty) return {ok:false,message:"Deque jest pusty — nie można usunąć elementu."};
      this.tail=(this.tail-1+this.capacity)%this.capacity; const value=this.buffer[this.tail];
      this.counters.reads++; this.buffer[this.tail]=null; this.size--;
      return {ok:true,value,message:`Usunięto ${value} z prawej strony.`};
    }
    peek(){return this.isEmpty?null:this.buffer[this.head];}
    logical(){return Array.from({length:this.size},(_,i)=>this.buffer[(this.head+i)%this.capacity]);}
    physical(){return this.buffer.slice();}
    state(){return {type:"deque",capacity:this.capacity,items:this.logical(),physical:this.physical(),head:this.head,tail:this.tail,size:this.size,counters:{...this.counters}};}
  }

  return { ShiftingQueue, CircularQueue, Deque, validCapacity, validValue };
});
