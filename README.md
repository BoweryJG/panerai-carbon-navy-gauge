# Panerai Navy SEALs Digital Watch - Sales Dashboard

A stunning digital replica of the Panerai Submersible Navy SEALs watch with integrated LED displays for real-time sales metrics.

## Features

- **Exact Digital Replica**: Faithful SVG recreation of the Panerai Navy SEALs watch with carbon fiber textures and gold accents
- **4 LED Display Windows**: Configurable displays at 12, 3, 6, and 9 o'clock positions
- **Real-time Data**: Connects to Supabase for live sales metrics updates
- **Customizable Metrics**: Choose from various sales KPIs for each display
- **Color Customization**: Set custom colors for each LED display
- **Fullscreen Mode**: Immersive dashboard view
- **Animated Watch Hands**: Functional clock with smooth second hand movement

## Quick Start

1. Open `index.html` in a modern web browser
2. Configure your Supabase credentials in the settings panel
3. Select which metrics to display in each LED window
4. Save configuration and watch your data update in real-time

## LED Display Positions

- **12 O'Clock**: Primary metric (Daily/Monthly Sales, Leads, etc.)
- **3 O'Clock**: Activity metric (Calls, Appointments, Revenue)
- **6 O'Clock**: Performance metric (Rank, Quota, Deal Size)
- **9 O'Clock**: Percentage gauge (Quota %, Efficiency, Progress)

## Supabase Setup

1. Create a table named `sales_metrics` with columns for each metric
2. Add your Supabase URL and anon key in the configuration panel
3. The watch will automatically subscribe to real-time updates

## Mock Data Mode

If Supabase is not configured, the watch runs in demo mode with simulated data updates every 5 seconds.

## Technologies Used

- Pure HTML5/CSS3/JavaScript (no frameworks)
- SVG for watch rendering
- Supabase for real-time data
- LocalStorage for configuration persistence

## Customization

The watch face can be further customized by modifying:
- `css/styles.css` - Visual styling and animations
- `js/config.js` - Add new metrics and formatters
- `js/watch.js` - Modify display logic and animations