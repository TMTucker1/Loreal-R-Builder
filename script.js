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
          <img src="${product.image}" alt="Image of ${product.name} by ${product.brand} for L'Oréal routine" aria-label="Image of ${product.name} by ${product.brand}">
          <div class="product-details">
            <div class="product-name">${product.name}</div>
            <div class="product-brand">${product.brand}</div>
          </div>
          <button class="remove-btn" onclick="removeSelectedProduct(${index})" aria-label="Remove ${product.name} by ${product.brand} from selected products">
            <span aria-hidden="true">Remove</span>
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
  // Sort products alphabetically by name
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
  productsContainer.innerHTML = sortedProducts
    .map(
      (product) => {
        const isSelected = selectedProducts.some(p => p.id === product.id);
        const description = product.description || `${product.brand} ${product.name} - A quality product for your skincare routine.`;
        return `
          <div class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
            <img src="${product.image}" alt="Image of ${product.name} by ${product.brand} for L'Oréal routine" aria-label="Image of ${product.name} by ${product.brand}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.brand}</p>
              <button onclick="toggleProductSelection(${JSON.stringify(product).replace(/\"/g, '&quot;')})" 
                      class="${isSelected ? 'selected' : ''}"
                      data-product-id="${product.id}"
                      aria-label="${isSelected ? 'Remove ' + product.name + ' by ' + product.brand + ' from selection' : 'Add ' + product.name + ' by ' + product.brand + ' to selection'}">
                <span aria-hidden="true">${isSelected ? '✓ Selected' : 'Add to Selection'}</span>
              </button>
            </div>
            <div class="description-tooltip" aria-label="Description for ${product.name} by ${product.brand}">
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

/* Get the Cloudflare Worker URL */
function getWorkerURL() {
  // Return the worker URL from our configuration
  return WORKER_CONFIG.WORKER_URL;
}

/* Send message to OpenAI via Cloudflare Worker */
async function sendMessageToOpenAI(message, selectedProducts = [], userContext = {}) {
  try {
    // Create enhanced message that includes product information
    let enhancedMessage = message;
    
    // If we have selected products, add them to the message content
    if (selectedProducts && selectedProducts.length > 0) {
      const productList = selectedProducts.map(product => 
        `• ${product.name} by ${product.brand} (Category: ${product.category})`
      ).join('\n');
      
      enhancedMessage = `${message}

MY SELECTED L'ORÉAL PRODUCTS:
${productList}

CONTEXT: I'm looking for expert advice on L'Oréal products. Please focus on L'Oréal's quality, innovation, and benefits. Feel free to recommend additional L'Oréal products that would enhance my routine and explain why they work well together.

Please use these specific L'Oréal products in your response and provide L'Oréal-focused recommendations.`;
    }
    
    // Create the request data in the format your Cloudflare Worker expects
    // Most OpenAI workers expect a "messages" array, not a single "message"
    const requestData = {
      messages: [
        {
          role: "system",
          content: "You are a L'Oréal beauty expert and product specialist. Focus on L'Oréal products, their benefits, and quality. When users ask about routines or products, always emphasize L'Oréal's expertise and recommend specific L'Oréal products. Be knowledgeable about skincare, haircare, makeup, and fragrance. Always maintain a professional, helpful tone that reflects L'Oréal's premium brand image."
        },
        {
          role: "user",
          content: enhancedMessage
        }
      ],
      selectedProducts: selectedProducts,
      userContext: userContext
    };

    // Get the correct worker URL
    const workerURL = getWorkerURL();

    // Log what we're sending (helpful for debugging)
    console.log('📤 Sending request to Cloudflare Worker:');
    console.log('🔗 URL:', workerURL);
    console.log('📦 Request data:', requestData);
    console.log('🛍️ Selected products count:', selectedProducts.length);
    console.log('📝 Enhanced message:', enhancedMessage);
    
    // Make the API call using fetch
    const response = await fetch(workerURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    // Log the response status
    console.log('📥 Response status:', response.status);
    console.log('📋 Response headers:', response.headers);

    // Check if the request was successful
    if (!response.ok) {
      // Try to get the error details from the response
      let errorDetails = 'No error details available';
      
      try {
        const errorText = await response.text();
        console.log('❌ Error response body:', errorText);
        
        // Try to parse it as JSON first
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error || errorJson.message || errorText;
        } catch (parseError) {
          // If not JSON, use the raw text
          errorDetails = errorText;
        }
      } catch (readError) {
        console.log('❌ Could not read error response:', readError);
      }

      // Create a helpful error message for students
      const errorMessage = `HTTP error! status: ${response.status} - ${errorDetails}`;
      console.log('❌ Full error message:', errorMessage);
      
      // Show user-friendly error in chat (using our existing chat format)
      addErrorMessageToChat(response.status, errorDetails);
      
      throw new Error(errorMessage);
    }

    // If successful, parse the response
    const data = await response.json();
    console.log('✅ Success! Response data:', data);
    
    // Extract the actual message content from OpenAI's response format
    // OpenAI returns: { choices: [{ message: { content: "actual message" } }] }
    let messageContent = '';
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      // This is the standard OpenAI API response format
      messageContent = data.choices[0].message.content;
    } else if (data.response) {
      // Some workers might return it as 'response'
      messageContent = data.response;
    } else if (data.message) {
      // Some workers might return it as 'message'
      messageContent = data.message;
    } else if (data.content) {
      // Some workers might return it as 'content'
      messageContent = data.content;
    } else {
      // If we can't find the message in expected places, return the whole response
      messageContent = JSON.stringify(data);
    }
    
    console.log('📝 Extracted message content:', messageContent);
    return messageContent;
    
  } catch (error) {
    console.error('❌ Error calling Cloudflare Worker:', error);
    throw error;
  }
}

/* Add error message to chat window */
function addErrorMessageToChat(statusCode, errorDetails) {
  const errorExplanation = getErrorExplanation(statusCode);
  
  chatWindow.innerHTML += `
    <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 0, 59, 0.1); border-radius: 4px; border-left: 3px solid #ff003b;">
      <strong>API Error (${statusCode}):</strong><br>
      ${errorExplanation}<br><br>
      <strong>Details:</strong> ${errorDetails}
    </div>
  `;
  
  // Save chat history and scroll to bottom
  saveChatHistory();
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Helper function to explain different error codes to students */
function getErrorExplanation(statusCode) {
  switch (statusCode) {
    case 400:
      return `**Bad Request**: The server couldn't understand our request. This usually means:\n• Missing required fields\n• Wrong data format\n• Invalid JSON structure\n• Check your Cloudflare Worker expects the data we're sending`;
    case 401:
      return `**Unauthorized**: API key is missing or invalid. Check your OpenAI API key in the Cloudflare Worker.`;
    case 403:
      return `**Forbidden**: API key doesn't have permission or quota exceeded.`;
    case 404:
      return `**Not Found**: The Cloudflare Worker URL might be wrong.`;
    case 429:
      return `**Too Many Requests**: You're hitting rate limits. Wait a moment and try again.`;
    case 500:
      return `**Internal Server Error**: Something went wrong on the server side.`;
    default:
      return `**Unknown Error**: Status code ${statusCode}. Check the details below.`;
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
    <strong>L'Oréal Expert:</strong> 
    <div style="display: flex; gap: 2px;">
      <div style="width: 8px; height: 8px; background: #e3a535; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
      <div style="width: 8px; height: 8px; background: #e3a535; border-radius: 50%; animation: pulse 1.5s infinite 0.5s;"></div>
      <div style="width: 8px; height: 8px; background: #e3a535; border-radius: 50%; animation: pulse 1.5s infinite 1s;"></div>
    </div>
    <span>Analyzing your L'Oréal routine...</span>
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
    const userContext = {
      category: categoryFilter.value || 'general',
      timestamp: new Date().toISOString(),
      role: 'loreal_expert'
    };
    
    const assistantResponse = await sendMessageToOpenAI(userInput, selectedProducts, userContext);
    
    /* Remove loading and add response */
    removeLoadingMessage();
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
        <strong>L'Oréal Expert:</strong> ${assistantResponse}
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

  // Create a detailed routine generation message with product information
  const routineMessage = `As a L'Oréal beauty expert, please create a personalized beauty routine using my selected L'Oréal products.

REQUIREMENTS:
- Focus specifically on L'Oréal products and their benefits
- Show the correct order of application for my selected products
- Specify timing (morning routine, evening routine, or both)
- Include specific tips for each L'Oréal product I've selected
- Recommend additional L'Oréal products that would complement my routine
- Explain why these L'Oréal products work well together
- Add any important considerations or warnings
- Make it practical and easy to follow

Please act as a L'Oréal product specialist and create a complete routine that showcases the quality and benefits of L'Oréal products.`;
  
  // Add user message to chat window
  chatWindow.innerHTML += `
    <div style="margin-bottom: 10px; padding: 10px; background: rgba(227, 165, 53, 0.1); border-radius: 4px;">
      <strong>You:</strong> Generate a routine with my selected products
    </div>
  `;
  
  // Show loading
  showLoadingMessage();
  
  try {
    // Send message to OpenAI via Cloudflare Worker with selected products and context
    const userContext = {
      category: categoryFilter.value || 'general',
      timestamp: new Date().toISOString()
    };
    
    const assistantResponse = await sendMessageToOpenAI(routineMessage, selectedProducts, userContext);
    
    // Remove loading and add response
    removeLoadingMessage();
    chatWindow.innerHTML += `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
        <strong>L'Oréal Expert - Your Personalized Routine:</strong><br>${assistantResponse.replace(/\n/g, '<br>')}
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
