# Project 9: L'Oréal Routine Builder

L'Oréal is expanding what's possible with AI, and now your chatbot is getting smarter. This week, you'll upgrade it into a product-aware routine builder with OpenAI integration via Cloudflare Workers.

Users will be able to browse real L'Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.

## Features

- **Product Selection**: Browse and select from real L'Oréal products
- **Local Storage**: Remembers user preferences and selections
- **AI Chat Integration**: Powered by OpenAI GPT-4o via Cloudflare Workers
- **Hover Tooltips**: Product descriptions on hover
- **Responsive Design**: Works on desktop and mobile
- **Dark Theme**: Modern black and gold L'Oréal branding

## OpenAI Integration

This project uses Cloudflare Workers to securely connect to the OpenAI API without exposing API keys in the frontend. The AI provides personalized skincare advice based on selected products.

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Deploy Cloudflare Worker**:
   ```bash
   npm run deploy
   ```

3. **Set OpenAI API Key**:
   ```bash
   wrangler secret put OPENAI_API_KEY
   ```

4. **Start Development Server**:
   ```bash
   npm start
   ```

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Cloudflare Workers
- **AI**: OpenAI GPT-4o
- **Data**: JSON product catalog
- **Storage**: localStorage for user preferences

## File Structure

```
├── index.html              # Main HTML file
├── script.js               # Frontend JavaScript
├── style.css               # Styling and animations
├── products.json           # Product catalog
├── cloudflare-worker.js    # Cloudflare Worker code
├── wrangler.toml           # Worker configuration
├── package.json            # Dependencies and scripts
└── DEPLOYMENT_GUIDE.md     # Deployment instructions
```

## Security

- API keys are stored securely in Cloudflare Workers
- CORS headers configured for security
- No sensitive data exposed in frontend code
- Rate limiting can be added for production useoject 9: L'Oréal Routine Builder
L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder. 

Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.