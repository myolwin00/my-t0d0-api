const express = require('express');
const app = express();
const router = express.Router();
const {check,validationResult} = require('express-validator/check');
const cors = require('cors');
const {MongoClient, ObjectId} = require('mongodb');

app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(cors());
app.use("/", router);

const url = "mongodb+srv://root:root@cluster0-3wkf7.mongodb.net/test?retryWrites=true";
const DB_NAME = "todo";
const COLLECTION_NAME = "tasks";

let collection;

router.route('/tasks')
    .get(function (req, res) {
        collection.find({}).toArray((error, result) => {
            if (error) {
                return response.status(500).send(error);
            }
            res.send(result);
        });
    })
    .post([check('subject').exists()], async function (req, res) {
        var errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            })
        }
        var subject = req.body.subject;
        var _id = new ObjectId();
        var task = {_id, subject, status: 0}
        let r = await collection.insertOne(task);
        res.json(task);
    })
    .delete(function (req, res) {
        collection.deleteMany({
            status: 1
        }, function (err, data) {
            res.json(data);
        })
    });

router.route('/tasks/:id')
    .get(function (req, res) {
        var id = req.params.id;
        collection.find({
            '_id': mongojs.ObjectId(id)
        }, function (err, data) {
            res.json(data);
        });
    })
    .delete(function (req, res) {
        var id = req.params.id;

        collection.deleteOne({
            '_id': ObjectId(id)
        }, function (err, data) {
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
    .patch(function (req, res) {
        var id = req.params.id;
        var status = parseInt(req.body.status);
        collection.updateOne({
                '_id': ObjectId(id)
            }, {
                $set: {
                    status
                }
            }, {
                multi: true
            },
            function (err, data) {
                res.json(data);
            }
        );
    });

app.listen(process.env.PORT || 8000, function () {
    // node index.js
    console.log('todo api started at port 8000');

    MongoClient.connect(url, {
        useNewUrlParser: true
    }, (error, client) => {
        if (error) {
            throw error;
        }
        collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    });
});