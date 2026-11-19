// ============================================================
// main.js — runs on every page.
// 1. Adds the same header and footer to every page
// 2. Makes the mobile menu button work
// 3. Draws the service cards / menu where the page asks for them
// ============================================================

// The lotus logo, drawn with SVG so it needs no image file
const LOTUS_SVG = `
<svg viewBox="0 0 40 40" aria-hidden="true">
  <path d="M20 6c4 5 4 13 0 20-4-7-4-15 0-20z" fill="#1f4d3f"/>
  <path d="M20 26c-2-7-7-12-14-13 0 8 6 13 14 13z" fill="#4f8a6f"/>
  <path d="M20 26c2-7 7-12 14-13 0 8-6 13-14 13z" fill="#4f8a6f"/>
  <path d="M6 30h28" stroke="#e07a5f" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

// Pages in the menu: [file name, label]
const PAGES = [
  ["index.html", "Home"],
  ["services.html", "Services"],
  ["contact.html", "Contact"]
];

function renderHeader() {
  const here = location.pathname.split("/").pop() || "index.html";
  const links = PAGES.map(([file, label]) =>
    `<li><a href="${file}" class="${file === here ? "active" : ""}">${label}</a></li>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <div class="wrap">
      <a class="logo" href="index.html">${LOTUS_SVG}${SALON.name}</a>
      <button class="menu-btn" id="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav">☰</button>
      <ul class="nav" id="nav">
        ${links}
        <li><a class="btn" href="booking.html">Book now</a></li>
      </ul>
    </div>`;

  // Mobile menu: show / hide the links when the button is pressed
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
}

function renderFooter() {
  const year = new Date().getFullYear();
  document.getElementById("site-footer").innerHTML = `
    <div class="wrap">
      <div>
        <h3>${SALON.name}</h3>
        <p>Thai massage, facials and body treatments in the heart of Sukhumvit.</p>
      </div>
      <div>
        <h3>Visit us</h3>
        <p>${SALON.address}<br>Open daily ${SALON.openHour}:00 to ${SALON.closeHour}:00</p>
      </div>
      <div>
        <h3>Contact</h3>
        <p>Phone: ${SALON.phone}<br>Email: <a href="mailto:${SALON.email}">${SALON.email}</a></p>
      </div>
      <p class="bottom">© ${year} ${SALON.name}. Portfolio project by Shin Thant Maung. Salon details are sample content.</p>
    </div>`;
}

// One service card (used on the home page)
function serviceCard(s) {
  return `
    <article class="card">
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="meta">
        <span class="mins">${s.min} min</span>
        <span class="price">${baht(s.price)}</span>
      </div>
      <a class="btn outline small" href="booking.html?service=${s.id}">Book this</a>
    </article>`;
}

// Home page: show a few popular services
function renderFeatured() {
  const box = document.getElementById("featured");
  if (!box) return; // this page doesn't have the box
  const picks = ["thai-60", "oil-60", "facial-60"];
  box.innerHTML = SERVICES.filter(s => picks.includes(s.id)).map(serviceCard).join("");
}

// Services page: full menu with category filter buttons
function renderMenu() {
  const list = document.getElementById("menu-list");
  const filters = document.getElementById("filters");
  if (!list || !filters) return;

  const cats = ["All", ...new Set(SERVICES.map(s => s.cat))];
  let current = "All";

  function draw() {
    filters.innerHTML = cats.map(c =>
      `<button class="chip" type="button" data-cat="${c}" aria-pressed="${c === current}">${c}</button>`
    ).join("");

    const shown = SERVICES.filter(s => current === "All" || s.cat === current);
    list.innerHTML = shown.map(s => `
      <li>
        <div>
          <span class="tag">${s.cat} · ${s.min} min</span>
          <h3>${s.name}</h3>
          <p>${s.desc}</p>
        </div>
        <span class="price">${baht(s.price)}</span>
        <a class="btn small" href="booking.html?service=${s.id}">Book</a>
      </li>`).join("");
  }

  filters.addEventListener("click", e => {
    const b = e.target.closest("button[data-cat]");
    if (!b) return;
    current = b.dataset.cat;
    draw();
  });

  draw();
}

renderHeader();
renderFooter();
renderFeatured();
renderMenu();
