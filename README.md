# Car Dealership API

This is a RESTful API for managing car dealerships, users, and deals. It provides endpoints for user authentication, viewing cars, adding vehicles, managing dealership inventory, and retrieving deal information.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT authentication

## Getting Started

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Start the server using `npm start`.

## Available Endpoints

- `/login`: User authentication
- `/logout`: Logout and invalidate token
- `/cars`: Retrieve all cars
- `/cars/:dealershipId`: Retrieve cars in a specific dealership
- `/add-vehicle`: Add a new vehicle
- `/deals/:dealershipId`: Retrieve deals from a specific dealership
- `/dealerships/cars`: Add a car to a dealership
- `/dealerships/deals`: Add a deal to a dealership
- `/dealerships/:dealershipId/sold-vehicles`: Retrieve sold vehicles from a specific dealership
- `/api-docs`: Display API documentation
