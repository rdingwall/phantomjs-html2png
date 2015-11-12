var webpage = require('webpage');
var system = require('system');
var optparse = require('optparse');

var switches = [
    ['-w', '--width NUMBER', 'View port and clip rect width (px)'],
    ['-h', '--height NUMBER', 'View port and clip rect height (px)'],
    ['-f', '--file TEXT', 'HTML file'],
    ['-o', '--output TEXT', 'Output file name']
];

var parser = new optparse.OptionParser(switches);

var width = 1080;
var height = 1080;
var file;
var output;

parser.on('width', function(name, value) { width = value; });
parser.on('height', function(name, value) { height = value; });
parser.on('file', function(name, value) { file = value; });
parser.on('output', function(name, value) { output = value; });
parser.on('help', function() { console.log(parser.toString()); phantom.exit(1); });

parser.parse(system.args);

if (file === undefined || output === undefined) {
  console.log(parser.toString());
  phantom.exit(1);
}

console.log('file=' + file + ', output=' + output + ', width=' + width + ', height=' + height);

var page = webpage.create();

page.viewportSize = { width: width, height: height };
page.clipRect = { top: 0, left: 0, width: width, height: height };

page.open(file, function() {
  page.render(output);
  phantom.exit();
});
