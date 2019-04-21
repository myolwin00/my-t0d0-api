var express = require('express');
var app = express();

var mongojs = require('mongojs');
var db = mongojs('todo', [ 'tasks' ]);

var { check, validationResult } = require('express-validator/check');
var cors = require('cors');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// curl -X POST localhost:8000/tasks -d "subject=Apple"
app.post('/tasks', [
    check('subject').exists()
], function(req, res) {

    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    var subject = req.body.subject;
    db.tasks.insert({ subject, status: 0 }, function(err, data) {
        res.json(data);
    });
});

app.get('/tasks/:id', function(req, res) {
    var id = req.params.id;
    db.tasks.find({ '_id': mongojs.ObjectId(id) }, function(err, data) {
        res.json(data);
    });
});

app.get('/tasks', function(req, res) {
    db.tasks.find(function(err, data) {
        res.json(data);
    });
}).delete('/tasks', function(req, res) {
    db.tasks.remove({status: 1}, function(err, data) {
        res.json(data);
    })
});

app.delete('/tasks/:id', function(req, res) {
    var id = req.params.id;

    db.tasks.remove({'_id': mongojs.ObjectId(id)}, function(err, data) {
        if (err) {
            console.log(err);
            res.json({
                msg: "error"
            })
        } else {
            console.log(data);
            res.json(data);            
        }
    })
})
// curl -X PATCH localhost:8000/tasks/5cbadbd15ac7390b5c4ad818 -d "status=1"
.patch('/tasks/:id', function(req, res) {
    var id = req.params.id;
    var status = parseInt(req.body.status);
    db.tasks.update(
        { '_id': mongojs.ObjectId(id) },
        { $set: { status } },
        { multi: true },
        function(err, data) {
            res.json(data);
        }
    );
});

app.listen(8000, function() {
    // node index.js
    console.log('todo api started at port 8000');
});
