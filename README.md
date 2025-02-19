# internship_website
A full stack application I developed during my internship, that allows users to view past courses offered by my department. The project uses MariaDB for admin user data and MongoDB for course information. It consists of three components:

****Frontend****: A React-based web application that allows users to view past courses, detailed information on each course, and an admin interface for viewing attendee information.

****Backend****: An Express-based server that handles API requests, managing the interaction between the frontend and the database. It communicates with a MariaDB for the admin user data and MongoDB for course data.

****Updater****: A Python script with a PySide6 GUI that extracts course data from a spreadsheet, organizes the information into a JSON file, and prepares images for upload. It sends the data to a Debian server and triggers a Python script to update the MongoDB and store the images in an NGINX folder.

