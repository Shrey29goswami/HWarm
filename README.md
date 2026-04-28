# 🏡 HomeSweetHome Invitations

A warm, interactive virtual tour and invitation system for your housewarming ceremony. This app allows you to send personalized WhatsApp invitations that lead guests through a "virtual home tour" with integrated RSVP and location mapping.

## 🌟 Features

- **Admin Dashboard**: Easily generate and send personalized WhatsApp invitations.
- **Interactive Door Entry**: A fun "tap to enter" 202 door animation to start the tour.
- **Virtual Room Tour**: Smooth, scroll-based navigation through different "rooms":
  - **The Grand Hall**: Welcome message and introduction.
  - **Dining Area**: Event details (Date & Time).
  - **Personal Space**: Heartfelt message.
  - **The Study**: Integrated RSVP buttons that respond via WhatsApp.
  - **The Balcony**: Integrated Google Maps for easy navigation.
- **Responsive Design**: Mobile-first approach for perfect viewing on any device.
- **Cinematic UI**: High-quality imagery with parallax-like scrolling and dark mode aesthetics.

## 🛠️ Tech Stack

- **React 19**
- **TypeScript**
- **Tailwind CSS** (v4)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **Vite** (Build Tool)

---

## 🚀 Local Setup Instructions

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 2. Installation

1. **Clone or Download** the project files to your local directory.
2. Open your terminal/command prompt and navigate to the project root:
   ```bash
   cd path/to/your/project
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### 3. Environment Configuration

1. Create a `.env` file in the root directory (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. (Optional) Add your `GEMINI_API_KEY` if you plan to extend with AI features, though the core invitiation system works without it.

### 4. Running the Development Server

Start the local development server:
```bash
npm run dev
```
Once the server starts, you can view the app at `http://localhost:3000`.

### 5. Building for Production

To create an optimized production build:
```bash
npm run build
```
The production files will be generated in the `dist/` folder.

---

## 📲 How to Use

1. **Host Dashboard**: On first load (Admin view), enter the Guest's Name and their WhatsApp Number (with country code, e.g., `919876543210`).
2. **Send Invitation**: Click "Send Invitation" to open WhatsApp with a pre-filled message containing a unique link for that guest.
3. **Guest Experience**: When the guest clicks the link, they see the "Door 202". Tapping it unlocks the virtual tour.
4. **RSVP**: In "The Study" section, guests can click "Accept" or "Reject", which sends a confirmation message back to the host via WhatsApp.

---

## 📍 Customization

To change the event details (Date, Time, Host Number, or Map Location), open `src/App.tsx` and update the constants at the top of the file:

```typescript
const HOST_NUMBER = "919876543210"; 
const EVENT_DATE = "10 May 2026";
const EVENT_TIME = "10:00 AM";
const MAP_URL = "https://maps.google.com/?q=YourLocation";
```

Enjoy your new home! ✨
