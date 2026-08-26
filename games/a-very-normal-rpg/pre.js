(function () {
  var pendingChars = [];

  function readLineFromTerminal() {
    return new Promise(function (resolve) {
      var buffer = "";

      function onData(data) {
        if (data === "\r" || data === "\n") {
          term.writeln("");
          term.offData(onData);
          resolve(buffer + "\n");
        } else if (data === "\u007F" || data === "\b") {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            term.write("\b \b");
          }
        } else if (data.charCodeAt(0) >= 0x20) {
          buffer += data;
          term.write(data);
        }
      }

      term.onData(onData);
    });
  }

  Module["stdin"] = function () {
    if (pendingChars.length > 0) {
      return pendingChars.shift();
    }

    return Asyncify.handleSleep(function (wakeUp) {
      readLineFromTerminal().then(function (line) {
        pendingChars = line.split("").map(function (ch) {
          return ch.charCodeAt(0);
        });
        wakeUp(pendingChars.shift());
      });
    });
  };
})();