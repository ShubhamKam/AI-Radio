# AI-Radio

A news aggregation and audio playback application styled after Bloomberg, featuring AI-powered audio reading of articles.

## Project Structure

- `ai-radio/`: The Next.js application source code.
- `Dockerfile`: Configuration for containerizing the application.
- `project_plan.md`: Detailed project plan, stories, and roadmap.

## Getting Started

### Run with Docker

```bash
docker build -t ai-radio .
docker run -p 3000:3000 ai-radio
```

### Run Locally

```bash
cd ai-radio
npm install
npm run dev
```
