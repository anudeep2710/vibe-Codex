# GenAI Code Agent - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/genai-code-agent)

### Option 2: Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variable**
   
   You need to set your Gemini API key:
   
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   ```
   
   When prompted:
   - Paste your Gemini API key
   - Select "Production, Preview, and Development"

4. **Deploy**
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the generated key

### Vercel Dashboard Setup

If deploying via the Vercel dashboard:

1. Import your Git repository
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: Your Gemini API key

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/genai-code-agent.git
   cd genai-code-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

5. **Build for production**
   ```bash
   npm run build
   ```
   
   Preview the production build:
   ```bash
   npm run preview
   ```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Your Google Gemini API key |

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check that `VITE_GEMINI_API_KEY` is set correctly
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### API Key Not Working
- Verify the API key is valid on [Google AI Studio](https://aistudio.google.com/app/apikey)
- Ensure the environment variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the development server after changing environment variables

### IndexedDB Not Working
- Ensure your browser supports IndexedDB
- Check browser console for errors
- Try clearing browser data and refreshing

## Custom Domain

To add a custom domain on Vercel:

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Performance Optimization

The production build includes:
- Code splitting for optimal loading
- Tree shaking to remove unused code
- Minification and compression
- Optimized chunk sizes
- Console logs removed in production

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secret
- Use environment variables for all sensitive data
- The `.gitignore` file is configured to exclude environment files

## Support

If you encounter issues:
1. Check the [GitHub Issues](https://github.com/YOUR_USERNAME/genai-code-agent/issues)
2. Review the Vercel deployment logs
3. Ensure all environment variables are set correctly

---

**Happy Coding! 🚀**
