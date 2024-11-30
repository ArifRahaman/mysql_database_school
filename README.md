


# Developing Node.js APIs for School Management

The project is a School Management API that allows users to add and list schools in a database. It performs the following key functions:

Add School (POST /addSchool):

The API accepts details such as the name, address, latitude, and longitude of a school.
It first validates the input using Joi to ensure the data is in the correct format.
Before adding a school, it checks if a school with the same name, address, and location (latitude and longitude) already exists within a small tolerance of 0.001 degrees. This is to prevent duplicate schools in the database.
If no duplicate is found, the school is added to the database, and the id is returned in the response.
List Schools (GET /listSchools):

The API allows users to fetch a list of schools from the database with pagination support (using limit and offset query parameters).
The response includes the schools sorted by proximity to the user's provided latitude and longitude, calculated using the Haversine formula for distance between geographical coordinates.





## API Link:
```
https://mysql-database-school.onrender.com
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

  `HOST`=

  `usr`=

  `PASSWORD`=

  `DATABASE`=

To setup this you need to login https://www.freesqldatabase.com/
then go to the 
Follow this link for phpMy Admin page ,
After that you will get all credentials in registered email

Host: 

Database name:

Database user: 

Database password: 

Port number:

simply copy paste the given credentials.
## Installation

Install my-project with node

```bash
  node app.js
```
    
## Screenshots

![Screenshot from 2024-11-30 19-11-47](https://github.com/user-attachments/assets/e9f029ab-2ecf-49ce-9ff0-ba95370103d9)
![Screenshot from 2024-11-30 19-17-24](https://github.com/user-attachments/assets/dfc9dbcb-150c-4710-93c2-ea4efdd2e85c)
![image](https://github.com/user-attachments/assets/19481d92-d92c-44f3-9ce0-b221c4227c6c)
## Demo

## API Reference

#### Post school information

```http
  POST /addSchool
```
### Request Body
```
{
  "name": "ABC Name",
  "address": "School Address",
  "latitude": 12.3456,
  "longitude": 78.9101
}
```
### Response
```
{
  "message": "School added successfully",
  "id": 1
}
```


#### Get all schools informations:

This is sample curl request
 ```
curl -X GET "https://mysql-database-school.onrender.com/listSchools?latitude=40.7128&longitude=-74.0060&limit=10&offset=0" \-H "Content-Type: application/json"
 ```
 ### Response
 ```
 [
  {

    "name": "Sunrise High School",
    "address": "123 Sunrise Ave",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "distance": 0.0
  },
  {

    "name": "Greenwood Academy",
    "address": "456 Greenwood St",
    "latitude": 40.7234,
    "longitude": -74.0023,
    "distance": 1.2
  }
]

```



