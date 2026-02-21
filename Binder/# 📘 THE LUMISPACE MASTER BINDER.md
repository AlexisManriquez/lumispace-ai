
---

**Hackathon:** Google Gemini Live Agent Challenge
**Project Name:** LumiSpace (or Gemini Architect)
**Tagline:** A Real-Time, Multimodal 3D Spatial Design Agent.
**Target Track:** *UI Navigator* (Agents that control interfaces) or *Live Agents* (Voice/Vision).
**Deadline:** March 16/17, 2026 (Roughly 3.5 weeks remaining!)

---

## 🎯 SECTION 1: THE NORTH STAR (Why we win)
Traditional CAD software (AutoCAD, SketchUp) requires hundreds of hours to learn, and clients struggle to visualize blueprints. 
**Our Solution:** We are building an agent that completely replaces the "Text Box" with a live, 3D collaborative environment. 
To win, we must flawlessly demonstrate the 4 Modalities:
1.  **See:** The agent watches the user's webcam to scan physical material samples (e.g., a real tile swatch).
2.  **Hear:** The agent listens to the user's natural voice for spatial commands.
3.  **Speak:** The agent talks back with expert architectural advice.
4.  **Create:** The agent dynamically manipulates a live 3D web canvas based on the conversation and environmental physics (sunlight/shadows).

---

## 📋 SECTION 2: HACKATHON DELIVERABLES (The Goalposts)
*If we miss any of these, we are disqualified. If we nail them, we score maximum points.*

- **Core AI:** Use Google Gemini 2.0 (Multimodal Live API).
- **Public Code Repository:** Clean, documented GitHub repo.
- **Project Description:** Devpost write-up explaining the problem, solution, and business value (perfect for your supervisor's use case).
- **Architecture Diagram:** A clean flowchart showing how Gemini talks to Next.js and Google Cloud.
- **Proof of Cloud Deployment:** The app MUST be hosted on **Google Cloud**. (We will use Google Cloud Run). We need a screenshot/link to the console logs.
- **The Demo Video (< 4 Minutes):** The most important piece. 30% of the score. Must show real-time screen/voice/vision capture with NO mockups.

---

## 🏗️ SECTION 3: SYSTEM ARCHITECTURE
*This is what we will draw for the official Architecture Diagram submission.*

*   **Frontend / UI:** Next.js (React) + Tailwind CSS.
*   **3D Engine:** React Three Fiber (R3F) + Drei.
*   **AI Brain:** Gemini Multimodal Live API (via WebRTC standard).
*   **State Manager:** Zustand (The "Bridge" between AI Tool Calls and 3D Rendering).
*   **Infrastructure (GCP):** 
    *   *Google Cloud Run:* To host the Next.js Docker container.
    *   *Google Cloud Storage (Optional):* To store high-quality 3D textures (wood, marble, etc.).
    *   *Vertex AI Grounding (Optional/Bonus):* To map generated designs to real-world catalog prices.

---

## 🗺️ SECTION 4: DEVELOPMENT ROADMAP (Step-by-Step)

### ✅ Phase 1: The Foundation (COMPLETED)
- Initialize Next.js + React Three Fiber.
- Build 3D Canvas with dynamic lighting and textures.
- Connect Gemini Live API via WebSockets.
- Establish bidirectional audio and basic Function Calling (`change_environment`).

### 🚀 Phase 2: Vision & Multimodality (Our Next Task)
*Goal: Allow the AI to "See" physical objects.*
- Add a WebCam component to the UI that streams video frames to Gemini.
- Update the System Prompt: *"If the user holds up a material, identify its color and texture, and suggest applying it to the room."*
- Create a new tool: `apply_scanned_material(surface, hex_color, texture_type)`.
- Test: Hold up a red piece of paper, ask *"Can you paint the wall this color?"* -> The 3D wall turns red.

### 🧠 Phase 3: Spatial Logic & "UI Navigator" Features
*Goal: Make the Agent feel like a true software operator.*
- Expand the 3D Room: Add a kitchen island, cabinets, and a window.
- Add advanced tools: `add_window(wall_location)`, `change_cabinet_style(style)`.
- Implement collision/logic feedback (e.g., if you ask for a window on a wall that already has cabinets, Gemini should verbally say, *"I can't put a window there because of the cabinets, should I move them?"*).

### ☁️ Phase 4: Production & Google Cloud Deployment
*Goal: Secure the "Technical Implementation" points.*
- Containerize the Next.js app with Docker.
- Deploy to Google Cloud Run and secure an `https://` public URL.
- Polish the UI (Make it look like a sleek, premium SaaS product for home builders).

### 🎬 Phase 5: The Demo & Submission
*Goal: Secure the final 30% of the judging criteria.*
- Write the 4-minute video script (Problem -> Live Demo -> Architecture -> Business Value).
- Record a flawless, single-take demonstration of the app.
- Create the Devpost submission page and upload the Architecture Diagram.

---

## 🗣️ SECTION 6: THE SYSTEM PROMPT (Our AI's Personality)
*Keep refining this as we code. This is how we instruct Gemini to act.*

> "You are Lumi, an expert architectural and interior design AI agent. You are collaborating with a human user in real-time through a 3D interface. Your job is to listen to their design requests, analyze any physical materials they show you on camera, and use your tools to manipulate the 3D environment instantly. 
> Keep your verbal responses extremely concise, conversational, and professional. Never describe the code or the tools you are using. Simply say what you are doing, do it using your tools, and ask a follow-up question to guide the design process. Pay special attention to how natural light and materials interact."

---

### How to use this guide:
Whenever we start a new work session, we open this binder. We pick exactly one task from **Section 4: Development Roadmap**, build it, test it, check it off, and commit the code to GitHub.

### What is our next move?
Looking at the roadmap, we are officially starting **Phase 2: Vision & Multimodality**. 

Would you like to start by modifying our `LiveAgent.tsx` to turn on the user's webcam and stream those video frames to Gemini? (This is where it gets really fun!)