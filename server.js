var express = require('express');
var sys = require('sys');
var base64url = require('base64url');
var fs = require('fs');
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var util = require('util');
var PNGCrop = require('png-crop');

if (process.env.MARTINI_ENV != 'production') {
    require('dotenv').load();
}

var app = express();

app.use(bodyParser.text());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

const width = 768;
const height = 768;

app.use(express.static(process.env.HTML2PNG_STATIC_DIR));

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

        console.log('The file was saved!');

        var cmd = process.env.PHANTOMJS + ' --debug=yes --ssl-protocol=any --ignore-ssl-errors=yes ' + process.env.HTML2PNG_JS + ' -f ' + htmlFilename + ' -o ' + pngFilename + ' -w ' + width + ' -h ' + height;
        console.log('cmd=' + cmd);
        child = sys.exec(cmd, function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            sys.print('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
                res.status(500).send(error);
            }

            console.log('file saved');

            // Because clipRect doesn't work
            PNGCrop.crop(pngFilename, pngFilename, {width: width, height: height, top: 0, left: 0}, function(err) {
                if (err) {
                    console.log('exec error: ' + error);
                    res.status(500).send(error);
                }
                console.log('cropped!');

                var result = {uri: pngUri};
                console.log('returning ' + util.inspect(result));
                res.status(200).send(result);
            });
        });
    });
});

var server = app.listen(process.env.HTML2PNG_PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});