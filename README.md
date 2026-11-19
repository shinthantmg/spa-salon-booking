# Lotus Spa Bangkok: Spa Salon Booking Website

A spa salon website where customers can browse treatments and book an appointment online.
Built by **Shin Thant Maung** (ICT, Rangsit University) as a portfolio project.

> Lotus Spa Bangkok is a made-up salon. The address, phone number and email are sample content.

## Features

- **4 pages:** Home, Services, Booking and Contact
- **Service menu** with category filters (Massage, Facial, Body, Nails, Packages)
- **Online booking:**
  - choose a treatment, a date (up to 60 days ahead) and a free time slot
  - time slots are calculated from opening hours and treatment length
  - fully booked and past times are disabled
  - live booking summary with the total price
  - form checking (name, Thai phone number, email)
  - confirmation pop-up with a booking code
  - "My upcoming bookings" list with cancel
- **Responsive design** that works on phones, tablets and laptops
- **No frameworks:** plain HTML, CSS and JavaScript

## Built with

HTML5 · CSS3 (Grid, Flexbox, media queries) · JavaScript (ES6) · localStorage

## Project structure

```
spa-salon-booking/
├── index.html      Home page
├── services.html   Full service menu with filters
├── booking.html    Booking form
├── contact.html    Address, opening hours and contact form
├── css/
│   └── style.css   Styles for every page
└── js/
    ├── data.js     Salon info and the list of services (edit prices here)
    ├── main.js     Header, footer, mobile menu and service lists
    └── booking.js  Booking logic: time slots, form checking, saving
```

## How to run it

Open `index.html` in any web browser. Nothing needs to be installed.

## How bookings are saved

Bookings are saved in the browser's **localStorage**, so they stay after a refresh but only on the same device.
Some time slots are shown as already booked to make the demo look like a real, busy salon (see `demoBusy()` in `booking.js`).

## Next steps

- [ ] Save bookings in a real database (for example Firebase or Supabase)
- [ ] Admin page for the salon to see all bookings
- [ ] Email or LINE confirmation messages
- [ ] Thai language version
