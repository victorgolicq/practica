# Node.js & SQLite Task Manager

A simple, yet powerful task management application inspired by Jira. This project features a backend built with Node.js and Express, using a lightweight SQLite database for data persistence. It includes secure user authentication and full CRUD (Create, Read, Update, Delete) functionality for tasks.

## Features

-   **Secure User Authentication**: User registration and login system using JSON Web Tokens (JWT). Passwords are securely hashed with `bcrypt`.
-   **Private Tasks**: Each user can only access and manage their own tasks.
-   **Full CRUD for Tasks**: Create, read, update, and delete tasks through a RESTful API.
-   **Task Management**:
    -   Track task status (e.g., 'To Do', 'In Progress', 'Done').
    -   Assign priority levels to easily sort important tasks.
    -   Set and monitor deadlines.
-   **RESTful API**: A well-defined API that can be easily consumed by any frontend framework (React, Vue, Svelte, etc.) or client.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: SQLite
-   **Authentication**: JSON Web Tokens (`jsonwebtoken`)
-   **Password Hashing**: `bcrypt`
-   **Middleware**: `cors` for handling Cross-Origin Resource Sharing.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/en/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation & Setup

Follow these steps to get the project up and running on your local machine.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/task-manager.git](https://github.com/your-username/task-manager.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd task-manager
    ```

3.  **Install the dependencies:**
    ```bash
    npm install
    ```

4.  **Start the server:**
    ```bash
    node index.js
    ```

The server will start on `http://localhost:3000` by default. Upon the first run, a `tasks.db` file will be automatically created in the root directory to store all the data.

## API Endpoints

The following are the API endpoints available. "Protected" endpoints require a valid JWT in the `Authorization` header.

### Authentication

| Method | Endpoint      | Description                               | Protected |
| :----- | :------------ | :---------------------------------------- | :-------- |
| `POST` | `/api/register` | Registers a new user.                     | No        |
| `POST` | `/api/login`    | Logs in a user and returns a JWT.         | No        |

### Tasks

| Method   | Endpoint        | Description                                       | Protected |
| :------- | :-------------- | :------------------------------------------------ | :-------- |
| `GET`    | `/api/tasks`      | Retrieves all tasks for the logged-in user.       | **Yes** |
| `POST`   | `/api/tasks`      | Creates a new task for the logged-in user.        | **Yes** |
| `PUT`    | `/api/tasks/:id`  | Updates an existing task by its ID.               | **Yes** |
| `DELETE` | `/api/tasks/:id`  | Deletes a task by its ID.                         | **Yes** |

#### How to use protected endpoints:

When making a request to a protected endpoint, include the JWT in the request header like this:
