# Shadab Restaurant — Ordering Website

A premium, single-page ordering site for Shadab Restaurant: gold-on-black
"royal menu" styling inspired by your poster, iOS-style glass panels, spring
animations, dark/light mode, mobile OTP login, a slide-in cart, and a full
admin dashboard.

## How to open it
Just open `index.html` in any modern browser (double-click it, or drag it
into Chrome/Safari/Edge). No installation, build step, or server required.

To host it live, upload the whole folder to any static host (Netlify,
Vercel, GitHub Pages, or your own hosting) — it's plain HTML/CSS/JS.

## What's inside
```
shadab/
├── index.html      → page structure, all views/modals
├── css/style.css    → the full design system (tokens, layout, animation)
├── js/app.js        → all app logic and data handling
└── README.md
```

## Features
- **Smooth, scoped interactions** — tapping Add or adjusting a quantity now
  updates just that one card, not the whole page, and the mobile
  "flash/highlight" some browsers show on tap has been switched off
  everywhere, so every tap feels like a native app button, not a link.
- **Header search** — tap the search icon for live suggestions as you type
  (matched by name, category, or description), with a clear "No items
  found" message when nothing matches. Tapping a result opens that dish's
  detail view.
- **Rotating banner carousel** at the top of the home page — your 3 festival
  banners auto-advance every few seconds with a smooth slide animation,
  correctly framed (no more cropped titles), plus swipe support and
  dots/arrows.
- **Real dish photos**, a truthful non-veg indicator, and a short
  description under each name — filling the card out the way Swiggy/
  Zomato-style listings do, without inventing fake ratings or reviews.
- **Tap any dish to learn more** — opens a detail view with a larger photo,
  description, price, and its own quantity control before adding to cart.
- **Menu** — organised into sections (Buckets, Biryani, Fry, Curry), each
  sorted highest-price-first.
- **Live countdown** — the strip under the header counts down to the
  closing time in real time, with a **3-minute grace window** after it
  passes before ordering fully locks.
- **Cart** — slides in from the right with a live badge; each line shows a
  thumbnail and stays aligned on any screen size.
- **Tree-line (☰) menu** — Home, Log in / My Account, My Orders, Cart,
  Admin Site, and Log out (with a confirmation prompt).
- **Full account system** — create an account (username, mobile, email,
  password with a live strength meter), verify by a 6-digit email code,
  then log in anytime with mobile *or* email + password. Includes
  **Forgot password** (email OTP → set a new password or skip).
- **My Account (Profile)** — name, phone, member-since date, inline name edit.
- **My Orders** — every order the signed-in customer has placed, with status.
- **Admin Site** (menu → *Admin Site*) — redesigned dashboard:
  - Shows **who's currently signed in** (name + phone) right at the top.
  - Tabs are laid out in a clean grid — no more overflow or cut-off pills.
  - **All Orders** — search by name, phone, or order ID; **Copy order
    list**, **Copy order IDs**, and **Clear all orders** (confirmation,
    then a cancellable 7-second countdown before it actually clears).
  - **Verify Orders** — search plus a date picker, tick **Delivered**
    per order.
  - **Menu** — add/edit/remove dishes (name, price, category, note,
    description, photo upload, icon), live. "Restore original menu" undoes
    all customisations.
  - **Settings** — closing time and admin password (with show/hide 👁).
- **Dark / light mode** toggle, remembered between visits.
- **Automatic 12-hour order cleanup** to keep local storage light.
- **Back button / swipe-back support** — on mobile, pressing back (or
  swiping back) closes whatever's open (menu, cart, search, any modal)
  instead of leaving the page. With nothing open, back/forward moves
  between Home, My Orders, My Account and Admin like a native app.

**Default admin password:** `Shadab@2026` — change it from **Admin Site →
Settings → Change admin password** once you're in.

**A note on "who's currently admin"** — this build uses one shared admin
password rather than individual admin accounts, so there's no separate
"admin identity" to show. What the dashboard shows instead is which
*customer account* (name + phone) is signed in on that device, since
that's the only real identity the site tracks.

## About the images
Your 9 dish photos are in `images/menu/`, named to match each item
(e.g. `dumbucket-chicken.jpg`, `biryani-curry.jpg`), and your 3 banners are
in `images/banners/` as `banner1.jpg`, `banner2.jpg`, `banner3.jpg`. All
were resized and compressed for fast loading. If you add a new dish from
the admin Menu tab, you can upload a photo for it right there — no need to
touch any files, it's stored securely in the browser.

## Important — how the data works now
Accounts, email verification codes, login, and "forgot password" are now
handled by a **real backend** (see the separate `shadab-backend` folder):
- Signup/reset codes are sent as **real emails** through Gmail — nothing
  is shown on-screen anymore.
- Passwords are **hashed** and stored in a real database, not in the browser.
- The admin dashboard password is checked on the server, not read out of
  this page's source code.
- Orders are stored server-side too, so the admin dashboard can show every
  customer's order from any device, once the backend is deployed.

**Before this works, you must deploy the backend and connect it:**
1. Follow `shadab-backend/README.md` to deploy it to Render (free tier)
   and set up Gmail sending.
2. Open `js/api.js` in this folder and set `API_BASE_URL` to your
   deployed backend's URL.
3. Re-host this `shadab` folder (Netlify, Vercel, GitHub Pages, or your
   own hosting) — it's still plain HTML/CSS/JS, no build step.

Until step 2 is done, signup/login/forgot-password/admin-login will show
a clear "Backend not connected yet" message instead of failing silently.

Cart contents and dark/light mode preference still live in the browser
(that's normal and fine for those — no account needed to browse the menu
or hold items in a cart before checkout).
