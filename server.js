const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://admin:admin@cluster0.ormdivk.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = '381project';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = 'cs381';
const moment = require('moment');

var documents = {};
//Main Body
app.set('view engine', 'ejs');
app.use(session({
    userid: "session",
    keys: SECRETKEY,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/css', express.static(__dirname + '/node_modules/startbootstrap-creative/dist/css'));

const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        db.collection('Books').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}

const findDocument =  function(db, criteria, callback){
    let cursor = db.collection("Books").find({"Name" : new RegExp(criteria.Name, "i")});
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        return callback(docs);
    });
}

const findUser =  function(db, criteria, callback){
    let cursor = db.collection('login').find(criteria);
    console.log(`findUser: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findUser: ${docs.length}`);
        return callback(docs);
    });
}

const handle_Find = function(res){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let document = {}
        document.Name = ""
        findDocument(db, document, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    });
}

const handle_Edit = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        db.collection('Books').findOne({_id: ObjectID(criteria._id)}, function(err, item) {
            client.close();
            assert.equal(err, null);
            console.log(ObjectID(criteria._id));
            res.status(200).render('edit', { type: ["Child", "Adult"], themes: ["Education", "Computer", "Novel", "Literature"], item: item });
        });
    });
}

const handle_Details = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let document = {};
        document["Name"] = criteria;
        findDocument(db, document, function(docs){
            console.log(document.Name);
            client.close();
            assert.equal(err,null);
            res.status(200).render('details',{item: docs[0]});
        });
    });
}

const deleteDocument = function(db, criteria, callback){
console.log(criteria);
	db.collection('Books').deleteOne(criteria, function(err, results){
	assert.equal(err, null);
	console.log(results);
	return callback();
	});
};

const handle_Delete = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
	
	let deldocument = {};
	
        deldocument["_id"] = ObjectID(criteria._id);
        console.log(deldocument["_id"]);
        
        deleteDocument(db, deldocument, function(results){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Document is successfully deleted."});
        })     
    });
}

app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("Incorrect username or password, please try again.; directing to login");
        res.redirect("/login");
    }else{
    	res.redirect("/login");
    }
    console.log("...Hello, welcome back");
});

//login
app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("...Handling your login request");
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
    
        var userID = req.body.username;
        var userPassword = req.body.password;
    
        if (userID && userPassword){
            console.log("...Logining");
            var criteria = {
                name: userID,
                password: userPassword
            };
            findUser(db, criteria, function(docs){
                client.close();
                console.log("Closed DB connection");
                if (docs.length > 0) {
                    req.session.authenticated = true;
                    req.session.userID = userID;
                    console.log(req.session.userID);
                    res.status(200).render('home');
                }
                else{
                    console.log("user ID is incorrect!");
                    res.status(200).redirect('/');
                }
            });
        }
        else{
            console.log("user ID is incorrect!");
            res.status(200).redirect('/');
        }
    });
});

app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});

app.get('/home', function(req, res){
    console.log("...Welcome to the home page!");
    return res.status(200).render("home");
});

app.get('/list', function(req, res){
    console.log("Show all books! ");
    handle_Find(res,req.query.docs);
});

app.get('/find', function(req, res){
    return res.status(200).render("search");
});

app.post('/search', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
    
    const searchBook={};
    searchBook["Name"] = req.body.bookname;
    
    if (searchBook.Name){
    console.log("...Searching the document");
    findDocument(db, searchBook, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
            console.log(ObjectID(docs._id));
        });
    }
    else{
    console.log("Invalid Entry - Book name is compulsory for searching!");
    res.status(200).redirect('/find');
    }         	
	});
});

app.get('/details', function(req, res){
    const criteria = req.query.Name; // Assuming the criteria is passed as a query parameter
    handle_Details(res, criteria);
});

app.get('/edit', function(req, res) {
    handle_Edit(res, req.query);
});

app.get('/create', function(req, res){
    return res.status(200).render("create", { type: ["Child", "Adult"], themes: ["Education", "Computer", "Novel", "Literature"] });
});

