# LegalCaseManagementSystem
Database:

We originally planned to use MySQL, but we faced difficulties finding reliable and free hosting options that supported all the features we needed. As a result, we switched to PostgreSQL with Supabase, which offered a much smoother experience. Supabase gave us free and easy hosting. PostgreSQL also handled complex relationships in our case management system very well. Overall, Supabase with PostgreSQL turned out to be a faster and more complete solution for our project.
 

“Shows the PostgreSQL database tables and their contents within the Supabase interface, illustrating the system's data storage.”
This database was connected to the backend using the supabase connection URL, and through the following code

 
“Displays Python code snippets for connecting the application backend to the PostgreSQL database using SQLAlchemy and psycopg2.”


Database Objects:
Triggers for the events of CREATE, INSERT and DELETE were made for every table, which triggered a function that would insert all such entries into our logtable. The logtable would make it easier for the admin to track changes.

 
“Presents the SQL code for creating database triggers that log CREATE, INSERT, and DELETE operations on tables to an audit log table.”

We also created suitable enumerated types as per our requirements:
 
“Shows the custom enumerated data types defined in the database for roles and payment statuses, ensuring data consistency.”
Frontend:

The frontend was made using a combination of React, Vite and Bootstrap to allow for a clean, responsive UI design, based on components and different pages depending on the requirements of our system.

Home Page:
 
“Displays the landing page of the Legal Case Management System, highlighting its purpose to simplify case management.”
Dashboards:

 ”Shows the dashboard view for a Court Registrar, providing quick actions for managing court rooms, cases, and appeals.”   
 
“Illustrates the dashboard for a Lawyer, featuring a list of assigned cases with details and action options.”

“Displays the Judge's interface showing assigned cases with options to view history, evidence, witnesses, and decisions”
 
“Shows the Client's view of their cases, including case title, assigned lawyer and court, status, and history”
 



“Displays the Admin dashboard showing system logs, including action type, description, status, and timestamp for tracking changes.”
 


Some buttons\functionalities:
“A pop-up window showing the final decision details for a case, including decision date, summary, and verdict.”
 
“Depicts a calendar interface, used for scheduling and viewing hearing dates.”
 
“A pop-up window allowing the editing of hearing details, such as case name, date, time, venue, and judge.”
 



“Shows a pop-up form for judges to announce the final decision of a case by entering the verdict, date, and summary.”
 


“A pop-up box for adding remarks or notes related to a specific hearing.”
 



Backend:
The backend coding was done by using Flask to create API’s which were called through the frontend. 
First, an API endpoint would be defined in flask like so:

 
“Demonstrates the Flask code for defining an API endpoint to fetch appeals data for the frontend.”

Then the API would be tested in postman:
 
 “Shows the successful testing of the backend API endpoint using Postman, confirming it returns the expected data.”

After receiving confirmation of the APIs working, then the API call would be included in the frontend.

Workflow for connecting frontend and backend:
The API calls for CRUD operations would be included in the frontend code as such:
 
“Illustrates the frontend code using React to call the backend API to retrieve and display appeals.”

The results of which can be seen as follows:

 


