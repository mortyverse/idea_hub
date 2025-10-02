# Project Overview

This project is a web application called "Idea Hub," designed for sharing and collaboratively developing ideas. It functions as an open-source platform where users can post ideas, comment on them, and evolve them, similar to how developers use GitHub for code.

## Technologies

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** PHP 7.4+
*   **Database:** MySQL 5.7+

## Architecture

The application follows a traditional client-server architecture:

*   **Client-side (Frontend):** The frontend is built with vanilla HTML, CSS, and JavaScript. It uses a component-based approach, where pages are dynamically assembled from smaller, reusable HTML components loaded via JavaScript. The client-side JavaScript handles user interactions, form validation, and communication with the backend API.
*   **Server-side (Backend):** The backend is a RESTful API built with PHP. It handles business logic, data processing, and database interactions. API endpoints are provided for functionalities like creating, reading, updating, and deleting ideas, comments, and tags.
*   **Database:** A MySQL database stores all the application data. The schema is well-defined with tables for ideas, tags, comments, users, and their relationships.

# Building and Running

This project does not have a conventional build process (like with Node.js or other compiled languages). It's a classic PHP application that runs on a web server.

## Running the Application

To run this project, you need a web server with PHP and MySQL. A typical setup would be a LAMP (Linux, Apache, MySQL, PHP) or WAMP (Windows, Apache, MySQL, PHP) stack.

1.  **Set up a web server:** Install Apache, PHP, and MySQL.
2.  **Database Setup:**
    *   Create a new MySQL database (e.g., `idea_hub`).
    *   Import the database schema from `sql/schema.sql`.
    *   (Optional) Import sample data from `sql/sample_data.sql`.
3.  **Configuration:**
    *   The `README.md` mentions a `config/database.php` file for database connection settings. You will need to create this file and add your database credentials.
4.  **Deploy:** Copy the project files to the web root of your server (e.g., `/var/www/html` on Linux or `C:\xampp\htdocs` on Windows).
5.  **Access:** Open a web browser and navigate to the server's address (e.g., `http://localhost/idea_hub`).

## Key Files for Configuration

*   `config/database.php` (You need to create this): For database connection settings.
*   `sql/schema.sql`: The database schema.

# Development Conventions

*   **Component-Based Structure:** The frontend uses a component-based architecture. Reusable UI elements are defined in separate HTML files within the `components/` directory and are likely loaded into the main pages dynamically using JavaScript.
*   **API-Driven:** The frontend and backend communicate via a RESTful API. The JavaScript code in the `assets/js/` directory makes `fetch` requests to the PHP scripts in the `api/` directory.
*   **File Naming Convention:** There's a clear and consistent naming convention that links pages, CSS, JavaScript, and API files. For example, `pages/ideas/list.html` is associated with `assets/css/ideas/list.css`, `assets/js/ideas/list.js`, and `api/ideas/list.php`.
*   **Database Schema:** The `sql/schema.sql` file is the single source of truth for the database structure. It includes table definitions, indexes, and triggers.
*   **No Dependencies/Frameworks:** The project appears to be written in vanilla PHP, JavaScript, and CSS without any major frameworks like Laravel, Symfony, React, or Vue.
