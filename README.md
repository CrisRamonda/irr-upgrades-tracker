# IRR Upgrades Tracker

A mobile-first web application to track SafeHouse upgrades for the game **Incursion Red River**.

## Features

- **20 Upgrades** - Track all SafeHouse improvements (Intel, Stash, Generator, Gunsmith, Lightning, Repair, Terminal, Structure, Shooting Range, Mission Items)
- **Bidirectional Inventory System** - Mark items in the global inventory or directly in each upgrade card. Changes sync automatically.
- **Real-time Validation** - Upgrades show their status:
  - 🔴 **Locked** - Prerequisites not met
  - 🟡 **Available** - Prerequisites met, but missing items
  - 🟢 **Ready** - All requirements completed
- **Progress Filters** - Filter upgrades by category and show/hide by status (Ready/Locked)
- **Data Persistence** - Automatically saves progress to LocalStorage
- **Import/Export** - Share or backup your progress via JSON

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** - Dark tactical theme
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` folder, ready for deployment.

## Project Structure

```
src/
├── components/
│   ├── Layout/          # Header, TabNav
│   ├── Upgrades/        # UpgradeList, UpgradeCard
│   ├── Inventory/       # InventoryPanel
│   ├── Settings/        # SettingsPanel (Import/Export)
│   └── UI/              # Toast, Badge, ProgressBar
├── hooks/               # Custom React hooks
├── data/                # JSON data (upgrades.json)
├── App.jsx              # Main application
└── index.css            # Tailwind + custom styles
```

## How It Works

1. **Upgrades Tab** - View all upgrades in a grid layout. Each card shows:
   - Upgrade name and status badge
   - Progress bar
   - Prerequisites (other upgrades required)
   - Faction requirements (IGC, VLF, UICS levels)
   - Item checklist with quantities

2. **Inventory Tab** - View all unique items required across all upgrades. Shows:
   - Total quantity needed per item
   - How many upgrades require that item
   - Global checkbox to mark item as collected

3. **Settings Tab** - Manage your data:
   - **Export** - Copy progress to clipboard as JSON
   - **Import** - Paste JSON to restore progress
   - **Reset** - Clear all progress

## Data Structure

The app uses a JSON structure with:
- `upgrades` - Array of 20 upgrades with items, faction requirements, and prerequisites
- `items` - List of all unique items
- `factions` - List of factions (IGC, VLF, UICS, Player)

Each upgrade has:
- `id`, `name`, `category`, `tier`
- `requirements.items` - Array of required items with quantities
- `requirements.factions` - Faction level requirements
- `requirements.prerequisites` - Other upgrade IDs required

## License

MIT