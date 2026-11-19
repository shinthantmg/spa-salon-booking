// ============================================================
// booking.js — everything on the Booking page.
//
// How it works:
// 1. The customer picks a service, a date and a free time.
// 2. They type their name and phone number.
// 3. We check the form, save the booking and show a confirmation.
//
// Bookings are saved in the browser's localStorage, so they stay
// after a refresh but only on this one device. Later we can replace
// loadBookings() / saveBookings() with a real database.
// ============================================================

const STORAGE_KEY = "lotus-bookings";
const THERAPISTS = 2; // how many customers can be served at the same time

// ---------- Small helpers ----------
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const toMinutes = time => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
const toTime = mins => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const findService = id => SERVICES.find(s => s.id === id);

function niceDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// ---------- Saving and loading ----------
function loadBookings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveBookings(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch { /* storage blocked: the booking still shows until the page closes */ }
}
let bookings = loadBookings();

// Demo only: pretend some other customers have already booked,
// so the time grid looks like a real, busy salon. The same date
// always gives the same busy times. Remove this when using a real database.
function demoBusy(date) {
  let seed = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const busy = [];
  for (let t = SALON.openHour * 60; t < SALON.closeHour * 60; t += 60) {
    if (rand() < 0.25) busy.push({ date, start: t, end: t + 60 }, { date, start: t, end: t + 60 });
  }
  return busy;
}

// ---------- Time slots ----------
// A slot is free if fewer than THERAPISTS bookings overlap it
function freeSlots(date, minutes) {
  const taken = [
    ...demoBusy(date),
    ...bookings.filter(b => b.date === date).map(b => ({ start: toMinutes(b.time), end: toMinutes(b.time) + b.min }))
  ];
  const now = new Date();
  const isToday = date === isoDate(now);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let start = SALON.openHour * 60; start + minutes <= SALON.closeHour * 60; start += SALON.slotMinutes) {
    const end = start + minutes;
    const overlapping = taken.filter(t => t.start < end && start < t.end).length;
    const past = isToday && start <= nowMins;
    slots.push({ time: toTime(start), free: !past && overlapping < THERAPISTS });
  }
  return slots;
}

// ---------- The form ----------
const form = $("booking-form");
const state = { service: "", date: "", time: "" };

function fillServiceSelect() {
  const cats = [...new Set(SERVICES.map(s => s.cat))];
  $("service").innerHTML = `<option value="">Choose a treatment</option>` + cats.map(c =>
    `<optgroup label="${c}">${SERVICES.filter(s => s.cat === c).map(s =>
      `<option value="${s.id}">${s.name} (${s.min} min) · ${baht(s.price)}</option>`).join("")}</optgroup>`
  ).join("");

  // If the link was booking.html?service=thai-60, pick that service
  const fromLink = new URLSearchParams(location.search).get("service");
  if (findService(fromLink)) state.service = fromLink;
  $("service").value = state.service;
}

function setUpDate() {
  const today = new Date();
  const max = new Date(); max.setDate(max.getDate() + 60);
  $("date").min = isoDate(today);
  $("date").max = isoDate(max);

  // If the salon is already closed today, start with tomorrow
  if (today.getHours() >= SALON.closeHour - 1) today.setDate(today.getDate() + 1);
  state.date = isoDate(today);
  $("date").value = state.date;
}

function drawSlots() {
  const box = $("slots");
  const s = findService(state.service);
  if (!s || !state.date) {
    box.innerHTML = "";
    $("slot-hint").textContent = "Choose a treatment and date to see free times.";
    return;
  }
  const slots = freeSlots(state.date, s.min);
  // If the chosen time is no longer free, clear it
  if (!slots.some(x => x.time === state.time && x.free)) state.time = "";

  box.innerHTML = slots.map(x =>
    `<button type="button" class="slot" data-time="${x.time}" aria-pressed="${x.time === state.time}" ${x.free ? "" : "disabled"}>${x.time}</button>`
  ).join("");

  const count = slots.filter(x => x.free).length;
  $("slot-hint").textContent = count
    ? `${count} times free. Crossed-out times are fully booked.`
    : "Sorry, this day is fully booked. Please try another date.";
}

