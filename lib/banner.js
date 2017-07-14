module.exports = banner;

var message = [
  "            (   (                      (",
  "            )\\ ))\\ )   (      *   )    )\\ )",
  "         ( (()/(()/(   )\\   ` )  /((  (()/(",
  "         )\\ /(_))(_)|(((_)(  ( )(_))\\  /(_))",
  "      _ ((_|_))(_))_ )\\ _ )\\(_(_()|(_)(_))",
  "     | | | | _ \\|   \\(_)_\\(_)_   _| __| _ \\",
  "     | |_| |  _/| |) |/ _ \\   | | | _||   /",
  "      \\___/|_|  |___//_/ \\_\\  |_| |___|_|_\\"
];

var colors = [
  '#611824',
  '#611824',
  '#C12F2A',
  '#FF6540',
  '#FF6540',
  '#FEDE7B',
  '#FEDE7B',
  '#F7FFEE',
];

function banner(print) {
  if(!require("supports-color")) {
    return
  }

  var chalk = require('chalk');

  for(var i = 0; i < message.length; i++) {
    print(chalk.hex(colors[i])(message[i]));
  }
}
