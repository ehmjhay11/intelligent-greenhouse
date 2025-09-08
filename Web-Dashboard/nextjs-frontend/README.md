# Next.js Greenhouse Dashboard

A modern, performance-optimized dashboard for greenhouse monitoring built with Next.js.

## Features

- 🌱 Real-time sensor monitoring
- 📊 Interactive charts and data visualization  
- 🔧 Device management
- 🚨 Alert system
- 📈 Historical data analysis
- 📝 Report generation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Deployment**: Vercel (zero-config)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for Vercel deployment:

```bash
npm run build
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_BASE=http://localhost:3003/api
```

For production, set `NEXT_PUBLIC_API_BASE` to your backend URL.

## Migration from CRA

This Next.js version provides:

- ⚡ Better performance with automatic optimizations
- 🚀 Zero-config Vercel deployment  
- 📱 Better mobile experience
- 🔄 Automatic code splitting
- 💡 Built-in API routes for backend proxying
