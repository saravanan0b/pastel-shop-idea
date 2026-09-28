/**
 * OAT & MIST — VANILLA JAVASCRIPT STOREFRONT LOGIC
 * Zero external frameworks, 100% pure JavaScript!
 */

// 1. PRODUCTS DATASET
const PRODUCTS = [
  {
    id: "throw",
    name: "Linen Throw",
    line: "Washed flax, softer daily.",
    price: 680,
    tone: "sage",
    category: "Home",
  },
  {
    id: "tumbler",
    name: "Blush Tumbler",
    line: "Glazed stoneware, 300 ml.",
    price: 240,
    tone: "blush",
    category: "Tableware",
    exclusive: true,
  },
  {
    id: "basket",
    name: "Oat Basket",
    line: "Coiled seagrass, roomy.",
    price: 420,
    tone: "oat",
    category: "Home",
  },
  {
    id: "carafe",
    name: "Mist Carafe",
    line: "Cool glass, slow to pour.",
    price: 380,
    tone: "mist",
    category: "Tableware",
  },
  {
    id: "apron",
    name: "Sage Apron",
    line: "Brushed cotton, cross back.",
    price: 520,
    tone: "sage",
    category: "Apparel",
  },
  {
    id: "candle",
    name: "Fig Candle",
    line: "Fig and cedar, 45 hours.",
    price: 320,
    tone: "blush",
    category: "Home",
    exclusive: true,
  },
  {
    id: "slippers",
    name: "Wool Slippers",
    line: "Felted wool, unisex sizes.",
    price: 460,
    tone: "oat",
    category: "Apparel",
  },
  {
    id: "napkins",
    name: "Fog Napkins",
    line: "Four, hazy blue stripe.",
    price: 220,
    tone: "mist",
    category: "Tableware",
  },
  {
    id: "cushion",
    name: "Lavender Silk Cushion",
    line: "Organic flax-silk, serene lavender hue.",
    price: 580,
    tone: "lavender",
    category: "Home",
  },
  {
    id: "mug",
    name: "Periwinkle Mist Mug",
    line: "Glazed stoneware, soft lavender blue.",
    price: 290,
    tone: "lavender",
    category: "Tableware",
    exclusive: true,
  },
];

// 2. STATE MANAGEMENT
let activeCategory = "all";
let activeTone = "all";
let onlyExclusives = false;
let cart = [
  { id: "tumbler", quantity: 1 } // Initial sample item in cart
];
let isLoggedIn = false;

// 3. DOM ELEMENTS
const productGrid = document.getElementById("product-grid");
const emptyState = document.getElementById("empty-state");
const productCount = document.getElementById("product-count");
const viewTitle = document.getElementById("view-title");

const categoryPills = document.querySelectorAll("#category-pills .pill");
const tonePills = document.querySelectorAll("#tone-pills .pill");
const navLinks = document.querySelectorAll(".nav-link");
const exclusivesToggleBtn = document.getElementById("toggle-exclusives-btn");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

const cartBtn = document.getElementById("cart-btn");
const cartBadge = document.getElementById("cart-badge");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");
const closeCartBtn = document.getElementById("close-cart-btn");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

const authBtn = document.getElementById("auth-btn");
const authLabel = document.getElementById("auth-label");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// 4. RENDER FUNCTIONS

/**
 * Filter & render the product grid based on current state
 */
