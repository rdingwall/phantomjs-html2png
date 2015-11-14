require('dotenv').load();
var express = require('express');
var phantom = require('phantom');
var base64url = require('base64url');
var fs = require('fs');
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var util = require('util');

var app = express();

app.use(bodyParser.text());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use(express.static('static'));

phantom.create(function (ph) {

    app.post('/images', function(req, res) {
        if (typeof req.body !== 'string' || req.body.length == 0) {
            console.log('warning: ' + util.inspect(req.body));
            res.status(400).send('bad request');
        }
        var bodyHtml = base64url.decode(req.body);
        var id = uuid.v1();
        var htmlFilename = process.env.HTML2PNG_TMP_DIR + '/' + id + '.html';
        var pngFilename = process.env.HTML2PNG_STATIC_DIR + '/' + id + '.png';
        var pngUri = process.env.HTML2PNG_URI + '/' + id + '.png';

        console.log('id=' + id + ', html=' + htmlFilename + ', png=' + pngFilename);

        fs.writeFile(htmlFilename, bodyHtml, function (err) {
            if(err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }

            console.log('The file was saved!')

            ph.createPage(function(page) {
                page.viewportSize = { width: 1080, height: 1080 };
                page.clipRect = { top: 0, left: 0, width: 1080, height: 1080 };
                page.open(htmlFilename, function() {
                    console.log('page opened');
                    page.render(pngFilename);
                    console.log('file saved');
                    res.status(200).send({uri: pngUri})
                });
            });
        });
    })
});

var server = app.listen(process.env.HTML2PNG_PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});