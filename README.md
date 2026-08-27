<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg" alt="Pokémon Logo" width="400"/>
  <h1>Pokédex Web Application</h1>
  <p>A responsive, dynamic Pokédex web application built with the PokéAPI.</p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/API-Pok%C3%A9API-red?style=for-the-badge" alt="PokeAPI" />
  </p>
</div>

---

## 📖 About The Project

Explore the world of Pokémon! This project is a complete front-end web application that allows users to search for specific Pokémon by name or ID, or simply browse through the entire Pokédex. It directly consumes data from the official [PokéAPI](https://pokeapi.co/), displaying rich, detailed information for every entry.

## ✨ Features

- 🔍 **Search Functionality**: Find any Pokémon by name (e.g., "Pikachu") or Pokédex ID (e.g., "25"). Search is case-insensitive and resilient to extra whitespace.
- 📊 **Detailed Views**: View comprehensive data including:
  - Official sprite artwork & 3D models
  - Element Types (dynamically color-coded)
  - Height & Weight
  - Base stats (with animated progress bars)
  - Abilities (including hidden abilities)
  - Move list
- 📱 **Responsive Design**: A modern, flex/grid-based layout that works seamlessly across desktop, tablet, and mobile devices.
- 🗂️ **Browsing & Pagination**: Browse through all Pokémon using a paginated grid layout.
- ⚡ **Performance Optimization**: Implements an in-memory caching mechanism to avoid redundant API calls and speed up navigation.
- 🛡️ **Error Handling**: Graceful error messages and UI states for invalid searches or network issues.

## 🛠️ Technologies Used

*   **HTML5**: Semantic Structure
*   **CSS3**: Vanilla CSS, CSS Grid/Flexbox, Custom CSS Variables (`:root`)
*   **JavaScript**: ES6+, Vanilla JS, Async/Await, Fetch API

## 🔌 API Endpoints

This project relies on the following official PokéAPI endpoints:

| Endpoint | Description |
| :--- | :--- |
| `GET /api/v2/pokemon/{id_or_name}/` | Fetches detailed data for a specific Pokémon. Example: `/pokemon/pikachu` |
| `GET /api/v2/pokemon?limit=20&offset=0` | Fetches a paginated list of Pokémon for the browsing grid. |

## 🚀 How to Run Locally

Since this is a vanilla frontend application with no build steps or backend required, running it is very straightforward.

### Method 1: Local Server (Recommended)
Using a local server is recommended as it prevents potential CORS (Cross-Origin Resource Sharing) issues with the Fetch API.

1. Clone or download this repository.
2. Navigate to the project folder in your terminal.
3. Run a local development server:
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
   - Or using Node.js:
     ```bash
     npx serve .
     ```
4. Open your browser and navigate to `http://localhost:8000` (or the port specified by your server).

### Method 2: Direct Open
1. Open the folder containing the project files.
2. Double-click on `index.html` to open it directly in your default web browser.

## 🧠 Learning Outcomes

Building this project solidifies the following web development concepts:
- ✅ Consuming RESTful APIs using the modern `fetch` API.
- ✅ Managing asynchronous operations and promises with `async`/`await`.
- ✅ Parsing and handling complex, nested JSON data structures.
- ✅ Implementing pagination for large datasets.
- ✅ Dynamic DOM manipulation using pure vanilla JavaScript.
- ✅ Handling loading states and error states gracefully in the UI.
- ✅ Building responsive UI components without relying on external CSS frameworks.
- ✅ Implementing basic client-side data caching (`Map`).
