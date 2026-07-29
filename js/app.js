/* =========================================================
   SHADAB RESTAURANT — APP LOGIC
   Front-end only demo: uses localStorage as the data store.
   ========================================================= */
(function(){
  "use strict";

  /* ---------------- ICONS (inline SVG, no external images) ---------------- */
  const ICONS = {
    handi: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20h28l-2.4 15.4A5 5 0 0 1 30.6 40H17.4a5 5 0 0 1-5-4.6L10 20Z"/><path d="M7 20h34"/><path d="M17 20c0-5 3-9 7-9s7 4 7 9"/><path d="M20 6.5c0 1.4-1.2 1.6-1.2 3s1.2 1.6 1.2 3M28 6.5c0 1.4-1.2 1.6-1.2 3s1.2 1.6 1.2 3"/></svg>`,
    plate: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="27" r="13"/><path d="M24 18v18M18 20v14M30 20v14"/><path d="M15 8c0 2-1.4 2.2-1.4 4.2S15 14.4 15 16.4M22 6c0 2-1.4 2.2-1.4 4.2S22 12.4 22 14.4M29 8c0 2-1.4 2.2-1.4 4.2S29 14.4 29 16.4"/></svg>`,
    drumstick: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 30c-4 4-8 5-10 7a3.2 3.2 0 0 0 4.5 4.5c2-2 3-6 7-10"/><path d="M18 30c-4-6-2-14 5-19 6-4.3 13-3 16 2s1 12-5 16.3c-5.5 4-13.6 5-16-.3Z"/></svg>`,
    lollipop: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="17" r="11"/><path d="M24 28v14"/><path d="M19 34h10"/><path d="M17 13c1.5-3 4-4.5 7-4.5"/></svg>`,
  };
  const ICON_KEYS = Object.keys(ICONS);

  /* ---------------- BASE MENU (from restaurant price list) ---------------- */
  const CATEGORY_ORDER = ["Buckets", "Biryani", "Fry", "Curry"];
  const BASE_MENU = [
    { id:"dumbucket-chicken", name:"Chicken Dum Biryani Bucket", note:"", price:480, category:"Buckets", icon:"handi",
      description:"Our signature bucket — layers of fragrant basmati rice slow-cooked on dum with tender chicken, sealed in its own steam for maximum flavour." },
    { id:"dumbucket-medium",  name:"Medium Dum Bucket",          note:"", price:850, category:"Buckets", icon:"handi",
      description:"A larger, family-style portion of our dum biryani — perfect for sharing or a bigger appetite." },
    { id:"biryani-2pc",       name:"Two Piece Biryani",          note:"", price:180, category:"Biryani", icon:"plate",
      description:"Our classic dum biryani served with two well-marinated chicken pieces, sealed and slow-cooked for deep flavour." },
    { id:"biryani-lolipop",   name:"Lolipop Biryani",            note:"", price:210, category:"Biryani", icon:"lollipop",
      description:"Dum biryani paired with tandoor-style chicken lollipops for a little extra bite alongside the classic flavours." },
    { id:"biryani-1pc",       name:"One Piece Biryani",          note:"", price:120, category:"Biryani", icon:"plate",
      description:"A lighter portion of our classic dum biryani with one chicken piece — perfect for a quick, satisfying meal." },
    { id:"biryani-fry",       name:"Fry Biryani",                note:"", price:210, category:"Fry", icon:"plate",
      description:"Dum biryani topped with crispy fried chicken pieces, for those who love a bit of crunch with their rice." },
    { id:"fry-130",           name:"Chicken Fry - 130",          note:"200–250gm", price:130, category:"Fry", icon:"drumstick",
      description:"Crispy, spice-marinated chicken fry, cooked fresh to order — a perfect side or standalone snack." },
    { id:"fry-180",           name:"Chicken Fry - 180",          note:"400–450gm", price:180, category:"Fry", icon:"drumstick",
      description:"A bigger portion of our crispy, spice-marinated chicken fry — cooked fresh to order." },
    { id:"biryani-curry",     name:"Curry Biryani",              note:"", price:210, category:"Curry", icon:"plate",
      description:"Dum biryani served alongside a rich, home-style chicken curry for dipping and drizzling over the rice." },
  ];
  // static product photos, named to match each item's id (see images/menu/)
  BASE_MENU.forEach(item => { item.image = "images/menu/" + item.id + ".jpg"; });

  const DEFAULT_ADMIN_PASSWORD = "Shadab@2026";
  const DEFAULT_CLOSING_TIME = "19:15"; // 7:15 PM
  const GRACE_MS = 3 * 60 * 1000;       // 3-minute grace window after closing time
  const ORDER_RETENTION_MS = 12 * 60 * 60 * 1000; // 12 hours

  /* ---------------- STORAGE HELPERS ---------------- */
  const LS = {
    get(key, fallback){ try{ const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }catch(e){ return fallback; } },
    set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  };

  const store = {
    get theme(){ return LS.get("shadab_theme", "dark"); },
    set theme(v){ LS.set("shadab_theme", v); },

    get cart(){ return LS.get("shadab_cart", {}); },
    set cart(v){ LS.set("shadab_cart", v); },

    get currentUser(){ return LS.get("shadab_current_user", null); },
    set currentUser(v){ LS.set("shadab_current_user", v); },

    get users(){ return LS.get("shadab_users", {}); },
    set users(v){ LS.set("shadab_users", v); },

    get orders(){ return LS.get("shadab_orders", []); },
    set orders(v){ LS.set("shadab_orders", v); },

    get settings(){ return LS.get("shadab_settings", { closingTime: DEFAULT_CLOSING_TIME }); },
    set settings(v){ LS.set("shadab_settings", v); },

    get adminPassword(){ return LS.get("shadab_admin_password", DEFAULT_ADMIN_PASSWORD); },
    set adminPassword(v){ LS.set("shadab_admin_password", v); },

    get adminUnlocked(){ return LS.get("shadab_admin_unlocked", false); },
    set adminUnlocked(v){ LS.set("shadab_admin_unlocked", !!v); },

    // menu customisation
    get menuOverrides(){ return LS.get("shadab_menu_overrides", {}); },   // id -> partial fields
    set menuOverrides(v){ LS.set("shadab_menu_overrides", v); },
    get customItems(){ return LS.get("shadab_custom_items", []); },       // full item objects
    set customItems(v){ LS.set("shadab_custom_items", v); },
    get deletedIds(){ return LS.get("shadab_deleted_ids", []); },
    set deletedIds(v){ LS.set("shadab_deleted_ids", v); },
  };

  /* ---------------- MENU (base + admin customisations, merged live) ---------------- */
  function getMenu(){
    const overrides = store.menuOverrides;
    const custom = store.customItems;
    const deleted = store.deletedIds;
    let items = BASE_MENU.map(item => overrides[item.id] ? { ...item, ...overrides[item.id] } : item);
    items = items.concat(custom);
    return items.filter(i => !deleted.includes(i.id));
  }
  function findItem(id){ return getMenu().find(m => m.id === id); }

  /* Renders a dish's media: an uploaded photo, else a static photo, else the icon.
     If an <img> fails to load, a global error listener (added once, see init())
     swaps it for the icon automatically. */
  function mediaHTML(item){
    const iconKey = ICONS[item.icon] ? item.icon : "plate";
    const src = item.imageData || item.image;
    if(src) return `<img src="${src}" alt="" data-fallback-icon="${iconKey}">`;
    return ICONS[iconKey];
  }
  function wireImageFallback(container){
    container.addEventListener("error", (e)=>{
      const img = e.target;
      if(img.tagName === "IMG" && img.dataset.fallbackIcon){
        img.outerHTML = ICONS[img.dataset.fallbackIcon] || ICONS.plate;
      }
    }, true);
  }

  /* ---------------- housekeeping: auto-clear orders older than 12h ---------------- */
  function purgeOldOrders(){
    const cutoff = Date.now() - ORDER_RETENTION_MS;
    const orders = store.orders;
    const kept = orders.filter(o => (o.timestamp || 0) >= cutoff);
    if(kept.length !== orders.length) store.orders = kept;
  }

  /* ---------------- DOM SHORTCUTS ---------------- */
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const el = {
    body: document.body,
    themeToggle: $("#themeToggle"),
    hamburgerBtn: $("#hamburgerBtn"),
    sideNav: $("#sideNav"),
    navShade: $("#navShade"),
    sideNavClose: $("#sideNavClose"),
    sideNavUserName: $("#sideNavUserName"),
    sideNavUserHint: $("#sideNavUserHint"),
    navAuth: $("#navAuth"),
    navAuthLabel: $("#navAuthLabel"),
    navLogoutItem: $("#navLogoutItem"),
    navLogout: $("#navLogout"),
    navCart: $("#navCart"),

    cartBtn: $("#cartBtn"),
    cartBadge: $("#cartBadge"),
    drawerShade: $("#drawerShade"),
    cartDrawer: $("#cartDrawer"),
    cartCloseBtn: $("#cartCloseBtn"),
    cartItems: $("#cartItems"),
    cartTotal: $("#cartTotal"),
    checkoutBtn: $("#checkoutBtn"),
    cartClosedNote: $("#cartClosedNote"),

    menuList: $("#menuList"),
    heroOrderBtn: $("#heroOrderBtn"),

    orderTimeStrip: $("#orderTimeStrip"),
    orderTimeText: $("#orderTimeText"),
    trustCutoff: $("#trustCutoff"),

    myOrdersList: $("#myOrdersList"),

    profileNameInput: $("#profileNameInput"),
    profileNameEditBtn: $("#profileNameEditBtn"),
    profilePhoneValue: $("#profilePhoneValue"),
    profileSinceValue: $("#profileSinceValue"),
    profileLogoutBtn: $("#profileLogoutBtn"),

    adminGate: $("#adminGate"),
    adminDash: $("#adminDash"),
    adminGateForm: $("#adminGateForm"),
    adminPassword: $("#adminPassword"),
    adminGateError: $("#adminGateError"),
    adminLogoutBtn: $("#adminLogoutBtn"),
    copyOrdersBtn: $("#copyOrdersBtn"),
    allOrdersList: $("#allOrdersList"),
    statOrderCount: $("#statOrderCount"),
    statTotalAmount: $("#statTotalAmount"),
    verifyDateInput: $("#verifyDateInput"),
    verifyOrdersList: $("#verifyOrdersList"),
    closingTimeInput: $("#closingTimeInput"),
    saveClosingTimeBtn: $("#saveClosingTimeBtn"),
    resetClosingTimeBtn: $("#resetClosingTimeBtn"),
    currentClosingLabel: $("#currentClosingLabel"),
    changePasswordForm: $("#changePasswordForm"),
    currentPasswordInput: $("#currentPasswordInput"),
    newPasswordInput: $("#newPasswordInput"),
    confirmPasswordInput: $("#confirmPasswordInput"),
    changePasswordError: $("#changePasswordError"),
    changePasswordSuccess: $("#changePasswordSuccess"),

    menuManageList: $("#menuManageList"),
    addItemBtn: $("#addItemBtn"),
    restoreMenuBtn: $("#restoreMenuBtn"),
    itemForm: $("#itemForm"),
    itemFormTitle: $("#itemFormTitle"),
    itemNameInput: $("#itemNameInput"),
    itemPriceInput: $("#itemPriceInput"),
    itemCategoryInput: $("#itemCategoryInput"),
    itemNoteInput: $("#itemNoteInput"),
    iconChoiceRow: $("#iconChoiceRow"),
    cancelItemFormBtn: $("#cancelItemFormBtn"),
    itemPhotoInput: $("#itemPhotoInput"),
    itemPhotoPreview: $("#itemPhotoPreview"),
    removeItemPhotoBtn: $("#removeItemPhotoBtn"),

    loginShade: $("#loginShade"),
    loginModal: $("#loginModal"),
    loginCloseBtn: $("#loginCloseBtn"),
    loginIdentifier: $("#loginIdentifier"),
    loginPassword: $("#loginPassword"),
    loginError: $("#loginError"),
    loginSubmitBtn: $("#loginSubmitBtn"),
    openForgotBtn: $("#openForgotBtn"),
    loginToSignupBtn: $("#loginToSignupBtn"),

    signupShade: $("#signupShade"),
    signupModal: $("#signupModal"),
    signupCloseBtn: $("#signupCloseBtn"),
    signupStepDetails: $("#signupStepDetails"),
    signupStepVerify: $("#signupStepVerify"),
    signupStepSuccess: $("#signupStepSuccess"),
    signupUsername: $("#signupUsername"),
    signupMobile: $("#signupMobile"),
    signupEmail: $("#signupEmail"),
    signupPassword: $("#signupPassword"),
    signupConfirm: $("#signupConfirm"),
    signupStrengthBar: $("#signupStrengthBar"),
    signupStrengthLabel: $("#signupStrengthLabel"),
    signupError: $("#signupError"),
    signupDetailsBtn: $("#signupDetailsBtn"),
    signupToLoginBtn: $("#signupToLoginBtn"),
    signupEmailEcho: $("#signupEmailEcho"),
    signupEditDetailsBtn: $("#signupEditDetailsBtn"),
    signupOtpBoxes: $$("#signupOtpBoxesWrap .otp-box"),
    signupDemoHint: $("#signupDemoHint"),
    signupVerifyBtn: $("#signupVerifyBtn"),
    signupResendBtn: $("#signupResendBtn"),
    signupSuccessName: $("#signupSuccessName"),
    signupContinueBtn: $("#signupContinueBtn"),

    forgotShade: $("#forgotShade"),
    forgotModal: $("#forgotModal"),
    forgotCloseBtn: $("#forgotCloseBtn"),
    forgotStepEmail: $("#forgotStepEmail"),
    forgotStepOtp: $("#forgotStepOtp"),
    forgotStepNewPass: $("#forgotStepNewPass"),
    forgotStepDone: $("#forgotStepDone"),
    forgotEmail: $("#forgotEmail"),
    forgotEmailError: $("#forgotEmailError"),
    forgotSendBtn: $("#forgotSendBtn"),
    forgotBackToLoginBtn: $("#forgotBackToLoginBtn"),
    forgotEmailEcho: $("#forgotEmailEcho"),
    forgotEditEmailBtn: $("#forgotEditEmailBtn"),
    forgotOtpBoxes: $$("#forgotOtpBoxesWrap .otp-box"),
    forgotDemoHint: $("#forgotDemoHint"),
    forgotVerifyBtn: $("#forgotVerifyBtn"),
    forgotResendBtn: $("#forgotResendBtn"),
    forgotNewPass: $("#forgotNewPass"),
    forgotConfirmPass: $("#forgotConfirmPass"),
    forgotStrengthBar: $("#forgotStrengthBar"),
    forgotStrengthLabel: $("#forgotStrengthLabel"),
    forgotPassError: $("#forgotPassError"),
    forgotSaveBtn: $("#forgotSaveBtn"),
    forgotSkipBtn: $("#forgotSkipBtn"),
    forgotDoneTitle: $("#forgotDoneTitle"),
    forgotDoneMessage: $("#forgotDoneMessage"),
    forgotDoneBtn: $("#forgotDoneBtn"),

    profileEmailValue: $("#profileEmailValue"),

    checkoutShade: $("#checkoutShade"),
    checkoutModal: $("#checkoutModal"),
    checkoutCloseBtn: $("#checkoutCloseBtn"),
    checkoutSummary: $("#checkoutSummary"),
    checkoutAddress: $("#checkoutAddress"),
    confirmOrderBtn: $("#confirmOrderBtn"),

    logoutShade: $("#logoutShade"),
    logoutModal: $("#logoutModal"),
    cancelLogoutBtn: $("#cancelLogoutBtn"),
    confirmLogoutBtn: $("#confirmLogoutBtn"),

    copyOrderIdsBtn: $("#copyOrderIdsBtn"),
    clearOrdersBtn: $("#clearOrdersBtn"),
    clearOrdersShade: $("#clearOrdersShade"),
    clearOrdersModal: $("#clearOrdersModal"),
    clearOrdersCountdownText: $("#clearOrdersCountdownText"),
    cancelClearOrdersBtn: $("#cancelClearOrdersBtn"),
    itemDescInput: $("#itemDescInput"),
    adminWhoami: $("#adminWhoami"),
    adminWhoamiText: $("#adminWhoamiText"),
    ordersSearchInput: $("#ordersSearchInput"),
    verifySearchInput: $("#verifySearchInput"),

    searchToggleBtn: $("#searchToggleBtn"),
    searchPanel: $("#searchPanel"),
    searchInput: $("#searchInput"),
    searchCloseBtn: $("#searchCloseBtn"),
    searchResults: $("#searchResults"),

    bannerCarousel: $("#bannerCarousel"),
    bannerTrack: $("#bannerTrack"),
    bannerDots: $("#bannerDots"),
    bannerPrev: $("#bannerPrev"),
    bannerNext: $("#bannerNext"),

    itemDetailShade: $("#itemDetailShade"),
    itemDetailModal: $("#itemDetailModal"),
    itemDetailCloseBtn: $("#itemDetailCloseBtn"),
    itemDetailMedia: $("#itemDetailMedia"),
    itemDetailCategory: $("#itemDetailCategory"),
    itemDetailName: $("#itemDetailName"),
    itemDetailDesc: $("#itemDetailDesc"),
    itemDetailPrice: $("#itemDetailPrice"),
    itemDetailQty: $("#itemDetailQty"),
    itemDetailMinus: $("#itemDetailMinus"),
    itemDetailPlus: $("#itemDetailPlus"),
    itemDetailAddBtn: $("#itemDetailAddBtn"),

    toast: $("#toast"),
  };

  let toastTimer = null;
  let editingItemId = null;       // null = adding new, else editing this id
  let selectedIconKey = ICON_KEYS[0];
  let pendingImageData = null;    // base64 photo for the item being added/edited

  /* =========================================================
     TOAST
     ========================================================= */
  function showToast(msg){
    el.toast.textContent = msg;
    el.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> el.toast.classList.remove("is-visible"), 2600);
  }

  /* =========================================================
     THEME
     ========================================================= */
  function applyTheme(theme){
    el.body.setAttribute("data-theme", theme);
    store.theme = theme;
  }
  el.themeToggle.addEventListener("click", ()=>{
    const next = el.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });
  applyTheme(store.theme);

  /* =========================================================
     PASSWORD SHOW/HIDE
     ========================================================= */
  $$(".pwd-eye").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const input = document.getElementById(btn.dataset.target);
      if(!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "🙈" : "👁";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  /* =========================================================
     BACK-BUTTON / SWIPE-BACK SUPPORT
     Every overlay (side nav, cart, modals) pushes a history entry when it
     opens. Pressing the hardware/on-screen back button — or swiping back
     on mobile — fires 'popstate', which this closes the topmost overlay
     instead of leaving the page. With nothing open, it falls back to
     normal in-app view navigation (home/orders/profile/admin).
     ========================================================= */
  const VALID_VIEWS = ["home","orders","profile","admin"];
  const overlayStack = [];
  function registerOverlay(name, closeFn){
    overlayStack.push({ name, closeFn });
    history.pushState({ shadabOverlay: name }, "", location.href);
  }
  function unregisterOverlay(name){
    const idx = overlayStack.findIndex(o => o.name === name);
    if(idx !== -1) overlayStack.splice(idx, 1);
  }
  window.addEventListener("popstate", ()=>{
    if(overlayStack.length > 0){
      const top = overlayStack.pop();
      top.closeFn();
    } else {
      const hash = location.hash.replace("#","");
      showView(VALID_VIEWS.includes(hash) ? hash : "home");
    }
  });

  /* =========================================================
     SIDE NAV (tree-line menu)
     ========================================================= */
  function openNav(){
    el.sideNav.classList.add("is-open");
    el.navShade.classList.add("is-open");
    el.hamburgerBtn.setAttribute("aria-expanded","true");
    registerOverlay("nav", closeNav);
  }
  function closeNav(){
    el.sideNav.classList.remove("is-open");
    el.navShade.classList.remove("is-open");
    el.hamburgerBtn.setAttribute("aria-expanded","false");
    unregisterOverlay("nav");
  }
  el.hamburgerBtn.addEventListener("click", ()=>{
    el.sideNav.classList.contains("is-open") ? closeNav() : openNav();
  });
  el.sideNavClose.addEventListener("click", closeNav);
  el.navShade.addEventListener("click", closeNav);

  /* =========================================================
     VIEW ROUTER
     ========================================================= */
  function showView(name){
    $$(".view").forEach(v => v.hidden = v.dataset.view !== name);
    $$("[data-nav]").forEach(a => a.classList.toggle("is-active", a.dataset.nav === name));
    window.scrollTo({top:0, behavior:"auto"});
    if(name === "orders") renderMyOrders();
    if(name === "profile") renderProfile();
    if(name === "admin") renderAdmin();
    closeNav();
  }
  function navigateTo(name){
    showView(name);
    history.pushState({ shadabView: name }, "", "#"+name);
  }
  $$("[data-nav]").forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      navigateTo(a.dataset.nav);
    });
  });
  el.heroOrderBtn.addEventListener("click", (e)=>{ e.preventDefault(); document.getElementById("menu").scrollIntoView({behavior:"smooth"}); });

  /* =========================================================
     CLOSING TIME + COUNTDOWN + GRACE PERIOD
     ========================================================= */
  function formatTime12(hhmm){
    const [h,m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    let hr = h % 12; if(hr === 0) hr = 12;
    return `${hr}:${String(m).padStart(2,"0")} ${period}`;
  }
  function formatCountdown(ms){
    const totalSec = Math.max(0, Math.floor(ms/1000));
    const h = Math.floor(totalSec/3600);
    const m = Math.floor((totalSec%3600)/60);
    const s = totalSec%60;
    if(h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${m}:${String(s).padStart(2,"0")}`;
  }
  function getOrderingState(){
    const closing = store.settings.closingTime || DEFAULT_CLOSING_TIME;
    const [ch, cm] = closing.split(":").map(Number);
    const now = new Date();
    const closeDate = new Date(now);
    closeDate.setHours(ch, cm, 0, 0);
    const graceEnd = new Date(closeDate.getTime() + GRACE_MS);
    if(now < closeDate) return { phase:"open", msLeft: closeDate - now, label: formatTime12(closing) };
    if(now < graceEnd)  return { phase:"grace", msLeft: graceEnd - now, label: formatTime12(closing) };
    return { phase:"closed", msLeft: 0, label: formatTime12(closing) };
  }
  function isOrderingOpen(){ return getOrderingState().phase !== "closed"; }

  let lastPhase = null;
  function tick(){
    const state = getOrderingState();
    el.trustCutoff.textContent = state.label + " daily";
    el.currentClosingLabel.textContent = state.label;

    el.orderTimeStrip.classList.toggle("is-closed", state.phase === "closed");
    el.orderTimeStrip.classList.toggle("is-grace", state.phase === "grace");

    if(state.phase === "open"){
      el.orderTimeText.innerHTML = `Ordering closes in <strong>${formatCountdown(state.msLeft)}</strong> (by ${state.label})`;
    } else if(state.phase === "grace"){
      el.orderTimeText.innerHTML = `⏳ Extra time! Order within <strong>${formatCountdown(state.msLeft)}</strong>`;
    } else {
      el.orderTimeText.textContent = `Kitchen closed for today — reopens tomorrow (cut-off ${state.label})`;
    }

    const open = state.phase !== "closed";
    el.checkoutBtn.disabled = !open || cartCount() === 0;
    el.checkoutBtn.textContent = open ? "Place Order" : "Ordering Closed";
    el.cartClosedNote.hidden = open;

    if(state.phase !== lastPhase){
      lastPhase = state.phase;
      renderMenu();
    }
  }

  /* =========================================================
     MENU RENDER + CART
     ========================================================= */
  function cartCount(){
    return Object.values(store.cart).reduce((a,b)=>a+b, 0);
  }
  function cartTotalAmount(cart = store.cart){
    return Object.entries(cart).reduce((sum,[id,qty])=>{
      const item = findItem(id);
      return sum + (item ? item.price*qty : 0);
    },0);
  }
  function setQty(id, qty){
    const cart = store.cart;
    const wasZero = !cart[id];
    if(qty <= 0) delete cart[id]; else cart[id] = qty;
    store.cart = cart;
    const nowZero = !cart[id];
    // only a full rebuild changes a card between "Add" and "stepper" layouts;
    // everything else patches in place so a single tap doesn't reflow the page.
    if(wasZero !== nowZero) renderMenu(); else patchDishCardAction(id);
    renderCart();
    el.checkoutBtn.disabled = !isOrderingOpen() || cartCount() === 0;
  }

  function dishActionHTML(item, open){
    const qty = store.cart[item.id] || 0;
    if(!open && qty === 0) return `<button class="addbtn is-closed-pill" disabled>Closed</button>`;
    if(qty > 0) return `
      <div class="stepper">
        <button class="qty-minus" aria-label="Decrease quantity">−</button>
        <span class="stepper__count">${qty}</span>
        <button class="qty-plus" aria-label="Increase quantity" ${!open ? "disabled":""}>+</button>
      </div>`;
    return `<button class="addbtn">Add</button>`;
  }
  function wireDishCardActions(row, id){
    const add = $(".addbtn:not([disabled])", row);
    if(add) add.addEventListener("click", ()=> setQty(id, 1));
    const minus = $(".qty-minus", row);
    const plus = $(".qty-plus", row);
    if(minus) minus.addEventListener("click", ()=> setQty(id, (store.cart[id]||0) - 1));
    if(plus && !plus.disabled) plus.addEventListener("click", ()=> setQty(id, (store.cart[id]||0) + 1));
  }
  function patchDishCardAction(id){
    const row = el.menuList.querySelector(`.dish-card[data-id="${id}"]`);
    if(!row){ renderMenu(); return; }
    const item = findItem(id);
    const bottom = $(".dish-card__bottom", row);
    bottom.innerHTML = `<span class="dish-card__price">₹${item.price}/-</span>${dishActionHTML(item, isOrderingOpen())}`;
    wireDishCardActions(row, id);
  }

  function renderMenu(){
    const open = isOrderingOpen();
    el.menuList.classList.toggle("is-closed", !open);

    const menu = getMenu();
    const groups = {};
    menu.forEach(item=>{
      const cat = item.category || "Other";
      if(!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    const orderedCats = CATEGORY_ORDER.filter(c => groups[c]).concat(Object.keys(groups).filter(c => !CATEGORY_ORDER.includes(c)));

    let cardIdx = 0;
    el.menuList.innerHTML = orderedCats.map(cat=>{
      const items = groups[cat].slice().sort((a,b)=> b.price - a.price);
      const cardsHTML = items.map(item=>{
        const html = `
        <div class="dish-card" data-id="${item.id}" style="animation-delay:${cardIdx*40}ms">
          <div class="dish-card__top">
            <div class="dish-card__media">${mediaHTML(item)}</div>
            <div class="dish-card__title">
              <div class="dish-card__name-row">
                <span class="nonveg-dot" title="Non-vegetarian" aria-hidden="true"></span>
                <p class="dish-card__name">${item.name}</p>
              </div>
              ${item.description ? `<p class="dish-card__desc">${item.description}</p>` : ""}
              ${item.note ? `<span class="dish-card__note">${item.note}</span>` : ""}
            </div>
          </div>
          <div class="dish-card__bottom">
            <span class="dish-card__price">₹${item.price}/-</span>
            ${dishActionHTML(item, open)}
          </div>
        </div>`;
        cardIdx++;
        return html;
      }).join("");
      return `
      <div class="menu-category">
        <div class="menu-category__title">${cat}</div>
        <div class="menu__grid">${cardsHTML}</div>
      </div>`;
    }).join("");

    $$(".dish-card", el.menuList).forEach(row=>{
      const id = row.dataset.id;
      wireDishCardActions(row, id);
      row.addEventListener("click", (e)=>{
        if(e.target.closest(".addbtn, .stepper")) return;
        openItemDetail(id);
      });
    });
  }

  function renderCart(){
    const cart = store.cart;
    const ids = Object.keys(cart);
    const count = cartCount();

    el.cartBadge.textContent = count;
    el.cartBadge.classList.toggle("is-visible", count > 0);

    if(ids.length === 0){
      el.cartItems.innerHTML = `<div class="empty-state"><span>🛒</span>Your cart is empty<br><small>Add something delicious from the menu.</small></div>`;
    } else {
      el.cartItems.innerHTML = ids.map(id=>{
        const item = findItem(id);
        if(!item) return "";
        const qty = cart[id];
        return `
        <div class="cart-line" data-id="${id}">
          <div class="cart-line__top">
            <div class="cart-line__media">${mediaHTML(item)}</div>
            <div class="cart-line__info">
              <div class="cart-line__name">${item.name} ${item.note ? `<span style="color:var(--text-faint);font-weight:400;">(${item.note})</span>`:""}</div>
              <div class="cart-line__price">₹${item.price} × ${qty} = ₹${item.price*qty}</div>
            </div>
            <button class="cart-line__remove" aria-label="Remove item">✕</button>
          </div>
          <div class="cart-line__bottom">
            <div class="stepper">
              <button class="qty-minus" aria-label="Decrease quantity">−</button>
              <span class="stepper__count">${qty}</span>
              <button class="qty-plus" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>`;
      }).join("");

      $$(".cart-line", el.cartItems).forEach(row=>{
        const id = row.dataset.id;
        $(".qty-minus", row).addEventListener("click", ()=> setQty(id, (store.cart[id]||0)-1));
        $(".qty-plus", row).addEventListener("click", ()=> setQty(id, (store.cart[id]||0)+1));
        $(".cart-line__remove", row).addEventListener("click", ()=> setQty(id, 0));
      });
    }
    el.cartTotal.textContent = "₹" + cartTotalAmount();
    if(count>0){ el.cartBadge.classList.add("bump"); setTimeout(()=>el.cartBadge.classList.remove("bump"),400); }
  }

  /* Cart drawer open/close */
  function openCart(){
    el.cartDrawer.classList.add("is-open"); el.drawerShade.classList.add("is-open");
    el.checkoutBtn.disabled = !isOrderingOpen() || cartCount() === 0;
    registerOverlay("cart", closeCart);
  }
  function closeCart(){
    el.cartDrawer.classList.remove("is-open"); el.drawerShade.classList.remove("is-open");
    unregisterOverlay("cart");
  }
  el.cartBtn.addEventListener("click", openCart);
  el.navCart.addEventListener("click", (e)=>{ e.preventDefault(); closeNav(); openCart(); });
  el.cartCloseBtn.addEventListener("click", closeCart);
  el.drawerShade.addEventListener("click", closeCart);

  /* =========================================================
     AUTH — Log in, Create account (with real email verification),
     and Forgot password (real email OTP + reset).
     Talks to the real backend (js/api.js -> Node/Express server)
     which sends actual emails via Gmail and stores accounts with
     hashed passwords in a real database.
     ========================================================= */
  let pendingSignup = null;        // { email } — actual account data lives server-side until verified
  let pendingForgotEmail = null;
  let pendingForgotResetToken = null;

  function normalizeEmail(v){ return (v||"").trim().toLowerCase(); }
  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidMobile(v){ return /^\d{10}$/.test(v); }

  function setBtnLoading(btn, loading, loadingLabel){
    if(!btn) return;
    if(loading){
      btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent;
      btn.textContent = loadingLabel || "Please wait…";
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.originalLabel || btn.textContent;
      btn.disabled = false;
    }
  }

  function passwordStrength(pw){
    if(!pw) return { level:0, label:"", pct:0 };
    if(pw.length < 6) return { level:1, label:"Too short", pct:15 };
    let score = 0;
    if(pw.length >= 8) score++;
    if(pw.length >= 12) score++;
    if(/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if(/\d/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;
    if(score <= 2) return { level:1, label:"Weak", pct:33 };
    if(score <= 3) return { level:2, label:"Moderate", pct:66 };
    return { level:3, label:"Strong", pct:100 };
  }
  function wirePasswordStrength(input, barEl, labelEl){
    input.addEventListener("input", ()=>{
      const s = passwordStrength(input.value);
      barEl.style.width = s.pct + "%";
      barEl.className = "pwd-strength__bar" + (s.level ? " lvl-"+s.level : "");
      labelEl.textContent = s.label;
    });
  }
  function wireOtpBoxes(boxes){
    boxes.forEach((box,i)=>{
      box.addEventListener("input", ()=>{
        box.value = box.value.replace(/\D/g,"").slice(0,1);
        if(box.value && boxes[i+1]) boxes[i+1].focus();
      });
      box.addEventListener("keydown", (e)=>{
        if(e.key === "Backspace" && !box.value && boxes[i-1]) boxes[i-1].focus();
      });
      box.addEventListener("paste", (e)=>{
        const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g,"");
        if(!text) return;
        e.preventDefault();
        text.split("").slice(0, boxes.length).forEach((ch,idx)=>{ if(boxes[idx]) boxes[idx].value = ch; });
        const next = boxes[Math.min(text.length, boxes.length-1)];
        if(next) next.focus();
      });
    });
  }
  function otpValue(boxes){ return boxes.map(b=>b.value).join(""); }
  function clearOtpBoxes(boxes){ boxes.forEach(b=>b.value=""); }
  function setFieldError(node, msg){
    if(!node) return;
    if(msg){ node.textContent = msg; node.hidden = false; } else { node.hidden = true; node.textContent = ""; }
  }

  function updateAuthUI(){
    const user = store.currentUser;
    if(user){
      el.sideNavUserName.textContent = "Welcome, " + user.name.split(" ")[0];
      el.sideNavUserHint.textContent = user.email || user.phone;
      el.navAuthLabel.textContent = "My Account";
      el.navLogoutItem.hidden = false;
    } else {
      el.sideNavUserName.textContent = "Welcome, Guest";
      el.sideNavUserHint.textContent = "Sign in to track your orders";
      el.navAuthLabel.textContent = "Log in / Create account";
      el.navLogoutItem.hidden = true;
    }
  }

  /* ---------- Log in modal ---------- */
  function openLoginModal(){
    resetLoginForm();
    el.loginShade.classList.add("is-open");
    el.loginModal.classList.add("is-open");
    registerOverlay("login", closeLoginModal);
  }
  function closeLoginModal(){
    el.loginShade.classList.remove("is-open");
    el.loginModal.classList.remove("is-open");
    unregisterOverlay("login");
  }
  function resetLoginForm(keepIdentifier){
    if(!keepIdentifier) el.loginIdentifier.value = "";
    el.loginPassword.value = "";
    setFieldError(el.loginError, null);
  }
  const openAuthModal = openLoginModal; // used elsewhere (checkout gate, profile gate)

  /* ---------- Create account modal ---------- */
  function openSignupModal(){
    resetSignupSteps();
    el.signupShade.classList.add("is-open");
    el.signupModal.classList.add("is-open");
    registerOverlay("signup", closeSignupModal);
  }
  function closeSignupModal(){
    el.signupShade.classList.remove("is-open");
    el.signupModal.classList.remove("is-open");
    unregisterOverlay("signup");
  }
  function resetSignupSteps(){
    el.signupStepDetails.hidden = false;
    el.signupStepVerify.hidden = true;
    el.signupStepSuccess.hidden = true;
    el.signupUsername.value = "";
    el.signupMobile.value = "";
    el.signupEmail.value = "";
    el.signupPassword.value = "";
    el.signupConfirm.value = "";
    el.signupStrengthBar.style.width = "0%";
    el.signupStrengthBar.className = "pwd-strength__bar";
    el.signupStrengthLabel.textContent = "";
    setFieldError(el.signupError, null);
    clearOtpBoxes(el.signupOtpBoxes);
  }

  /* ---------- Forgot password modal ---------- */
  function openForgotModal(){
    resetForgotSteps();
    el.forgotShade.classList.add("is-open");
    el.forgotModal.classList.add("is-open");
    registerOverlay("forgot", closeForgotModal);
  }
  function closeForgotModal(){
    el.forgotShade.classList.remove("is-open");
    el.forgotModal.classList.remove("is-open");
    unregisterOverlay("forgot");
  }
  function resetForgotSteps(){
    el.forgotStepEmail.hidden = false;
    el.forgotStepOtp.hidden = true;
    el.forgotStepNewPass.hidden = true;
    el.forgotStepDone.hidden = true;
    el.forgotEmail.value = "";
    el.forgotNewPass.value = "";
    el.forgotConfirmPass.value = "";
    el.forgotStrengthBar.style.width = "0%";
    el.forgotStrengthBar.className = "pwd-strength__bar";
    el.forgotStrengthLabel.textContent = "";
    setFieldError(el.forgotEmailError, null);
    setFieldError(el.forgotPassError, null);
    clearOtpBoxes(el.forgotOtpBoxes);
  }

  wirePasswordStrength(el.signupPassword, el.signupStrengthBar, el.signupStrengthLabel);
  wirePasswordStrength(el.forgotNewPass, el.forgotStrengthBar, el.forgotStrengthLabel);
  wireOtpBoxes(el.signupOtpBoxes);
  wireOtpBoxes(el.forgotOtpBoxes);

  /* ---------- nav entry point ---------- */
  el.navAuth.addEventListener("click", (e)=>{
    e.preventDefault();
    closeNav();
    if(store.currentUser){
      showView("profile"); history.replaceState(null,"","#profile");
    } else {
      openLoginModal();
    }
  });

  /* ---------- LOG IN ---------- */
  el.loginCloseBtn.addEventListener("click", closeLoginModal);
  el.loginShade.addEventListener("click", closeLoginModal);
  el.loginToSignupBtn.addEventListener("click", ()=>{ closeLoginModal(); openSignupModal(); });
  el.openForgotBtn.addEventListener("click", (e)=>{ e.preventDefault(); closeLoginModal(); openForgotModal(); });

  async function submitLogin(){
    const identifier = el.loginIdentifier.value.trim();
    const password = el.loginPassword.value;
    setFieldError(el.loginError, null);
    if(!identifier || !password){ setFieldError(el.loginError, "Enter your mobile/email and password."); return; }
    setBtnLoading(el.loginSubmitBtn, true, "Logging in…");
    try{
      const { token, user } = await ShadabAPI.login(identifier, password);
      ShadabAPI.setToken(token);
      store.currentUser = { phone: user.mobile, name: user.username, email: user.email };
      updateAuthUI();
      closeLoginModal();
      showToast(`Welcome back, ${user.username.split(" ")[0]}!`);
    }catch(err){
      setFieldError(el.loginError, err.message);
    }finally{
      setBtnLoading(el.loginSubmitBtn, false);
    }
  }
  el.loginSubmitBtn.addEventListener("click", submitLogin);
  [el.loginIdentifier, el.loginPassword].forEach(inp=>{
    inp.addEventListener("keydown", (e)=>{ if(e.key === "Enter"){ e.preventDefault(); submitLogin(); } });
  });

  /* ---------- CREATE ACCOUNT ---------- */
  el.signupCloseBtn.addEventListener("click", closeSignupModal);
  el.signupShade.addEventListener("click", closeSignupModal);
  el.signupToLoginBtn.addEventListener("click", ()=>{ closeSignupModal(); openLoginModal(); });

  el.signupDetailsBtn.addEventListener("click", async ()=>{
    const username = el.signupUsername.value.trim();
    const mobile = el.signupMobile.value.trim().replace(/\D/g,"");
    const email = normalizeEmail(el.signupEmail.value);
    const password = el.signupPassword.value;
    const confirm = el.signupConfirm.value;
    setFieldError(el.signupError, null);

    if(!username){ setFieldError(el.signupError, "Enter a username."); return; }
    if(!isValidMobile(mobile)){ setFieldError(el.signupError, "Enter a valid 10-digit mobile number."); return; }
    if(!isValidEmail(email)){ setFieldError(el.signupError, "Enter a valid email address."); return; }
    if(password.length < 6){ setFieldError(el.signupError, "Password must be at least 6 characters."); return; }
    if(password !== confirm){ setFieldError(el.signupError, "Passwords don't match."); return; }

    setBtnLoading(el.signupDetailsBtn, true, "Sending code…");
    try{
      await ShadabAPI.signup({ username, mobile, email, password });
      pendingSignup = { email };
      el.signupEmailEcho.textContent = email;
      el.signupStepDetails.hidden = true;
      el.signupStepVerify.hidden = false;
      clearOtpBoxes(el.signupOtpBoxes);
      el.signupOtpBoxes[0].focus();
      el.signupDemoHint.textContent = "Check your inbox (and spam folder) for the 6-digit code.";
      showToast("Confirmation code sent to " + email);
    }catch(err){
      setFieldError(el.signupError, err.message);
    }finally{
      setBtnLoading(el.signupDetailsBtn, false);
    }
  });
  el.signupEditDetailsBtn.addEventListener("click", ()=>{
    el.signupStepVerify.hidden = true;
    el.signupStepDetails.hidden = false;
  });
  el.signupResendBtn.addEventListener("click", async ()=>{
    if(!pendingSignup) return;
    setBtnLoading(el.signupResendBtn, true, "Sending…");
    try{
      await ShadabAPI.resendSignupOtp(pendingSignup.email);
      el.signupDemoHint.textContent = "New code sent — check your inbox.";
      showToast("New confirmation code sent");
    }catch(err){
      showToast(err.message);
    }finally{
      setBtnLoading(el.signupResendBtn, false);
    }
  });
  el.signupVerifyBtn.addEventListener("click", async ()=>{
    const entered = otpValue(el.signupOtpBoxes);
    if(entered.length < 6){ showToast("Enter the 6-digit code"); return; }
    if(!pendingSignup) return;

    setBtnLoading(el.signupVerifyBtn, true, "Verifying…");
    try{
      const { token, user } = await ShadabAPI.verifySignup(pendingSignup.email, entered);
      ShadabAPI.setToken(token);
      store.currentUser = { phone: user.mobile, name: user.username, email: user.email };
      updateAuthUI();

      el.signupStepVerify.hidden = true;
      el.signupSuccessName.textContent = user.username;
      el.signupStepSuccess.hidden = false;
      pendingSignup = null;
    }catch(err){
      showToast(err.message);
    }finally{
      setBtnLoading(el.signupVerifyBtn, false);
    }
  });
  el.signupContinueBtn.addEventListener("click", ()=>{
    closeSignupModal();
    showToast("Account created successfully!");
  });

  /* ---------- FORGOT PASSWORD ---------- */
  el.forgotCloseBtn.addEventListener("click", closeForgotModal);
  el.forgotShade.addEventListener("click", closeForgotModal);
  el.forgotBackToLoginBtn.addEventListener("click", ()=>{ closeForgotModal(); openLoginModal(); });

  el.forgotSendBtn.addEventListener("click", async ()=>{
    const email = normalizeEmail(el.forgotEmail.value);
    setFieldError(el.forgotEmailError, null);
    if(!isValidEmail(email)){ setFieldError(el.forgotEmailError, "Enter a valid email address."); return; }

    setBtnLoading(el.forgotSendBtn, true, "Sending…");
    try{
      await ShadabAPI.forgotPassword(email);
      pendingForgotEmail = email;
      el.forgotEmailEcho.textContent = email;
      el.forgotStepEmail.hidden = true;
      el.forgotStepOtp.hidden = false;
      clearOtpBoxes(el.forgotOtpBoxes);
      el.forgotOtpBoxes[0].focus();
      el.forgotDemoHint.textContent = "If that email has an account, a code has been sent — check your inbox.";
      showToast("OTP sent to " + email);
    }catch(err){
      setFieldError(el.forgotEmailError, err.message);
    }finally{
      setBtnLoading(el.forgotSendBtn, false);
    }
  });
  el.forgotEditEmailBtn.addEventListener("click", ()=>{
    el.forgotStepOtp.hidden = true;
    el.forgotStepEmail.hidden = false;
  });
  el.forgotResendBtn.addEventListener("click", async ()=>{
    if(!pendingForgotEmail) return;
    setBtnLoading(el.forgotResendBtn, true, "Sending…");
    try{
      await ShadabAPI.resendForgotOtp(pendingForgotEmail);
      el.forgotDemoHint.textContent = "New code sent — check your inbox.";
      showToast("New OTP sent");
    }catch(err){
      showToast(err.message);
    }finally{
      setBtnLoading(el.forgotResendBtn, false);
    }
  });
  el.forgotVerifyBtn.addEventListener("click", async ()=>{
    const entered = otpValue(el.forgotOtpBoxes);
    if(entered.length < 6){ showToast("Enter the 6-digit code"); return; }

    setBtnLoading(el.forgotVerifyBtn, true, "Verifying…");
    try{
      const { resetToken } = await ShadabAPI.verifyForgotOtp(pendingForgotEmail, entered);
      pendingForgotResetToken = resetToken;
      el.forgotStepOtp.hidden = true;
      el.forgotStepNewPass.hidden = false;
    }catch(err){
      showToast(err.message);
    }finally{
      setBtnLoading(el.forgotVerifyBtn, false);
    }
  });
  el.forgotSaveBtn.addEventListener("click", async ()=>{
    const pw = el.forgotNewPass.value;
    const confirm = el.forgotConfirmPass.value;
    setFieldError(el.forgotPassError, null);
    if(pw.length < 6){ setFieldError(el.forgotPassError, "Password must be at least 6 characters."); return; }
    if(pw !== confirm){ setFieldError(el.forgotPassError, "Passwords don't match."); return; }

    setBtnLoading(el.forgotSaveBtn, true, "Saving…");
    try{
      await ShadabAPI.resetPassword(pendingForgotEmail, pendingForgotResetToken, pw);
      el.forgotStepNewPass.hidden = true;
      el.forgotDoneTitle.textContent = "Password updated";
      el.forgotDoneMessage.textContent = "Your password has been changed. You can now log in with your new password.";
      el.forgotStepDone.hidden = false;
    }catch(err){
      setFieldError(el.forgotPassError, err.message);
    }finally{
      setBtnLoading(el.forgotSaveBtn, false);
    }
  });
  el.forgotSkipBtn.addEventListener("click", ()=>{
    el.forgotStepNewPass.hidden = true;
    el.forgotDoneTitle.textContent = "Verified";
    el.forgotDoneMessage.textContent = "Your identity is verified. You can log in with your existing password anytime.";
    el.forgotStepDone.hidden = false;
  });
  el.forgotDoneBtn.addEventListener("click", ()=>{
    const email = pendingForgotEmail;
    closeForgotModal();
    openLoginModal();
    if(email){ el.loginIdentifier.value = email; el.loginPassword.focus(); }
    pendingForgotEmail = null; pendingForgotResetToken = null;
  });

  /* -- logout with confirmation -- */
  function openLogoutConfirm(){
    el.logoutShade.classList.add("is-open");
    el.logoutModal.classList.add("is-open");
    registerOverlay("logout", closeLogoutConfirm);
  }
  function closeLogoutConfirm(){
    el.logoutShade.classList.remove("is-open");
    el.logoutModal.classList.remove("is-open");
    unregisterOverlay("logout");
  }
  function doLogout(){
    store.currentUser = null;
    ShadabAPI.setToken(null);
    updateAuthUI();
    closeNav();
    closeLogoutConfirm();
    showToast("Logged out");
    showView("home"); history.replaceState(null,"","#home");
  }
  el.navLogout.addEventListener("click", (e)=>{ e.preventDefault(); closeNav(); openLogoutConfirm(); });
  el.profileLogoutBtn.addEventListener("click", openLogoutConfirm);
  el.cancelLogoutBtn.addEventListener("click", closeLogoutConfirm);
  el.logoutShade.addEventListener("click", closeLogoutConfirm);
  el.confirmLogoutBtn.addEventListener("click", doLogout);

  /* =========================================================
     PROFILE
     ========================================================= */
  function renderProfile(){
    const user = store.currentUser;
    if(!user){
      showView("home"); history.replaceState(null,"","#home");
      openAuthModal();
      return;
    }
    el.profileNameInput.value = user.name;
    el.profilePhoneValue.textContent = "+91 " + user.phone;
    el.profileEmailValue.textContent = user.email || "—";
    const users = store.users;
    const since = users[user.phone] && users[user.phone].since ? new Date(users[user.phone].since) : new Date();
    el.profileSinceValue.textContent = since.toLocaleDateString(undefined, { day:"numeric", month:"long", year:"numeric" });
  }
  el.profileNameEditBtn.addEventListener("click", async ()=>{
    const editing = !el.profileNameInput.disabled;
    if(editing){
      const newName = el.profileNameInput.value.trim();
      if(!newName){ showToast("Name can't be empty"); return; }
      const user = store.currentUser;
      try{
        await ShadabAPI.updateMe(newName);
        store.currentUser = { phone: user.phone, name: newName, email: user.email };
        updateAuthUI();
        el.profileNameInput.disabled = true;
        el.profileNameEditBtn.textContent = "✎";
        showToast("Name updated");
      }catch(err){
        showToast(err.message);
      }
    } else {
      el.profileNameInput.disabled = false;
      el.profileNameInput.focus();
      el.profileNameEditBtn.textContent = "✓";
    }
  });

  /* =========================================================
     HEADER SEARCH (live suggestions as you type)
     ========================================================= */
  function openSearchPanel(){
    el.searchPanel.classList.add("is-open");
    registerOverlay("search", closeSearchPanel);
    setTimeout(()=> el.searchInput.focus(), 200);
  }
  function closeSearchPanel(){
    el.searchPanel.classList.remove("is-open");
    unregisterOverlay("search");
  }
  el.searchToggleBtn.addEventListener("click", ()=>{
    el.searchPanel.classList.contains("is-open") ? closeSearchPanel() : openSearchPanel();
  });
  el.searchCloseBtn.addEventListener("click", closeSearchPanel);

  function runSearch(){
    const term = el.searchInput.value.trim().toLowerCase();
    if(!term){ el.searchResults.hidden = true; el.searchResults.innerHTML = ""; return; }
    const matches = getMenu().filter(item =>
      item.name.toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term) ||
      (item.description || "").toLowerCase().includes(term)
    );
    el.searchResults.hidden = false;
    if(matches.length === 0){
      el.searchResults.innerHTML = `<div class="search-empty">No items found for "${el.searchInput.value.trim()}"</div>`;
      return;
    }
    el.searchResults.innerHTML = matches.map(item => `
      <div class="search-result-row" data-id="${item.id}">
        <div class="search-result-row__media">${mediaHTML(item)}</div>
        <span class="search-result-row__name">${item.name}</span>
        <span class="search-result-row__price">₹${item.price}</span>
      </div>`).join("");
    $$(".search-result-row", el.searchResults).forEach(row=>{
      row.addEventListener("click", ()=>{
        const id = row.dataset.id;
        closeSearchPanel();
        el.searchInput.value = "";
        el.searchResults.hidden = true;
        navigateTo("home");
        setTimeout(()=> openItemDetail(id), 250);
      });
    });
  }
  el.searchInput.addEventListener("input", runSearch);
  wireImageFallback(el.searchResults);

  /* =========================================================
     ITEM DETAIL MODAL (click any dish to learn more)
     ========================================================= */
  let detailItemId = null;
  function openItemDetail(id){
    const item = findItem(id);
    if(!item) return;
    detailItemId = id;
    el.itemDetailMedia.innerHTML = mediaHTML(item);
    el.itemDetailCategory.textContent = item.category || "";
    el.itemDetailName.textContent = item.name;
    el.itemDetailDesc.textContent = item.description || "Freshly prepared and dum-sealed, delivered hot to your door.";
    el.itemDetailPrice.textContent = "₹" + item.price + (item.note ? `  ·  ${item.note}` : "");
    const startQty = store.cart[id] || 1;
    el.itemDetailQty.textContent = startQty;
    const open = isOrderingOpen();
    el.itemDetailAddBtn.disabled = !open;
    el.itemDetailAddBtn.textContent = !open ? "Ordering Closed" : (store.cart[id] ? "Update Cart" : "Add to Cart");
    el.itemDetailShade.classList.add("is-open");
    el.itemDetailModal.classList.add("is-open");
    registerOverlay("itemDetail", closeItemDetail);
  }
  function closeItemDetail(){
    el.itemDetailShade.classList.remove("is-open");
    el.itemDetailModal.classList.remove("is-open");
    detailItemId = null;
    unregisterOverlay("itemDetail");
  }
  el.itemDetailCloseBtn.addEventListener("click", closeItemDetail);
  el.itemDetailShade.addEventListener("click", closeItemDetail);
  el.itemDetailMinus.addEventListener("click", ()=>{
    const q = Number(el.itemDetailQty.textContent);
    if(q > 1) el.itemDetailQty.textContent = q - 1;
  });
  el.itemDetailPlus.addEventListener("click", ()=>{
    el.itemDetailQty.textContent = Number(el.itemDetailQty.textContent) + 1;
  });
  el.itemDetailAddBtn.addEventListener("click", ()=>{
    if(!isOrderingOpen() || !detailItemId) return;
    setQty(detailItemId, Number(el.itemDetailQty.textContent));
    showToast("Added to cart");
    closeItemDetail();
  });

  /* =========================================================
     CHECKOUT
     ========================================================= */
  function openCheckout(){
    if(!isOrderingOpen()){ showToast("Ordering is closed for today"); return; }
    if(cartCount() === 0){ showToast("Your cart is empty"); return; }
    if(!store.currentUser){
      closeCart();
      openAuthModal();
      showToast("Please log in to place your order");
      return;
    }
    const cart = store.cart;
    const rows = Object.entries(cart).map(([id,qty])=>{
      const item = findItem(id);
      return `<div class="cs-row"><span>${item.name} × ${qty}</span><span>₹${item.price*qty}</span></div>`;
    }).join("");
    el.checkoutSummary.innerHTML = rows + `<div class="cs-total"><span>Total</span><span>₹${cartTotalAmount()}</span></div>`;
    el.checkoutShade.classList.add("is-open");
    el.checkoutModal.classList.add("is-open");
    registerOverlay("checkout", closeCheckout);
  }
  function closeCheckout(){
    el.checkoutShade.classList.remove("is-open");
    el.checkoutModal.classList.remove("is-open");
    unregisterOverlay("checkout");
  }
  el.checkoutBtn.addEventListener("click", openCheckout);
  el.checkoutCloseBtn.addEventListener("click", closeCheckout);
  el.checkoutShade.addEventListener("click", closeCheckout);

  /* Order IDs read as SH + 2 letters + 4 digits (e.g. SHTX4821) — always
     ends in 4 digits, easier to read aloud than a raw timestamp. */
  function generateOrderId(){
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no ambiguous I/O
    let code = "SH";
    code += letters[Math.floor(Math.random()*letters.length)];
    code += letters[Math.floor(Math.random()*letters.length)];
    code += String(Math.floor(1000 + Math.random()*9000));
    return code;
  }

  el.confirmOrderBtn.addEventListener("click", ()=>{
    if(!isOrderingOpen()){ showToast("Ordering just closed — try again tomorrow"); closeCheckout(); tick(); return; }
    const user = store.currentUser;
    const cart = store.cart;
    if(!user || Object.keys(cart).length === 0) return;

    const items = Object.entries(cart).map(([id,qty])=>{
      const item = findItem(id);
      return { id, name:item.name, note:item.note, price:item.price, qty };
    });
    const now = new Date();
    const order = {
      id: generateOrderId(),
      customerName: user.name,
      phone: user.phone,
      address: el.checkoutAddress.value.trim(),
      items,
      total: cartTotalAmount(),
      dateISO: now.toISOString().slice(0,10),
      timeLabel: now.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}),
      timestamp: now.getTime(),
      delivered: false,
    };
    const orders = store.orders;
    orders.unshift(order);
    store.orders = orders;
    store.cart = {};

    closeCheckout();
    closeCart();
    renderMenu();
    renderCart();
    tick();
    showToast("🎉 Order placed! Track it under My Orders.");
    el.checkoutAddress.value = "";
  });

  /* =========================================================
     MY ORDERS
     ========================================================= */
  function renderMyOrders(){
    purgeOldOrders();
    const user = store.currentUser;
    if(!user){
      el.myOrdersList.innerHTML = `<div class="empty-state"><span>🔒</span>Log in to see your orders<br><small>Your order history will appear here.</small></div>`;
      return;
    }
    const mine = store.orders.filter(o=>o.phone === user.phone);
    if(mine.length === 0){
      el.myOrdersList.innerHTML = `<div class="empty-state"><span>🧾</span>No orders yet<br><small>Your first Shadab order is one tap away.</small></div>`;
      return;
    }
    el.myOrdersList.innerHTML = mine.map(orderCardHTML).join("");
  }
  function orderCardHTML(o){
    const itemsHTML = o.items.map(i=>`${i.name}${i.note?` (${i.note})`:""} × ${i.qty}`).join("<br>");
    return `
    <div class="order-card">
      <div class="order-card__top">
        <span class="order-card__id">#${o.id}</span>
        <span class="order-card__status ${o.delivered ? "delivered":"pending"}">${o.delivered ? "Delivered" : "Preparing"}</span>
      </div>
      <div class="order-card__items">${itemsHTML}</div>
      <div class="order-card__foot">
        <span class="order-card__meta">${o.dateISO} · ${o.timeLabel}</span>
        <span class="order-card__total">₹${o.total}</span>
      </div>
    </div>`;
  }

  /* =========================================================
     ADMIN
     ========================================================= */
  function renderAdmin(){
    purgeOldOrders();
    if(store.adminUnlocked){
      el.adminGate.hidden = true;
      el.adminDash.hidden = false;
      renderWhoami();
      renderAllOrders();
      renderVerifyPanel();
      renderSettingsPanel();
      renderMenuManage();
    } else {
      el.adminGate.hidden = false;
      el.adminDash.hidden = true;
      el.adminPassword.value = "";
      el.adminGateError.hidden = true;
    }
  }
  function renderWhoami(){
    const user = store.currentUser;
    el.adminWhoami.classList.toggle("is-guest", !user);
    el.adminWhoamiText.textContent = user
      ? `Signed in as ${user.name} · +91 ${user.phone}`
      : "Signed in as Guest — no customer account linked on this device";
  }
  el.adminGateForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const submitBtn = el.adminGateForm.querySelector("button[type=submit]") || el.adminGateForm.querySelector("button");
    // The password is checked server-side (X-Admin-Password header against
    // the ADMIN_PASSWORD environment variable) rather than against anything
    // stored in the page, so it can't be read out of the site's source.
    sessionStorage.setItem("shadab_admin_session_pw", el.adminPassword.value);
    setBtnLoading(submitBtn, true, "Checking…");
    try{
      await ShadabAPI.allOrders(); // throws if the password is wrong
      store.adminUnlocked = true;
      el.adminGateError.hidden = true;
      renderAdmin();
      showToast("Admin unlocked");
    }catch(err){
      sessionStorage.removeItem("shadab_admin_session_pw");
      el.adminGateError.hidden = false;
      el.adminGateError.textContent = err.message.includes("Backend not connected")
        ? err.message
        : "Incorrect admin password.";
    }finally{
      setBtnLoading(submitBtn, false);
    }
  });
  el.adminLogoutBtn.addEventListener("click", ()=>{
    store.adminUnlocked = false;
    sessionStorage.removeItem("shadab_admin_session_pw");
    renderAdmin();
    showToast("Admin locked");
  });

  /* -- tabs -- */
  $$(".admin-tab").forEach(tab=>{
    tab.addEventListener("click", ()=> showAdminPanel(tab.dataset.tab));
  });

  /* -- all orders -- */
  function orderMatchesSearch(o, term){
    if(!term) return true;
    const t = term.toLowerCase();
    return o.customerName.toLowerCase().includes(t) || o.phone.includes(t) || o.id.toLowerCase().includes(t);
  }
  function renderAllOrders(){
    const orders = store.orders;
    el.statOrderCount.textContent = orders.length;
    el.statTotalAmount.textContent = "₹" + orders.reduce((s,o)=>s+o.total,0);

    const term = el.ordersSearchInput.value.trim();
    const filtered = orders.filter(o => orderMatchesSearch(o, term));

    if(orders.length === 0){
      el.allOrdersList.innerHTML = `<div class="empty-state"><span>🧾</span>No orders placed yet</div>`;
      return;
    }
    if(filtered.length === 0){
      el.allOrdersList.innerHTML = `<div class="empty-state"><span>🔍</span>No orders match "${term}"</div>`;
      return;
    }
    el.allOrdersList.innerHTML = filtered.map(o=>{
      const itemsHTML = o.items.map(i=>`${i.name}${i.note?` (${i.note})`:""} × ${i.qty} — ₹${i.price*i.qty}`).join("<br>");
      return `
      <div class="order-card">
        <div class="order-card__top">
          <div>
            <div class="order-card__customer">${o.customerName}</div>
            <div class="order-card__phone">${o.phone}${o.address ? " · "+o.address : ""}</div>
          </div>
          <span class="order-card__status ${o.delivered ? "delivered":"pending"}">${o.delivered ? "Delivered" : "Pending"}</span>
        </div>
        <div class="order-card__items">${itemsHTML}</div>
        <div class="order-card__foot">
          <span class="order-card__meta">#${o.id} · ${o.dateISO} · ${o.timeLabel}</span>
          <span class="order-card__total">₹${o.total}</span>
        </div>
      </div>`;
    }).join("");
  }
  el.ordersSearchInput.addEventListener("input", renderAllOrders);

  /* -- simple, clean copy format: consolidated item + quantity list -- */
  function buildCopyText(){
    const orders = store.orders;
    if(orders.length === 0) return null;
    const totals = {};
    orders.forEach(o=>{ o.items.forEach(i=>{ totals[i.id] = (totals[i.id]||0) + i.qty; }); });
    const menu = getMenu();
    const lines = menu
      .filter(m => totals[m.id])
      .map(m => ({ name: m.name + (m.note ? ` (${m.note})` : ""), qty: totals[m.id] }));
    if(lines.length === 0) return null;

    const nameWidth = Math.max(...lines.map(l => l.name.length + 2), 14) + 3;
    let text = "Item.".padEnd(nameWidth) + "Qty\n";
    lines.forEach(l=>{ text += ("- " + l.name).padEnd(nameWidth) + l.qty + "\n"; });
    const grandTotal = orders.reduce((s,o)=>s+o.total,0);
    text += `\nOrders: ${orders.length}    Grand Total: ₹${grandTotal}`;
    return text;
  }
  el.copyOrdersBtn.addEventListener("click", ()=>{
    const text = buildCopyText();
    if(!text){ showToast("No orders to copy"); return; }
    navigator.clipboard.writeText(text).then(()=>{
      showToast("Order list copied to clipboard");
    }).catch(()=>{
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try{ document.execCommand("copy"); showToast("Order list copied to clipboard"); }
      catch(e){ showToast("Could not copy — try manually selecting"); }
      document.body.removeChild(ta);
    });
  });

  el.copyOrderIdsBtn.addEventListener("click", ()=>{
    const orders = store.orders;
    if(orders.length === 0){ showToast("No orders to copy"); return; }
    const text = orders.map(o => o.id).join("\n");
    navigator.clipboard.writeText(text).then(()=>{
      showToast(`Copied ${orders.length} order ID${orders.length > 1 ? "s" : ""}`);
    }).catch(()=>{
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try{ document.execCommand("copy"); showToast("Order IDs copied to clipboard"); }
      catch(e){ showToast("Could not copy — try manually selecting"); }
      document.body.removeChild(ta);
    });
  });

  /* -- clear all orders: confirm, then a cancellable 7-second countdown -- */
  let clearOrdersTimer = null;
  let clearOrdersSeconds = 7;
  function openClearOrdersConfirm(){
    if(store.orders.length === 0){ showToast("No orders to clear"); return; }
    clearOrdersSeconds = 7;
    el.clearOrdersCountdownText.textContent = `Clearing in ${clearOrdersSeconds}s…`;
    el.clearOrdersShade.classList.add("is-open");
    el.clearOrdersModal.classList.add("is-open");
    registerOverlay("clearOrders", closeClearOrdersConfirm);
    clearOrdersTimer = setInterval(()=>{
      clearOrdersSeconds--;
      if(clearOrdersSeconds <= 0){
        clearInterval(clearOrdersTimer);
        store.orders = [];
        closeClearOrdersConfirm();
        renderAllOrders();
        renderVerifyPanel();
        showToast("All orders cleared");
      } else {
        el.clearOrdersCountdownText.textContent = `Clearing in ${clearOrdersSeconds}s…`;
      }
    }, 1000);
  }
  function closeClearOrdersConfirm(){
    clearInterval(clearOrdersTimer);
    el.clearOrdersShade.classList.remove("is-open");
    el.clearOrdersModal.classList.remove("is-open");
    unregisterOverlay("clearOrders");
  }
  el.clearOrdersBtn.addEventListener("click", openClearOrdersConfirm);
  el.cancelClearOrdersBtn.addEventListener("click", closeClearOrdersConfirm);
  el.clearOrdersShade.addEventListener("click", closeClearOrdersConfirm);

  /* -- verify orders (per day) -- */
  function todayISO(){ return new Date().toISOString().slice(0,10); }
  if(!el.verifyDateInput.value) el.verifyDateInput.value = todayISO();

  function renderVerifyPanel(){
    const date = el.verifyDateInput.value || todayISO();
    const term = el.verifySearchInput.value.trim();
    const dayOrders = store.orders.filter(o=>o.dateISO === date && orderMatchesSearch(o, term));
    if(dayOrders.length === 0){
      el.verifyOrdersList.innerHTML = term
        ? `<div class="empty-state"><span>🔍</span>No orders match "${term}" on this date</div>`
        : `<div class="empty-state"><span>📋</span>No orders for this date</div>`;
      return;
    }
    el.verifyOrdersList.innerHTML = dayOrders.map(o=>{
      const itemsSummary = o.items.map(i=>`${i.name} ×${i.qty}`).join(", ");
      return `
      <div class="verify-item ${o.delivered ? "is-delivered":""}" data-id="${o.id}">
        <div class="verify-item__info">
          <div class="verify-item__name">${o.customerName} <span style="color:var(--text-faint); font-weight:400;">· #${o.id}</span></div>
          <div class="verify-item__detail">${itemsSummary} — ₹${o.total} · ${o.timeLabel}</div>
        </div>
        <label class="checkbox-wrap">
          <input type="checkbox" ${o.delivered ? "checked":""}>
          <span class="checkbox-box"></span>
          Delivered
        </label>
      </div>`;
    }).join("");

    $$(".verify-item", el.verifyOrdersList).forEach(row=>{
      const id = row.dataset.id;
      const checkbox = $("input", row);
      checkbox.addEventListener("change", ()=>{
        const orders = store.orders;
        const order = orders.find(o=>o.id===id);
        if(order){
          order.delivered = checkbox.checked;
          store.orders = orders;
          row.classList.toggle("is-delivered", order.delivered);
          renderAllOrders();
        }
      });
    });
  }
  el.verifyDateInput.addEventListener("change", renderVerifyPanel);
  el.verifySearchInput.addEventListener("input", renderVerifyPanel);

  /* -- settings: closing time -- */
  function renderSettingsPanel(){
    el.closingTimeInput.value = store.settings.closingTime || DEFAULT_CLOSING_TIME;
    el.currentClosingLabel.textContent = formatTime12(store.settings.closingTime || DEFAULT_CLOSING_TIME);
  }
  el.saveClosingTimeBtn.addEventListener("click", ()=>{
    const val = el.closingTimeInput.value;
    if(!val){ showToast("Pick a valid time"); return; }
    store.settings = { closingTime: val };
    renderSettingsPanel();
    tick();
    showToast("Closing time updated to " + formatTime12(val));
  });
  el.resetClosingTimeBtn.addEventListener("click", ()=>{
    store.settings = { closingTime: DEFAULT_CLOSING_TIME };
    renderSettingsPanel();
    tick();
    showToast("Closing time reset to default");
  });

  /* -- settings: change admin password --
     The real admin password now lives on the server as an environment
     variable (ADMIN_PASSWORD), not in the page, so it can't be changed
     from here — that's intentional, it's what makes it real security
     instead of security-by-obscurity in the page source. */
  el.changePasswordForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    el.changePasswordError.hidden = false;
    el.changePasswordSuccess.hidden = true;
    el.changePasswordError.textContent = "To change the admin password, update ADMIN_PASSWORD in your Render dashboard (Settings → Environment) and redeploy.";
  });

  /* =========================================================
     ADMIN — MENU MANAGEMENT (add / edit / delete items)
     ========================================================= */
  function renderMenuManage(){
    const menu = getMenu();
    el.menuManageList.innerHTML = menu.map(item=>{
      const isCustom = item.id.startsWith("custom-");
      return `
      <div class="manage-row" data-id="${item.id}">
        <div class="manage-row__media">${mediaHTML(item)}</div>
        <div class="manage-row__info">
          <div class="manage-row__name">${item.name}${item.note ? ` <span style="color:var(--text-faint);font-weight:400;">(${item.note})</span>`:""}</div>
          <div class="manage-row__meta">${item.category} · ₹${item.price}${isCustom ? " · custom item" : ""}</div>
        </div>
        <div class="manage-row__actions">
          <button class="edit-item" aria-label="Edit item">✎</button>
          <button class="delete-item danger" aria-label="Remove item">✕</button>
        </div>
      </div>`;
    }).join("");

    $$(".manage-row", el.menuManageList).forEach(row=>{
      const id = row.dataset.id;
      $(".edit-item", row).addEventListener("click", ()=> openItemForm(id));
      $(".delete-item", row).addEventListener("click", ()=> deleteItem(id));
    });
  }

  function renderIconChoices(){
    el.iconChoiceRow.innerHTML = ICON_KEYS.map(key=>
      `<button type="button" class="icon-choice ${key===selectedIconKey?"is-selected":""}" data-icon="${key}">${ICONS[key]}</button>`
    ).join("");
    $$(".icon-choice", el.iconChoiceRow).forEach(btn=>{
      btn.addEventListener("click", ()=>{
        selectedIconKey = btn.dataset.icon;
        $$(".icon-choice", el.iconChoiceRow).forEach(b=>b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
      });
    });
  }

  function showAdminPanel(tabKey){
    $$(".admin-tab").forEach(t=>t.classList.toggle("is-active", t.dataset.tab === tabKey));
    $$(".admin-panel").forEach(p=>{ p.classList.remove("is-active"); p.hidden = true; });
    const target = $("#panel-"+tabKey);
    target.hidden = false;
    target.classList.add("is-active");
  }

  function renderPhotoPreview(){
    if(pendingImageData){
      el.itemPhotoPreview.innerHTML = `<img src="${pendingImageData}" alt="">`;
    } else {
      el.itemPhotoPreview.textContent = "No photo";
    }
  }
  el.itemPhotoInput.addEventListener("change", (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const img = new Image();
      img.onload = ()=>{
        const maxW = 480;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pendingImageData = canvas.toDataURL("image/jpeg", 0.8);
        renderPhotoPreview();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  el.removeItemPhotoBtn.addEventListener("click", ()=>{
    pendingImageData = null;
    el.itemPhotoInput.value = "";
    renderPhotoPreview();
  });

  function openItemForm(id){
    editingItemId = id || null;
    if(id){
      const item = findItem(id);
      el.itemFormTitle.textContent = "Edit item";
      el.itemNameInput.value = item.name;
      el.itemPriceInput.value = item.price;
      el.itemCategoryInput.value = item.category;
      el.itemNoteInput.value = item.note || "";
      el.itemDescInput.value = item.description || "";
      selectedIconKey = ICONS[item.icon] ? item.icon : "plate";
      pendingImageData = item.imageData || null;
    } else {
      el.itemFormTitle.textContent = "Add new item";
      el.itemForm.reset();
      selectedIconKey = ICON_KEYS[0];
      pendingImageData = null;
    }
    renderIconChoices();
    renderPhotoPreview();
    showAdminPanel("itemform");
  }
  el.addItemBtn.addEventListener("click", ()=> openItemForm(null));
  el.cancelItemFormBtn.addEventListener("click", ()=> showAdminPanel("menu"));

  el.itemForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = el.itemNameInput.value.trim();
    const price = Number(el.itemPriceInput.value);
    const category = el.itemCategoryInput.value.trim() || "Other";
    const note = el.itemNoteInput.value.trim();
    const description = el.itemDescInput.value.trim();

    if(!name || !price || price <= 0){ showToast("Enter a valid name and price"); return; }

    if(editingItemId){
      const isBase = BASE_MENU.some(m => m.id === editingItemId);
      if(isBase){
        const overrides = store.menuOverrides;
        overrides[editingItemId] = { name, price, category, note, description, icon: selectedIconKey, imageData: pendingImageData };
        store.menuOverrides = overrides;
      } else {
        const custom = store.customItems;
        const idx = custom.findIndex(c => c.id === editingItemId);
        if(idx > -1) custom[idx] = { ...custom[idx], name, price, category, note, description, icon: selectedIconKey, imageData: pendingImageData };
        store.customItems = custom;
      }
      showToast("Item updated");
    } else {
      const custom = store.customItems;
      const newItem = { id: "custom-" + Date.now(), name, price, category, note, description, icon: selectedIconKey, imageData: pendingImageData };
      custom.push(newItem);
      store.customItems = custom;
      showToast("Item added to menu");
    }

    editingItemId = null;
    renderMenuManage();
    renderMenu();
    showAdminPanel("menu");
  });

  function deleteItem(id){
    const isCustom = id.startsWith("custom-");
    if(isCustom){
      store.customItems = store.customItems.filter(c => c.id !== id);
    } else {
      const deleted = store.deletedIds;
      if(!deleted.includes(id)) deleted.push(id);
      store.deletedIds = deleted;
    }
    renderMenuManage();
    renderMenu();
    showToast("Item removed from menu");
  }

  el.restoreMenuBtn.addEventListener("click", ()=>{
    store.menuOverrides = {};
    store.customItems = [];
    store.deletedIds = [];
    renderMenuManage();
    renderMenu();
    showToast("Menu restored to original");
  });

  /* =========================================================
     BANNER CAROUSEL (auto-rotating, swipeable, Hotstar-style)
     ========================================================= */
  function initBannerCarousel(){
    const slides = $$(".banner-slide", el.bannerTrack);
    if(slides.length === 0) return;
    let index = 0;
    let timer = null;

    function renderDots(){
      el.bannerDots.innerHTML = slides.map((_,i)=> `<button data-i="${i}" class="${i===index?"is-active":""}" aria-label="Go to slide ${i+1}"></button>`).join("");
      $$("button", el.bannerDots).forEach(btn=>{
        btn.addEventListener("click", ()=>{ goTo(Number(btn.dataset.i)); restart(); });
      });
    }
    function goTo(i){
      index = (i + slides.length) % slides.length;
      el.bannerTrack.style.transform = `translateX(-${index * 100}%)`;
      renderDots();
    }
    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }
    function restart(){ clearInterval(timer); timer = setInterval(next, 4500); }

    el.bannerNext.addEventListener("click", ()=>{ next(); restart(); });
    el.bannerPrev.addEventListener("click", ()=>{ prev(); restart(); });

    let touchStartX = null;
    el.bannerCarousel.addEventListener("touchstart", (e)=>{ touchStartX = e.touches[0].clientX; clearInterval(timer); }, { passive:true });
    el.bannerCarousel.addEventListener("touchend", (e)=>{
      if(touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if(dx > 40) prev();
      else if(dx < -40) next();
      touchStartX = null;
      restart();
    });
    el.bannerCarousel.addEventListener("mouseenter", ()=> clearInterval(timer));
    el.bannerCarousel.addEventListener("mouseleave", restart);

    renderDots();
    restart();
  }

  /* =========================================================
     INIT
     ========================================================= */
  function init(){
    purgeOldOrders();
    wireImageFallback(el.menuList);
    wireImageFallback(el.menuManageList);
    wireImageFallback(el.itemDetailMedia);
    wireImageFallback(el.cartItems);
    initBannerCarousel();
    renderMenu();
    renderCart();
    updateAuthUI();
    tick();
    setInterval(()=>{ purgeOldOrders(); tick(); }, 1000);

    const hash = location.hash.replace("#","");
    const startView = VALID_VIEWS.includes(hash) ? hash : "home";
    showView(startView);
    history.replaceState({ shadabView: startView }, "", "#"+startView);
  }
  init();
})();