app.post('/create', function(req, res){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
        const booksCollection = db.collection("Books");
        const documents = {} //init docs
        // TODO: check if bookname exist, add book fail, after finish search function
        booksCollection
            .find({})
            .sort({ Code: -1 })
            .limit(1)
            .toArray(function(err, books) {
                if (err) {
                    console.error(err);
                    return res.status(500).render('info', { message: 'Error occurred while fetching books' });
                } else {
                  if (books.length > 0) {
                    NextInsertBookCode = (Number(books[0].Code)+1).toString().padStart(3,'0');
                    console.log(books[0].Code);
                    console.log('Book Code: ', NextInsertBookCode);
                  } else {
                    console.log('No books found.');
                    NextInsertBookCode = "001";
                  }
                }
            
        booksCollection.findOne({Name: req.body.name}, function(err, book) {
            if (err) {
                console.error(err);
                client.close();
                return res.status(200).render('info', {message: 'Error occurred while fetching book' });
            }
            
            if (!book) {
                // No book found
                console.log("Book name not repeated. Allow to add.");
                documents["Name"] = req.body.name;
            }
            else{
                return res.status(200).render('info', {message: "Invalid entry - This book already exist"});
            }
            console.log("Book name: ", req.body.name)
            
        documents["_id"] = new ObjectID();
        documents['Author']= req.body.author;
        documents['Code']= NextInsertBookCode;
        documents['Type']= req.body.selectedTypes;
        console.log("Type: ",documents['Type'])
        const themes = req.body.selectedThemes || [];
        documents['Theme'] = themes;
        console.log("Theme: ",documents['Theme'])
        documents['Status']= "Available";
        const parsedLaunchDate = moment(req.body.launchdate, 'DD-MM-YYYY', true);
                if (!parsedLaunchDate.isValid()) {
                    return res.render('info', {message: "Invalid entry - Launch date format is incorrect!"});
                }

                // Compare launchdate with current date
                const currentDate = moment().startOf('day');
                if (!parsedLaunchDate.isBefore(currentDate)) {
                    return res.render('info', {message: "Invalid entry - Launch date should be before today!"});
                }
        documents['LaunchDate']=req.body.launchdate;
        documents['BorrowRecord']= [];
        console.log("...putting book data into documents");
        
        if(documents.Name&&documents.Author&&documents.Type&&documents.Theme.length > 0&&documents.LaunchDate){
            console.log("...Adding the document");
            createDocument(db, documents, function(docs){
                client.close();
                console.log("Closed DB connection");
                return res.status(200).render('info', {message: "Book added successfully!"});
            });
        }else{
            client.close();
            console.log("Closed DB connection");
            return res.status(200).render('info', {message: "Invalid entry - Some block is missing input!"});
        }
    });
    });
    });
});

app.post('/edit', function(req, res){
    const { name, author, code, selectedTypes, selectedThemes, status, launchdate} = req.body;
    const borrowrecord = req.body.borrowrecord ? req.body.borrowrecord.split(',') : [];

    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to server");
        documents={}
        //console.log(req.body.code.toString());
        if(req.body.name){
            const db = client.db(dbName);
            const booksCollection = db.collection("Books");

            booksCollection.findOne({ Code: { $ne: code }, Name: name }, function(err, book) {
                if (err) {
                    console.error(err);
                    client.close();
                    
                    return res.status(200).render('info', {message: 'Error occurred while fetching book' });
                }
                const parsedLaunchDate = moment(launchdate, 'DD-MM-YYYY', true);
                if (!parsedLaunchDate.isValid()) {
                    return res.render('info', {message: "Invalid entry - Launch date format is incorrect!"});
                }

                // Compare launchdate with current date
                const currentDate = moment().startOf('day');
                if (!parsedLaunchDate.isBefore(currentDate)) {
                    return res.render('info', {message: "Invalid entry - Launch date should be before today!"});
                }
                if (book) {
                    console.log(book);
                    return res.status(200).render('info', {message: "Invalid entry - This book does not exist"});
                }
                else {
                    documents["$set"] = {
                        Name: name,
                        Author: author,
                        Code: code,
                        Type: selectedTypes,
                        Theme: selectedThemes,
                        Status: status,
                        LaunchDate: launchdate,
                        BorrowRecord: borrowrecord
                    };
                    if (documents["$set"].Name && documents["$set"].Author && documents["$set"].Type && documents["$set"].Theme.length > 0 && documents["$set"].LaunchDate) {
                        booksCollection.updateOne({ Code: code }, documents, function (err, result) {
                            if (err) {
                                console.error(err);
                                client.close();
                                return res.status(500).render('info', {message: 'Error occurred while updating book' });
                            }
                            client.close();
                            console.log("Closed DB connection");
                            return res.render('info', {message: "Document is updated successfully!"});
                        });
                    } else {
                        client.close();
                        console.log("Closed DB connection");
                        console.log(documents);
                        return res.status(200).render('info', {message: "Invalid entry - Some block is missing input!"});
                    }
                }
            });
        }
        else{
            return res.render('info', {message: "Invalid entry - Book name is compulsory!"});
        }
    });
});

