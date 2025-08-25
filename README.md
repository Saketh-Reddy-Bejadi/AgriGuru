# AgriGuru

AgriGuru is a comprehensive web application designed to assist farmers and agricultural enthusiasts in making informed decisions. It provides features like farm management, weather forecasts, crop recommendations, and market information.

## About The Project

This project is a full-stack application with a React frontend and a Node.js backend. It aims to provide a user-friendly platform for farmers to manage their farms, get personalized recommendations, and stay updated with the latest market and weather data.

## Features

*   **User Authentication:** Secure user registration and login system.
*   **Dashboard:** A centralized view of all your farms and key information.
*   **Farm Management:** Add, view, and manage your farms.
*   **Weather Forecast:** Get real-time weather updates for your location.
*   **Crop Recommendations:** AI-powered crop recommendations based on your farm's data.
*   **Market Prices:** Stay informed about the latest crop prices in the market.
*   **Crop Diagnosis:** (Coming Soon) An AI-powered tool to diagnose crop diseases from images.
*   **Profile Management:** Update your personal information.

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

*   Node.js and npm
*   MongoDB

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/AgriGuru.git
    ```
2.  **Install NPM packages for the server**
    ```sh
    cd AgriGuru/server
    npm install
    ```
3.  **Install NPM packages for the client**
    ```sh
    cd ../client
    npm install
    ```
4.  **Set up environment variables**

    Create a `.env` file in both the `client` and `server` directories and add the necessary environment variables.

    **Server `.env`**
    ```
    MONGODB_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    PORT=3000
    ```

    **Client `.env`**
    ```
    VITE_API_URL=http://localhost:3000/api
    ```

## Usage

1.  **Start the server**
    ```sh
    cd server
    npm start
    ```
2.  **Start the client**
    ```sh
    cd client
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

## API Endpoints

The backend API provides the following endpoints:

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user.
*   `GET /api/users/me`: Get the current user's profile.
*   `PUT /api/users/me`: Update the current user's profile.
*   `GET /api/farms`: Get all farms for the current user.
*   `POST /api/farms`: Create a new farm.
*   `GET /api/weather`: Get weather data.
*   `POST /api/recommendations`: Get crop recommendations.
*   `GET /api/market`: Get market data.

## Technologies Used

*   **Frontend:**
    *   React
    *   Vite
    *   TypeScript
    *   Shadcn UI
    *   Tailwind CSS
*   **Backend:**
    *   Node.js
    *   Express.js
    *   MongoDB
    *   Mongoose
    *   JWT

## License

Distributed under the MIT License. See `LICENSE` for more information.