function renderProducts() {
  const filtered = PRODUCTS.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesTone = activeTone === "all" || item.tone === activeTone;
    const matchesExclusive = !onlyExclusives || item.exclusive === true;

    return matchesCategory && matchesTone && matchesExclusive;
  });

  // Update Section Title & Count Badge
  if (onlyExclusives) {
    viewTitle.textContent = "Exclusive Goods";
  } else if (activeCategory !== "all") {
    viewTitle.textContent = activeCategory;
  } else {
    viewTitle.textContent = "All Goods";
  }

  productCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;

  // Handle Empty State
  if (filtered.length === 0) {
    productGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  // Render Product Cards
  productGrid.innerHTML = filtered
    .map((product) => {
      return `
        <article class="product-card" data-id="${product.id}">
          <div class="card-top">
            <span class="tone-badge tone-${product.tone}">
              <span class="dot dot-${product.tone}"></span>
              ${product.tone}
            </span>
            ${product.exclusive ? `<span class="exclusive-tag">Exclusive</span>` : ""}
          </div>
          
          <div class="card-body">
            <span class="product-category">${product.category}</span>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-line">${product.line}</p>
          </div>
          
          <div class="card-bottom">
            <span class="product-price">₹${product.price}</span>
            <button class="btn btn-outline btn-add-cart" onclick="addToCart('${product.id}')">
              + Add to Bag
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

/**
 * Render Cart Drawer items and calculate total price
 */
function renderCart() {
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartBadge.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-msg">
        <p>Your bag is currently empty.</p>
        <p style="font-size: 0.85rem; margin-top: 4px;">Explore our soft-toned collection.</p>
      </div>
    `;
    cartSubtotal.textContent = "₹0.00";
    cartTotal.textContent = "₹0.00";
    return;
  }

  let totalCost = 0;

  const itemsHtml = cart
    .map((cartItem) => {
      const product = PRODUCTS.find((p) => p.id === cartItem.id);
      if (!product) return "";

      const itemTotal = product.price * cartItem.quantity;
      totalCost += itemTotal;

      return `
        <div class="cart-item">
          <div class="cart-item-details">
            <h4>${product.name}</h4>
            <p>₹${product.price} &times; ${cartItem.quantity} = ₹${itemTotal}</p>
          </div>
          <div class="cart-item-controls">
            <div class="qty-group">
              <button class="qty-btn" onclick="updateQuantity('${cartItem.id}', -1)" aria-label="Decrease quantity">&minus;</button>
              <span class="qty-value">${cartItem.quantity}</span>
              <button class="qty-btn" onclick="updateQuantity('${cartItem.id}', 1)" aria-label="Increase quantity">&plus;</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${cartItem.id}')" title="Remove item">
              &times;
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  cartItemsContainer.innerHTML = itemsHtml;
  cartSubtotal.textContent = `₹${totalCost.toFixed(2)}`;
  cartTotal.textContent = `₹${totalCost.toFixed(2)}`;
}

// 5. USER ACTION HANDLERS

/**
 * Add product to cart or increment quantity
 */
function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  renderCart();
  const item = PRODUCTS.find((p) => p.id === productId);
  showToast(`Added ${item ? item.name : "Item"} to your bag`);
}

/**
 * Update quantity (+1 or -1)
 */
function updateQuantity(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    renderCart();
  }
}

/**
 * Remove product completely from cart
 */
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  renderCart();
}

/**
 * Open/Close Cart Slide-Over Drawer
 */
function toggleCart(show) {
  if (show) {
    cartOverlay.classList.remove("hidden");
    cartDrawer.classList.remove("hidden");
  } else {
    cartOverlay.classList.add("hidden");
    cartDrawer.classList.add("hidden");
  }
}

/**
 * Toast Notification Popup
 */
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

// 6. EVENT LISTENERS SETUP

// Category Pills Click
categoryPills.forEach((pill) => {
  pill.addEventListener("click", (e) => {
    categoryPills.forEach((p) => p.classList.remove("active"));
    const selectedPill = e.currentTarget;
    selectedPill.classList.add("active");

    activeCategory = selectedPill.dataset.category;
    renderProducts();
  });
});

// Tone Pills Click
tonePills.forEach((pill) => {
  pill.addEventListener("click", (e) => {
    tonePills.forEach((p) => p.classList.remove("active"));
    const selectedPill = e.currentTarget;
    selectedPill.classList.add("active");

    activeTone = selectedPill.dataset.tone;
    renderProducts();
  });
});

// Navbar Link Click
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    navLinks.forEach((l) => l.classList.remove("active"));
    const selectedLink = e.currentTarget;
    selectedLink.classList.add("active");

    const view = selectedLink.dataset.view;
    if (view === "exclusives") {
      onlyExclusives = true;
      activeCategory = "all";
      exclusivesToggleBtn.classList.add("active");
    } else {
      onlyExclusives = false;
      exclusivesToggleBtn.classList.remove("active");
      activeCategory = view;
    }

    // Sync active category pill
    categoryPills.forEach((p) => {
      if (p.dataset.category === activeCategory) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });

    renderProducts();
  });
});

// Exclusives Toggle Button
exclusivesToggleBtn.addEventListener("click", () => {
  onlyExclusives = !onlyExclusives;
  if (onlyExclusives) {
    exclusivesToggleBtn.classList.add("active");
  } else {
    exclusivesToggleBtn.classList.remove("active");
  }
  renderProducts();
});

// Reset Filters Button (Empty state)
resetFiltersBtn.addEventListener("click", () => {
  activeCategory = "all";
  activeTone = "all";
  onlyExclusives = false;

  categoryPills.forEach((p) => p.classList.toggle("active", p.dataset.category === "all"));
  tonePills.forEach((p) => p.classList.toggle("active", p.dataset.tone === "all"));
  exclusivesToggleBtn.classList.remove("active");

  renderProducts();
});

// Cart Drawer Open/Close Events
cartBtn.addEventListener("click", () => toggleCart(true));
closeCartBtn.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

// Checkout Action
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your bag is empty!");
    return;
  }
  alert("Thank you for your order! This is a demo checkout.");
  cart = [];
  renderCart();
  toggleCart(false);
});

// Auth Toggle Simulation
authBtn.addEventListener("click", () => {
  isLoggedIn = !isLoggedIn;
  if (isLoggedIn) {
    authLabel.textContent = "Sign Out";
    showToast("Signed in as Customer");
  } else {
    authLabel.textContent = "Sign In";
    showToast("Signed out successfully");
  }
});

// INITIALIZATION
renderProducts();
renderCart();
