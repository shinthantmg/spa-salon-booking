// ============================================================
// data.js — all the salon's information lives here.
// Change prices, services or opening hours in this one file
// and every page updates automatically.
// ============================================================

const SALON = {
  name: "Lotus Spa Bangkok",
  phone: "02-555-0123",           // sample number
  email: "hello@lotusspa.example", // sample email
  address: "88 Sukhumvit Soi 24, Khlong Tan, Bangkok 10110", // sample address
  openHour: 10,   // opens 10:00
  closeHour: 21,  // last appointment must END by 21:00
  slotMinutes: 30 // booking times are every 30 minutes
};

// Each service: id (unique), category, name, minutes, price in Thai baht (THB)
const SERVICES = [
  { id: "thai-60",    cat: "Massage", name: "Traditional Thai Massage", min: 60,  price: 600,  desc: "Stretching and pressure-point massage done the classic Thai way, fully clothed." },
  { id: "thai-90",    cat: "Massage", name: "Traditional Thai Massage", min: 90,  price: 850,  desc: "The longer version, with extra time for back, shoulders and legs." },
  { id: "oil-60",     cat: "Massage", name: "Aromatherapy Oil Massage", min: 60,  price: 900,  desc: "Slow, relaxing massage with your choice of lemongrass, lavender or jasmine oil." },
  { id: "foot-45",    cat: "Massage", name: "Foot Reflexology",         min: 45,  price: 450,  desc: "Pressure-point foot massage that helps tired legs after a long day." },
  { id: "hotstone-90",cat: "Massage", name: "Hot Stone Massage",        min: 90,  price: 1400, desc: "Warm basalt stones melt deep muscle tension." },
  { id: "facial-60",  cat: "Facial",  name: "Hydrating Facial",         min: 60,  price: 1100, desc: "Cleanse, exfoliate and a deep moisture mask for dry or tired skin." },
  { id: "facial-75",  cat: "Facial",  name: "Brightening Facial",       min: 75,  price: 1500, desc: "Vitamin C treatment for dull skin and uneven tone." },
  { id: "scrub-45",   cat: "Body",    name: "Coconut Body Scrub",       min: 45,  price: 800,  desc: "Natural coconut and rice scrub that leaves skin soft and smooth." },
  { id: "wrap-60",    cat: "Body",    name: "Herbal Body Wrap",         min: 60,  price: 1000, desc: "Thai herbs and warm towels to detox and relax the whole body." },
  { id: "mani-45",    cat: "Nails",   name: "Classic Manicure",         min: 45,  price: 400,  desc: "Shape, cuticle care and polish." },
  { id: "pedi-60",    cat: "Nails",   name: "Spa Pedicure",             min: 60,  price: 550,  desc: "Foot soak, scrub, massage and polish." },
  { id: "pkg-150",    cat: "Packages",name: "Lotus Half-Day Package",   min: 150, price: 2600, desc: "Body scrub, 90-minute oil massage and a hydrating mini facial." }
];

// Small helper used on several pages: 1400 -> "฿1,400"
function baht(n) {
  return "฿" + n.toLocaleString("en-US");
}