app.get('/delete', function(req, res){
        handle_Delete(res, req.query);
});

//Restful
//insert
app.post('/api/create', function(req, res) {
    MongoClient.connect(mongourl, function(err, client) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error connecting to the database' });
      }
  
      const db = client.db(dbName);
      const booksCollection = db.collection('Books');
      documents = {}
  
      booksCollection
        .find({})
        .sort({ Code: -1 })
        .limit(1)
        .toArray(function(err, books) {
          if (err) {
            console.error(err);
            client.close();
            return res.status(500).json({ error: 'Error occurred while fetching books' });
          }
  
          let nextInsertBookCode;
          if (books.length > 0) {
            nextInsertBookCode = (Number(books[0].Code) + 1).toString().padStart(3, '0');
            console.log('Book Code:', nextInsertBookCode);
          } else {
            nextInsertBookCode = '001';
            console.log('No books found.');
          }
  
          booksCollection.findOne({ Name: req.body.name }, function(err, book) {
            if (err) {
              console.error(err);
              client.close();
              return res.status(500).json({ error: 'Error occurred while fetching book' });
            }
  
            if (!book) {
              // No book found
              console.log('Book name not repeated. Allow to add.');
              documents['Name'] = req.body.name;
            } else {
              console.log('Invalid entry - This book already exists');
              return res.status(200).json({ error: 'Invalid entry - This book already exists' });
            }
            console.log('Book name: ', req.body.name);
  
            const parsedLaunchDate = moment(req.body.launchdate, 'DD-MM-YYYY', true);
            if (!parsedLaunchDate.isValid()) {
              return res.status(200).json({ message: 'Invalid entry - Launch date format is incorrect!' });
            }
  
            // Compare launchdate with current date
            const currentDate = moment().startOf('day');
            if (!parsedLaunchDate.isBefore(currentDate)) {
              return res.status(200).json({ error: 'Invalid entry - Launch date should be before today!' });
            }
  
            documents = {
              _id: new ObjectID(),
              Name: req.body.name,
              Author: req.body.author,
              Code: nextInsertBookCode,
              Type: req.body.type,
              Theme: req.body.theme.split(',').filter(theme => theme !== '').map(theme => theme.trim()),
              Status: 'Available',
              LaunchDate: req.body.launchdate,
              BorrowRecord: []
            };
            console.log('Type: ', documents.Type);
            console.log('Theme: ', documents.Theme);
  
            if (
              documents.Name &&
              documents.Author &&
              documents.Type &&
              documents.Theme.length > 0 &&
              documents.LaunchDate
            ) {
              if (documents.Type === 'Child' || documents.Type === 'Adult') {
                if (
                  documents.Theme.every(
                    theme => theme === 'Computer' || theme === 'Education' || theme === 'Novel' || theme === 'Literature'
                  )
                ) {
                  createDocument(db, documents, function(docs) {
                    client.close();
                    console.log('Closed DB connection');
                    console.log('Book added successfully!');
                    return res.status(200).json({ message: 'Book added successfully!' });
                  });
                } else {
                  client.close();
                  console.log('Closed DB connection');
                  console.log('Invalid entry - Theme must be Computer/Education/Novel/Literature');
                  return res
                    .status(400)
                    .json({ error: 'Invalid entry - theme must be Computer/Education/Novel/Literature' });
                }
              } else {
                client.close();
                console.log('Closed DB connection');
                console.log('Invalid entry - Type should be Adult/Child');
                return res.status(400).json({ error: 'Invalid entry - Type should be Adult/Child' });
              }
            } else {
              client.close();
              console.log('Closed DB connection');
              console.log('Invalid entry - Some block is missing input or Launch Date is in the wrong format');
              return res
                .status(400)
                .json({ error: 'Invalid entry - Some block is missing input or Launch Date is in the wrong format' });
            }
          });
        });
    });
  });

