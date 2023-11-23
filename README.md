Book Management System

Group: 17
Name: 
Yuen Shing Hong (13105763)

Application link: https://three81prj-bookinformationsystem.onrender.com/

********************************************
# Login
Through the login interface, each user can access the Book Management System by entering their username and password.

Each user has a userID and password;
[
	{userid: yuenyuen, password: honghong}
]

After successful login, userid is stored in seesion.

********************************************
# Logout
In the home page, each user can log out their account by clicking logout.

********************************************
# CRUD service
- Create
-	A book may contain the following attributes with an example: 
	1)	Name (JavaScript Beginner)
	2)	Author (Yuen Shing Hong)
	3)	Code (001), book code generate by system from 001, 002, etc...
	4)	Type (Child), type should be Child/Adult, and there are checkbox limited only one 			type can be selected
	5)	Theme (Computer, Education), theme should be Computer/Education/Novel/Literature, there are checkbox limited atmost 3 themes can be selected
	6)	Status (Available), Available/Lent, book created defaulted Available
	7)	LaunchDate (04-11-2022), LaunchDate must be before today, and the format is DD-MM-YYYY
	8)	BorrowRecord, Empty when created

Name, Author, Type, Theme, LaunchDate aremandatory, and other attributes generate by system.

Create operation is post request, and all information is in body of request.

********************************************
# CRUD service
- Read
-  There are two options to read and find books list all information or searching by book name.

1) List all information
	display.ejs will be displayed with all book name;
	clicking on book name, all information will be showed;

2) Searching by book name
	input related name of book(such as java) you want to find, as result JavaScript Beginner, JavaScript Intermediate, two books will be showed which include "java";
	book name is in the body of post request, and in display.ejs book name will be shown as link;
	clicking on book name, the details.ejs will be display all information;

********************************************
# CRUD service
- Update
-	The user can update the book information through the details interface.
-	Among the attribute shown above, book code, status, borrow record cannot be changed. Since book code is fixed, book code is searching criteria for updating information. 

-	A book document may contain the following attributes with an example: 
	1)	Name (JavaScript Beginner)
	2)	Author (Yuen Shing Hong)
	3)	Code (001), book code generate by system from 001, 002, etc...
	4)	Type (Child), type should be Child/Adult, and there are checkbox limited only one 			type can be selected
	5)	Theme (Computer, Education), theme should be Computer/Education/Novel/Literature, there are checkbox limited atmost 3 themes can be selected
	6)	Status (Available), Available/Lent, book created defaulted Available
	7)	LaunchDate (04-11-2022), LaunchDate must be before today, and the format is DD-MM-YYYY
	8)	BorrowRecord, Empty when created

	In this project, Name, Author, Type, Theme, LaunchDate able to update, other attribute is fixed.

********************************************
# CRUD service
- Delete
-	The user can delete the book through the details interface.

********************************************
# Restful
In this project, there are three HTTP request types, post, get and delete.
- Post 
	Post request is used for insert.
	Path URL: /api/create
	Test: curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"Good Book\",\"author\":\"Yuen Shing Hong\",\"type\":\"Adult\",\"theme\":\"Computer, Education\",\"launchdate\":\"12-11-2023\"}" https://three81prj-bookinformationsystem.onrender.com/api/create

- Get
	Get request is used for find.
	Path URL: /api/search/:name

	Remind that if the Book name have a space, need to replace to %20
	e.g. Good Book > Good%20Book
	
	Test: curl -X GET https://three81prj-bookinformationsystem.onrender.com/api/search/Good%20Book

-Put
	Put request is used for update.
	Path URL: /api/edit

Test: curl -X PUT -H "Content-Type: application/json" -d "{\"name\":\"Good Book\",\"author\":\"Yuen Shing Hong\",\"type\":\"Adult\",\"theme\":\"Computer, Education\",\"launchdate\":\"12-11-2003\"}" https://three81prj-bookinformationsystem.onrender.com/api/edit

- Delete
	Delete request is used for deletion.
	Path URL: /api/delete/:name

	Remind that if the Book name have a space, need to replace to %20
	e.g. Good Book > Good%20Book

	Test: curl -X DELETE https://three81prj-bookinformationsystem.onrender.com/api/delete/Good%20Book

For all restful CRUD services, login should be done at first.


curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"Good Book\",\"author\":\"Yuen Shing Hong\",\"type\":\"Adult\",\"theme\":\"Computer, Education\",\"launchdate\":\"12-11-2023\"}" https://three81prj-bookinformationsystem.onrender.com/api/create

curl -X GET https://three81prj-bookinformationsystem.onrender.com/api/search/Good%20Book

curl -X PUT -H "Content-Type: application/json" -d "{\"name\":\"Good Book\",\"author\":\"Yuen Shing Hong\",\"type\":\"Adult\",\"theme\":\"Computer, Education\",\"launchdate\":\"12-11-2003\"}" https://three81prj-bookinformationsystem.onrender.com/api/edit

curl -X DELETE https://three81prj-bookinformationsystem.onrender.com/api/delete/Good%20Book

