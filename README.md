# LLM Lab Frontend

This is the frontend application for the LLM Lab - a full-stack web application for experimenting with Large Language Model parameters.

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Architecture

- **Framework**: Next.js 15 with TypeScript
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS
- **API Integration**: Axios
- **Charts**: Recharts

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://genai-labs-backend.onrender.com
```

## 📦 Features

- **Experiment Creation**: Input prompts and parameter ranges
- **Response Generation**: Multiple LLM responses with different parameters
- **Quality Metrics**: Custom programmatic quality evaluation
- **Data Visualization**: Interactive charts and analytics
- **Export Functionality**: Download experiments as CSV
- **Responsive Design**: Mobile-friendly interface

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.