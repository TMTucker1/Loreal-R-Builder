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
        const description = product.description || `${product.brand} ${product.name} - A quality product for your skincare routine.`;
        
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
            <div class="description-tooltip">
              <strong>${product.name}</strong><br>
              ${description}
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

/* Configuration for Cloudflare Worker */
const WORKER_CONFIG = {
  // Replace this with your deployed Cloudflare Worker URL
  WORKER_URL: 'https://aged-poetry-c41e.tmtucke2.workers.dev/'
};

/* Get the appropriate worker URL based on environment */
function getWorkerURL() {
  // Use development URL if running locally, otherwise use production
  return WORKER_CONFIG.WORKER_URL;
}

/* Send message to OpenAI via Cloudflare Worker */
async function sendMessageToOpenAI(message) {
  try {
    const response = await fetch(getWorkerURL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        selectedProducts: selectedProducts,
        userContext: {
          category: categoryFilter.value,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.message;
  } catch (error) {
    console.error('Error calling Cloudflare Worker:', error);
    throw error;
  }
}

/* Add loading state to chat window */
function showLoadingMessage() {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-message';
  loadingDiv.style.cssText = `
    margin-bottom: 10px; 
    padding: 10px; 
    background: rgba(255, 255, 255, 0.1); 
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  loadingDiv.innerHTML = `
    <strong>Assistant:</strong> 
    <div style="display: flex; gap: 2px;">
      <div style="width: 8px; height: 8px; background: #e3a535; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
      <div style="width: 8px; height: 8px; background: #e3a535; border-radius: 50%; animation: pulse 1.5s infinite 0.5s;"></div>
      <div style="width: 8px; height: 8px; background: #e3a535; border-radius: 50%; animation: pulse 1.5s infinite 1s;"></div>
    </div>
    <span>Thinking...</span>
  `;
  
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Remove loading message */
function removeLoadingMessage() {
  const loadingMessage = document.getElementById('loading-message');
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

/* Chat form submission handler with OpenAI integration */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const userInput = document.getElementById("userInput").value.trim();
  
  if (!userInput) {
    return;
  }
  
  /* Add user message to chat window */
  chatWindow.innerHTML += `
    <div style="margin-bottom: 10px; padding: 10px; background: rgba(227, 165, 53, 0.1); border-radius: 4px;">
      <strong>You:</strong> ${userInput}
    </div>
  `;
  
  /* Clear input and show loading */
  document.getElementById("userInput").value = "";
  showLoadingMessage();
  
  try {
    /* Send message to OpenAI via Cloudflare Worker */
    const assistantResponse = await sendMessageToOpenAI(userInput);
    
    /* Remove loading and add response */
    removeLoadingMessage();
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
        <strong>Assistant:</strong> ${assistantResponse}
      </div>
    `;
    
  } catch (error) {
    /* Remove loading and show error */
    removeLoadingMessage();
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 0, 59, 0.1); border-radius: 4px; border-left: 3px solid #ff003b;">
        <strong>Error:</strong> Sorry, I'm having trouble connecting to the AI service. Please try again or check if the Cloudflare Worker is properly configured.
      </div>
    `;
  }
  
  /* Save chat history and scroll to bottom */
  saveChatHistory();
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

/* Initialize the app by loading user preferences */
document.addEventListener("DOMContentLoaded", () => {
  loadUserPreferences();
  
  // Add event listener for Generate Routine button
  const generateRoutineBtn = document.getElementById("generateRoutine");
  if (generateRoutineBtn) {
    generateRoutineBtn.addEventListener("click", handleGenerateRoutine);
  }
});

/* Handle Generate Routine button click */
async function handleGenerateRoutine() {
  const generateBtn = document.getElementById("generateRoutine");
  
  if (selectedProducts.length === 0) {
    // Show message if no products selected
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 0, 59, 0.1); border-radius: 4px; border-left: 3px solid #ff003b;">
        <strong>Notice:</strong> Please select some products first before generating a routine.
      </div>
    `;
    saveChatHistory();
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }

  // Disable button and show loading state
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

  // Create a routine generation message
  const routineMessage = `Please create a personalized skincare routine using my selected products. Include the order of use, timing (morning/evening), and any specific tips for each product.`;
  
  // Add user message to chat window
  chatWindow.innerHTML += `
    <div style="margin-bottom: 10px; padding: 10px; background: rgba(227, 165, 53, 0.1); border-radius: 4px;">
      <strong>You:</strong> Generate a routine with my selected products
    </div>
  `;
  
  // Show loading
  showLoadingMessage();
  
  try {
    // Send message to OpenAI via Cloudflare Worker
    const assistantResponse = await sendMessageToOpenAI(routineMessage);
    
    // Remove loading and add response
    removeLoadingMessage();
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
        <strong>Your Personalized Routine:</strong><br>${assistantResponse.replace(/\n/g, '<br>')}
      </div>
    `;
    
  } catch (error) {
    // Remove loading and show error
    removeLoadingMessage();
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 0, 59, 0.1); border-radius: 4px; border-left: 3px solid #ff003b;">
        <strong>Error:</strong> Sorry, I'm having trouble generating your routine. Please try again or check if the Cloudflare Worker is properly configured.
      </div>
    `;
  } finally {
    // Re-enable button
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Routine';
  }
  
  // Save chat history and scroll to bottom
  saveChatHistory();
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
