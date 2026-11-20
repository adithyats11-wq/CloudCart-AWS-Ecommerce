
const API_BASE_URL =
  window.location.protocol === "file:"
    ? "http://127.0.0.1:5000"
    : window.location.origin;
const PRODUCTS_API_URL = `${API_BASE_URL}/api/products`;
const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;

let products = [];
let cart = JSON.parse(localStorage.getItem("cloudcart-cart") || "{}");

const productEmojis = {
  headphones: "🎧",
  watch: "⌚",
  shoes: "👟",
  backpack: "🎒"
};

// Format prices in Indian rupees
function money(value) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

// Load products from the Flask backend
async function loadProducts() {
  const productList = document.getElementById("product-list");

  try {
    productList.innerHTML = "<p>Loading products...</p>";

    const response = await fetch(PRODUCTS_API_URL);

    if (!response.ok) {
      throw new Error(`Products API returned ${response.status}`);
    }

    const data = await response.json();

    products = data.map(product => ({
      ...product,
      id: Number(product.id),
      price: Number(product.price),
      emoji: productEmojis[product.image] || "🛍️"
    }));

    // Keep only cart items that still exist in the product list
    for (const id of Object.keys(cart)) {
      if (!products.some(product => product.id === Number(id))) {
        delete cart[id];
      }
    }

    saveCartToStorage();
    renderProducts();
    renderCart();
  } catch (error) {
    productList.innerHTML =
      "<p>Could not load products. Check that the Flask backend is running.</p>";

    console.error("Product loading error:", error);
  }
}

// Display products and apply search

function getCategory(product) {
  const name = product.name.toLowerCase();
  const image = (product.image || "").toLowerCase();

  if (
    name.includes("headphone") ||
    name.includes("watch") ||
    image === "headphones" ||
    image === "watch"
  ) {
    return "Electronics";
  }

  if (
    name.includes("shoe") ||
    name.includes("backpack") ||
    image === "shoes" ||
    image === "backpack"
  ) {
    return "Fashion & Accessories";
  }

  if (
    name.includes("sunscreen") ||
    name.includes("beauty") ||
    name.includes("skin")
  ) {
    return "Beauty & Personal Care";
  }

  return "Everyday Essentials";
}

// Display products by category and apply search
function renderProducts() {
  const searchInput = document.getElementById("search");
  const productList = document.getElementById("product-list");

  if (!searchInput || !productList) {
    console.error("Missing search or product-list element in index.html");
    return;
  }

  const search = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search)
  );

  if (filteredProducts.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }

  const categories = [
    "Electronics",
    "Fashion & Accessories",
    "Beauty & Personal Care",
    "Everyday Essentials"
  ];

  productList.innerHTML = categories.map(category => {
    const categoryProducts = filteredProducts.filter(
      product => getCategory(product) === category
    );

    if (categoryProducts.length === 0) {
      return "";
    }

    return `
      <section class="category-section">
        <div class="category-heading">
          <h3>${category}</h3>
          <span>${categoryProducts.length} products</span>
        </div>

        <div class="products">
          ${categoryProducts.map(product => `
            <div class="product">
              <div class="emoji">${product.emoji}</div>
              <h3>${product.name}</h3>
              <p class="price">₹${money(product.price)}</p>
              <button
                type="button"
                onclick="addToCart(${product.id})"
              >
                Add to Cart
              </button>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

// Add a product to the cart
function addToCart(id) {
  const product = products.find(item => item.id === Number(id));

  if (!product) {
    return;
  }

  cart[id] = (Number(cart[id]) || 0) + 1;
  saveCart();
}

// Save cart in the browser
function saveCartToStorage() {
  localStorage.setItem("cloudcart-cart", JSON.stringify(cart));
}

// Update the cart display
function saveCart() {
  saveCartToStorage();
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const totalElement = document.getElementById("total");
  const countElement = document.getElementById("count");

  if (!cartItems || !totalElement || !countElement) {
    console.error("Missing cart elements in index.html");
    return;
  }

  const items = Object.entries(cart).filter(
    ([id, qty]) =>
      Number(qty) > 0 &&
      products.some(product => product.id === Number(id))
  );

  let total = 0;
  let count = 0;

  cartItems.innerHTML = items.map(([id, qty]) => {
    const product = products.find(item => item.id === Number(id));
    const quantity = Number(qty);
    const subtotal = product.price * quantity;

    total += subtotal;
    count += quantity;

    return `
      <div class="cart-row">
        <span>${product.emoji} ${product.name} × ${quantity}</span>
        <span>
          ₹${money(subtotal)}
          <button
            type="button"
            onclick="removeOne(${product.id})"
            aria-label="Remove one ${product.name}"
          >−</button>
        </span>
      </div>
    `;
  }).join("") || "<p>Your cart is empty.</p>";

  totalElement.textContent = money(total);
  countElement.textContent = count;
}

// Remove one item from the cart
function removeOne(id) {
  if (!cart[id]) {
    return;
  }

  cart[id] = Number(cart[id]) - 1;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  saveCart();
}

// Scroll to the cart section
function showCart() {
  const cartSection = document.getElementById("cart-section");

  if (cartSection) {
    cartSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Send the order to the Flask backend

async function checkout() {
  const message = document.getElementById("message");
  const emailInput = document.getElementById("customer-email");
  const customerEmail = emailInput.value.trim();

  const items = Object.entries(cart)
    .filter(([, qty]) => Number(qty) > 0)
    .map(([id, qty]) => ({
      product_id: Number(id),
      quantity: Number(qty)
    }));

  if (items.length === 0) {
    message.textContent = "Please add products to your cart first.";
    return;
  }

  if (!customerEmail || !emailInput.checkValidity()) {
    message.textContent = "Please enter a valid email address.";
    emailInput.focus();
    return;
  }

  const checkoutButton = document.querySelector(
    'button[onclick="checkout()"]'
  );

  if (checkoutButton) {
    checkoutButton.disabled = true;
  }

  message.textContent = "Placing your order...";

  try {
    const response = await fetch(ORDERS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items,
        customer_email: customerEmail
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "The order could not be placed.");
    }

    message.textContent =
      `Order ${result.order_id} received successfully! ` +
      `Status: ${result.status}. No payment was taken.`;

    cart = {};
    saveCart();
    emailInput.value = "";
  } catch (error) {
    message.textContent =
      `Could not place order: ${error.message}`;

    console.error("Checkout error:", error);
  } finally {
    if (checkoutButton) {
      checkoutButton.disabled = false;
    }
  }
}


// Connect the search box
const searchInput = document.getElementById("search");

if (searchInput) {
  searchInput.addEventListener("input", renderProducts);
}

// Start the application
loadProducts();
