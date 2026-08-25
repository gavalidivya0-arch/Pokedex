# Pokédex

A responsive, dynamic Pokédex web application built with the PokéAPI. Explore the world of Pokémon by searching for specific Pokémon by name or ID, or browse through the entire Pokédex.

## Features

*   **Search**: Find any Pokémon by name (e.g., "Pikachu") or Pokédex ID (e.g., "25"). Search is case-insensitive.
*   **Detailed Views**: View comprehensive data including the official sprite, types, height, weight, base stats, abilities, and a list of moves.
*   **Visual Stat Bars**: See visual representations of a Pokémon's base stats.
*   **Browsing & Pagination**: Browse through all Pokémon using a paginated grid.
*   **Performance**: Implements simple in-memory caching to avoid redundant API calls and speed up navigation.
*   **Responsive Design**: A modern layout that works seamlessly across desktop, tablet, and mobile devices.
*   **Error Handling**: Graceful error messages for invalid searches or network issues.

## Technologies

*   HTML5 (Semantic Structure)
*   CSS3 (Vanilla CSS, CSS Grid/Flexbox, Custom Properties)
*   JavaScript (ES6+, Vanilla JS, Async/Await, Fetch API)
*   [PokéAPI](https://pokeapi.co/) (Data source)

## API Endpoints Used

This project relies on the official PokéAPI:

*   **Pokémon Details**: `GET https://pokeapi.co/api/v2/pokemon/{id_or_name}/`
    *   Example: `https://pokeapi.co/api/v2/pokemon/pikachu`
*   **Paginated List**: `GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`
    *   Used for the browsing grid at the bottom of the page.

## How to Run

Since this is a vanilla frontend application with no build steps or backend required, running it is very straightforward.

### Method 1: Local Server (Recommended)
Using a local server prevents potential CORS issues with the Fetch API.
1. Clone or download this repository.
2. Navigate to the project folder in your terminal.
3. Run a local development server. For example, using Python:
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js `serve` package:
   ```bash
   npx serve .
   ```
4. Open your browser and navigate to `http://localhost:8000` (or the port specified by your server).

### Method 2: Direct Open
1. Open the folder containing the project files.
2. Double-click on `index.html` to open it in your default web browser. 

## Learning Outcomes

This project demonstrates the following web development concepts:

*   Consuming RESTful APIs using the `fetch` API.
*   Managing asynchronous operations with `async`/`await`.
*   Parsing and handling complex, nested JSON data structures.
*   Implementing pagination for large datasets.
*   Dynamic DOM manipulation using vanilla JavaScript.
*   Handling loading states and error states gracefully.
*   Building responsive UI components without external CSS frameworks.
*   Implementing basic client-side data caching.