//find
app.get('/api/search/:name', function(req, res) {
    if (req.params.name) {
      let criteria = {};
      criteria['Name'] = decodeURIComponent(req.params.name); // Decode the URL-encoded book name
      const client = new MongoClient(mongourl);
      client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
  
        findDocument(db, criteria, function(docs) {
          client.close();
          console.log("Closed DB connection");
          let formattedResponse = `<pre>${JSON.stringify(docs, null, 2)}</pre>`;
          res.status(200).send(formattedResponse);
        });
      });
    } else {
      res.status(500).json({"error": "Invalid Entry - Book name is compulsory for searching!"});
    }
  });

//edit
app.put('/api/edit', function(req, res) {
    MongoClient.connect(mongourl, function(err, client) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error connecting to the database' });
      }
  
      const db = client.db(dbName);
      const booksCollection = db.collection('Books');
      documents = {}
  
      if (req.body.name) {
        booksCollection.findOne({ Name: req.body.name }, function(err, book) {
          if (err) {
            console.error(err);
            client.close();
            return res.status(500).json({ error: 'Error occurred while fetching book' });
          }
          if (!book) {
            console.log(book);
            return res.status(400).json({ error: "Invalid entry - This book does not exist" });
          } else {
            const parsedLaunchDate = moment(req.body.launchdate, 'DD-MM-YYYY', true);
            if (!parsedLaunchDate.isValid()) {
              return res.status(400).json({ error: "Invalid entry - Launch date format is incorrect!" });
            }
  
            // Compare launchdate with current date
            const currentDate = moment().startOf('day');
            if (!parsedLaunchDate.isBefore(currentDate)) {
              return res.status(400).json({ error: "Invalid entry - Launch date should be before today!" });
            }
  
            const themes = req.body.theme.split(',').filter(theme => theme !== "").map(theme => theme.trim());
  
            const validThemes = ["Education", "Computer", "Novel", "Literature"];
            const validTypes = ["Child", "Adult"];
  
            // Check if all themes are valid
            const invalidThemes = themes.filter(theme => !validThemes.includes(theme));
            if (invalidThemes.length > 0) {
              return res.status(400).json({ error: "Invalid entry - Invalid theme(s): " + invalidThemes.join(", ") });
            }
            if (!validTypes.includes(req.body.type)) {
              return res.status(400).json({ error: "Invalid entry - Invalid type: " + req.body.type });
            }
  
            documents["$set"] = {
              Name: req.body.name,
              Author: req.body.author,
              Type: req.body.type,
              Theme: themes,
              Status: req.body.status,
              LaunchDate: req.body.launchdate,
            };
            if (documents["$set"].Name && documents["$set"].Author && documents["$set"].Type && documents["$set"].Theme && documents["$set"].LaunchDate) {
              booksCollection.updateOne({ Name: documents["$set"].Name }, documents, function(err, result) {
                if (err) {
                  console.error(err);
                  client.close();
                  return res.status(500).json({ error: 'Error occurred while updating book' });
                }
                client.close();
                console.log("Closed DB connection");
                return res.status(200).json({ message: "Document is updated successfully!" });
              });
            } else {
              client.close();
              console.log("Closed DB connection");
              console.log(documents);
              return res.status(400).json({ error: "Invalid entry - Some block is missing input!" });
            }
          }
        });
      } else {
        return res.status(400).json({ message: "Invalid entry - Book name is compulsory!" });
      }
    });
  });

// delete
app.delete('/api/delete/:name', function(req, res) {
    if (req.params.name) {
      let criteria = {};
      criteria['Name'] = req.params.name;
      const client = new MongoClient(mongourl);
      client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
  
        db.collection('Books').deleteOne(criteria, function(err, results) {
          if (err) {
            console.error(err);
            client.close();
            return res.status(500).json({ error: 'Error occurred while deleting books' });
          }
          client.close();
          console.log("Deleted books successfully");
          if (results.deletedCount === 0) {
            return res.status(400).json({ message: 'No document found with the specified name.' });
          } else {
            return res.status(200).json({ message: 'Document is successfully deleted.' });
          }
        });
      });
    } else {
      res.status(400).json({ error: "Invalid Entry - Book name is compulsory for deleting!" });
    }
  });

app.listen(app.listen(process.env.PORT || 8099));
