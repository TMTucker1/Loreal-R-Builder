/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Local storage keys for remembering user preferences */
const STORAGE_KEYS = {
  CATEGORY: "loreal_last_category",
  SELECTED_PRODUCTS: "loreal_selected_products",
  CHAT_HISTORY: "loreal_chat_history"
};

/* Array to track selected products */
let selectedProducts = [];

/* Load user's previous choices from local storage */
function loadUserPreferences() {
  // Load last selected category
  const lastCategory = localStorage.getItem(STORAGE_KEYS.CATEGORY);
  if (lastCategory) {
    categoryFilter.value = lastCategory;
    // Trigger change event to load products for the saved category
    categoryFilter.dispatchEvent(new Event("change"));
  } else {
    showInitialPlaceholder();
  }
  
  // Load previously selected products
  const savedProducts = localStorage.getItem(STORAGE_KEYS.SELECTED_PRODUCTS);
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
    updateSelectedProductsDisplay();
  } else {
    updateSelectedProductsDisplay();
  }
  
  // Load chat history
  const savedChatHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  if (savedChatHistory) {
    chatWindow.innerHTML = savedChatHistory;
  }
}

/* Save user's category choice to local storage */
function saveCategory(category) {
  localStorage.setItem(STORAGE_KEYS.CATEGORY, category);
}

/* Save selected products to local storage */
function saveSelectedProducts() {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PRODUCTS, JSON.stringify(selectedProducts));
}

/* Save chat history to local storage */
function saveChatHistory() {
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, chatWindow.innerHTML);
}

/* Update the selected products display */
function updateSelectedProductsDisplay() {
  const selectedProductsHeader = document.querySelector('.selected-products h2');
  
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = '<p style="color: #ccc;">No products selected yet</p>';
    selectedProductsHeader.innerHTML = 'Selected Products';
    return;
  }
  
  /* Update header to show count */
  selectedProductsHeader.innerHTML = `Selected Products <span class="selected-count">${selectedProducts.length}</span>`;
  
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product, index) => `
        <div class="selected-product-item">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-details">
            <div class="product-name">${product.name}</div>
            <div class="product-brand">${product.brand}</div>
          </div>
          <button class="remove-btn" onclick="removeSelectedProduct(${index})">
            Remove
          </button>
        </div>
      `
    )
    .join("");
}

/* Toggle product selection (add/remove) */
function toggleProductSelection(product) {
  const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
  
  if (isAlreadySelected) {
    /* Remove from selection */
    selectedProducts = selectedProducts.filter(p => p.id !== product.id);
  } else {
    /* Add to selection */
    selectedProducts.push(product);
  }
  
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  
  /* Update the current product display to reflect selection state */
  updateProductCardDisplay(product.id);
}

/* Update a specific product card's display state */
function updateProductCardDisplay(productId) {
  const productCard = document.querySelector(`[data-product-id="${productId}"]`);
  if (!productCard) return;
  
  const isSelected = selectedProducts.some(p => p.id === productId);
  const button = productCard.querySelector('button');
  
  if (isSelected) {
    productCard.classList.add('selected');
    button.classList.add('selected');
    button.textContent = '✓ Selected';
  } else {
    productCard.classList.remove('selected');
    button.classList.remove('selected');
    button.textContent = 'Add to Selection';
  }
}

/* Remove product from selected list */
function removeSelectedProduct(index) {
  const removedProduct = selectedProducts[index];
  selectedProducts.splice(index, 1);
  saveSelectedProducts();
  updateSelectedProductsDisplay();
  
  /* Update the product card display if it's currently visible */
  if (removedProduct) {
    updateProductCardDisplay(removedProduct.id);
  }
}

/* Show initial placeholder until user selects a category */
function showInitialPlaceholder() {
  productsContainer.innerHTML = `
    <div class="placeholder-message">
      Select a category to view products
    </div>
  `;
}

/* Clear all stored user data */
function clearUserData() {
  localStorage.removeItem(STORAGE_KEYS.CATEGORY);
  localStorage.removeItem(STORAGE_KEYS.SELECTED_PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  
  // Reset UI
  categoryFilter.value = "";
  selectedProducts = [];
  chatWindow.innerHTML = "";
  showInitialPlaceholder();
  updateSelectedProductsDisplay();
  
  // Reset selected products header
  const selectedProductsHeader = document.querySelector('.selected-products h2');
  if (selectedProductsHeader) {
    selectedProductsHeader.innerHTML = 'Selected Products';
  }
}

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  
  /* Ensure each product has a unique ID for selection tracking */
  const products = data.products.map((product, index) => ({
    ...product,
    id: product.id || `product-${index}-${product.name.replace(/\s+/g, '-').toLowerCase()}`
  }));
  
  return products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => {
        const isSelected = selectedProducts.some(p => p.id === product.id);
        return `
          <div class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.brand}</p>
              <button onclick="toggleProductSelection(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                      class="${isSelected ? 'selected' : ''}"
                      data-product-id="${product.id}">
                ${isSelected ? '✓ Selected' : 'Add to Selection'}
              </button>
            </div>
          </div>
        `;
      }
    )
    .join("");
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;
  
  /* Save the selected category to local storage */
  saveCategory(selectedCategory);

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const userInput = document.getElementById("userInput").value;
  
  /* Add user message to chat window */
  chatWindow.innerHTML += `
    <div style="margin-bottom: 10px; padding: 10px; background: rgba(227, 165, 53, 0.1); border-radius: 4px;">
      <strong>You:</strong> ${userInput}
    </div>
  `;
  
  /* Add placeholder response */
  chatWindow.innerHTML += `
    <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
      <strong>Assistant:</strong> Connect to the OpenAI API for a response!
    </div>
  `;
  
  /* Save chat history and clear input */
  saveChatHistory();
  document.getElementById("userInput").value = "";
  
  /* Scroll to bottom of chat window */
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

/* Initialize the app by loading user preferences */
document.addEventListener("DOMContentLoaded", () => {
  loadUserPreferences();
});
