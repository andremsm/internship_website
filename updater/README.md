This Python-based Updater utility is built using PySide6 for the graphical user interface (GUI) and is designed to manage the process of extracting, preparing, and uploading course data. Key features include:

- Data Extraction: Extracts course data from a spreadsheet and converts it into a structured JSON format.  
- Image Organization: Creates folders to store course images and ensures proper organization of media.  
- Server Communication: Sends the JSON data and images to a Debian server.  
- Update Process: Triggers a Python script on the server to update the MongoDB with new course data and upload the images to an NGINX folder.  
