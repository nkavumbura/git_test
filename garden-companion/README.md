# Garden Companion

A cross-platform (iOS, Android and web) gardening assistant built with Expo and React Native.

- **My garden**: add the plants you grow, either by typing the name or by taking a photo for identification.
- **Tasks**: each month the app lists what your plants need (sowing, planting out, feeding, pruning, deadheading, harvesting and so on), with a preview of the next month.
- **What to grow**: suggestions for the vegetable patch and the flower garden that can be started this month or next.
- **Settings**: Northern or Southern Hemisphere, so the timings line up with your seasons.

## Getting started

```bash
npm install
npm start          # then press i (iOS simulator), a (Android) or w (web)
```

Install **Expo Go** on your phone and scan the QR code to run the app on a real device.

### Photo identification

Photo identification uses the [Pl@ntNet API](https://my.plantnet.org). Create a free account, generate an API key, and put it in a `.env.local` file:

```
EXPO_PUBLIC_PLANTNET_API_KEY=your-key-here
```

Without a key the app still works; you can type plant names instead.

> `EXPO_PUBLIC_` values are compiled into the app. Before a public release, route identification through a small backend that holds the key.

## Checks

```bash
npm test           # unit tests (Jest)
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run format     # Prettier
```

## Project layout

```
src/
  app/                 Screens (Expo Router; every file is a route)
    (tabs)/            Tasks, My garden, What to grow, Settings
    add-plant.tsx      Add a plant by name or photo
    plant/[id].tsx     Plant details and care calendar
  components/          Shared UI
  data/                Plant catalogue with care calendars
  domain/              Pure logic: seasons, task generation, suggestions, search
  services/            Plant identification (Pl@ntNet)
  state/               Garden state, saved on the device
```

## How tasks are generated

Each plant in the catalogue has a care calendar: a list of activities (for example *prune*, *feed*, *harvest*) and the months they apply in. The months are written for a temperate Northern Hemisphere climate and shifted by six months for the Southern Hemisphere. Every month the app turns the calendars of the plants in your garden into a checklist.

Steps that only apply when a plant is first established (for example planting a peony) appear in suggestions, but are not repeated as tasks for plants already in the garden.

The care calendar is general guidance. It does not yet account for local frost dates or climate zones.

## Status and next steps

This is an early working version. Planned next steps:

- Region- and climate-aware timings (frost dates, climate zone), not only hemisphere
- A larger plant catalogue, possibly from an external plant database
- Copy photos into app storage so they persist (they currently point at the picker's cache)
- Reminders through push notifications
- Optional account and cloud sync between devices
