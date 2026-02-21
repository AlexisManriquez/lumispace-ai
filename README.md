# LumiSpace PoC

LumiSpace is an advanced 3D room controller that leverages the **Gemini 2.5/3.0 Multimodal Live API** for real-time voice and vision interactions.

## Key Features
- **Real-time 3D Environment**: Interactive room using React Three Fiber.
- **AI Voice Commands**: Direct voice control via Gemini Live API (Native Audio).
- **Environment Manipulation**: Voice-activated tool calling for changing time of day, floor materials, and wall colors.
- **Premium UI**: Modern glassmorphism design with LumisAI branding.

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key with access to the Live API.

### Installation
1. Clone the repository.
2. Create a `.env.local` file with your key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
   ```
3. Run the development server:
   ```bash
   npm install
   npm run dev
   ```

### Mobile Access
To use the microphone on a mobile device, the app must be served over **HTTPS** or accessed via `localhost`. If testing on a local network, use a tunnel like `ngrok` or enable the relevant Chrome flag for insecure origins.

## Tech Stack
- **Framework**: Next.js (App Router)
- **3D Engine**: Three.js / React Three Fiber
- **State Management**: Zustand
- **AI**: Google Gemini Multimodal Live API