function drawSummary() {
  const s = findService(state.service);
  $("sum-service").textContent = s ? s.name : "Not chosen";
  $("sum-length").textContent = s ? `${s.min} minutes` : "-";
  $("sum-date").textContent = state.date ? niceDate(state.date) : "-";
  $("sum-time").textContent = state.time ? `${state.time} to ${toTime(toMinutes(state.time) + s.min)}` : "-";
  $("sum-total").textContent = s ? baht(s.price) : "฿0";
}

function refresh() { drawSlots(); drawSummary(); }

// ---------- Checking the form ----------
function check() {
  const errors = {};
  const name = $("name").value.trim();
  const phone = $("phone").value.replace(/[\s-]/g, "");
  const email = $("email").value.trim();

  if (!state.service) errors.service = "Please choose a treatment.";
  if (!state.date) errors.date = "Please choose a date.";
  if (!state.time) errors.time = "Please choose a time.";
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!/^(\+66|0)\d{8,9}$/.test(phone)) errors.phone = "Please enter a Thai phone number, e.g. 081-234-5678.";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "This email doesn't look right.";

  ["service", "date", "time", "name", "phone", "email"].forEach(k => {
    $(`err-${k}`).textContent = errors[k] || "";
  });
  return Object.keys(errors).length === 0;
}

// ---------- My bookings list ----------
function drawMyBookings() {
  const list = $("my-bookings");
  const upcoming = bookings
    .filter(b => b.date >= isoDate(new Date()))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (!upcoming.length) {
    list.innerHTML = `<li class="empty">You have no upcoming bookings yet.</li>`;
    return;
  }
  list.innerHTML = upcoming.map(b => `
    <li>
      <div>
        <div class="when">${niceDate(b.date)} at ${b.time}</div>
        <div class="what">${b.serviceName} · ${b.min} min · ${baht(b.price)} · Code ${b.code}</div>
      </div>
      <button type="button" class="btn outline small" data-cancel="${b.code}">Cancel</button>
    </li>`).join("");
}

// Cancel needs two clicks so nobody cancels by mistake
$("my-bookings").addEventListener("click", e => {
  const btn = e.target.closest("button[data-cancel]");
  if (!btn) return;
  if (btn.dataset.sure !== "yes") {
    btn.dataset.sure = "yes";
    btn.textContent = "Click again to cancel";
    return;
  }
  bookings = bookings.filter(b => b.code !== btn.dataset.cancel);
  saveBookings(bookings);
  drawMyBookings();
  refresh();
});

// ---------- Events ----------
$("service").addEventListener("change", e => { state.service = e.target.value; refresh(); });
$("date").addEventListener("change", e => { state.date = e.target.value; refresh(); });
$("slots").addEventListener("click", e => {
  const b = e.target.closest("button.slot");
  if (!b || b.disabled) return;
  state.time = b.dataset.time;
  refresh();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  if (!check()) return;

  const s = findService(state.service);
  const booking = {
    code: "LS" + Date.now().toString(36).toUpperCase().slice(-6),
    serviceId: s.id, serviceName: s.name, min: s.min, price: s.price,
    date: state.date, time: state.time,
    name: $("name").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    notes: $("notes").value.trim(),
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  saveBookings(bookings);

  $("confirm-text").innerHTML =
    `${booking.name}, your <b>${s.name}</b> is booked for <b>${niceDate(booking.date)} at ${booking.time}</b>.<br>
     Your booking code is <span class="code">${booking.code}</span>.`;
  $("dialog").classList.add("open");
  $("close-dialog").focus();

  form.reset();
  state.time = "";
  $("service").value = state.service;
  $("date").value = state.date;
  refresh();
  drawMyBookings();
});

$("close-dialog").addEventListener("click", () => $("dialog").classList.remove("open"));
$("dialog").addEventListener("click", e => { if (e.target.id === "dialog") $("dialog").classList.remove("open"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("dialog").classList.remove("open"); });

// ---------- Start ----------
fillServiceSelect();
setUpDate();
refresh();
drawMyBookings();
