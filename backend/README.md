This backend is built using Express.js and serves as the core API layer for the application. It is responsible for:

>Managing authentication and authorization, including admin login functionality.
>Using JWT (JSON Web Tokens) to send two types of course data:
>>Admin version: Includes course data alongside a list of attendees (accessible only to admin users).
>>Public version: Provides course data excluding attendee information (accessible to all users).
>Communicating with MariaDB to manage admin user information.
>Interacting with MongoDB to store and retrieve course data.

The backend provides endpoints for the frontend to display course details and administrative functions such as viewing attendees and course management.

Requires MariaDB for storing admin data and MongoDB for storing course data.