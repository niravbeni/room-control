# Room Control App

A real-time room control system with iPad-friendly interface for controlling and displaying room states using Socket.IO.

## Features

- **Real-time Communication**: Socket.IO enables instant updates between controller and display
- **iPad Optimized**: Touch-friendly interface designed for tablet use
- **Multi-Device Support**: Controller on one device, display on another
- **4 Room Actions**: Top buttons for future functionality 
- **4 Room States**: Bottom buttons that change the display in real-time
- **Clean UI**: Modern design with hover effects and animations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Real-time**: Socket.IO
- **State Management**: Zustand
- **UI Components**: Custom components with Radix UI primitives

## Local Development

### Option 1: Standard Next.js (Recommended for Vercel deployment)
```bash
npm install
npm run dev
```
This runs on `http://localhost:3000` using Next.js API routes for Socket.IO.

### Option 2: Custom Server (Alternative)
```bash
npm install
npm run dev:server
```
This runs the custom server from `server.cjs` on `http://localhost:3000`.

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub** (already done):
   ```bash
   git remote add origin https://github.com/niravbeni/room-control.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project
   - Deploy with default settings

3. **Configuration**: 
   - The `vercel.json` file is already configured
   - Socket.IO uses API routes (`/api/socket`) for serverless compatibility

### Alternative: Railway/Render (For Custom Server)

If you prefer using the custom server setup:

1. **Railway**:
   - Connect your GitHub repo to Railway
   - Set start command: `npm run start:server`
   - Railway supports WebSocket connections

2. **Render**:
   - Connect your GitHub repo to Render
   - Set start command: `npm run start:server`
   - Choose "Web Service" type

## Usage

### Multi-Device Setup (Recommended)
1. **Device 1 (Controller)**: Open app → Select "Controller" tab
2. **Device 2 (Display)**: Open app → Select "Display" tab
3. **Real-time sync**: Press state buttons on controller to change display instantly

### Single Device
- Switch between Controller and Display tabs
- State changes reflect immediately when switching tabs

## Project Structure

```
room-control/
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   │   ├── Controller.tsx    # Main controller interface
│   │   ├── Display.tsx       # Display screen component
│   │   └── ui/              # Reusable UI components
│   ├── hooks/
│   │   └── useSocket.ts     # Socket.IO hook
│   ├── store/
│   │   └── useStore.ts      # Zustand state management
│   └── pages/api/
│       └── socket.js        # Socket.IO API route (Vercel)
├── server.cjs               # Custom server (alternative)
├── vercel.json             # Vercel configuration
└── package.json
```

## Environment Setup

No environment variables required for basic functionality.

For production, you may want to configure:
- `NEXT_PUBLIC_SOCKET_URL` for custom socket server URLs
- CORS settings in the socket configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices
5. Submit a pull request

## License

Private project - All rights reserved.
