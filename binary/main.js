var SonicSocket = require('./lib/sonic-socket.js');
var SonicServer = require('./lib/sonic-server.js');
var SonicCoder = require('./lib/sonic-coder.js');

var ALPHABET = ' abcdefg';
var params = {
  alphabet: ALPHABET,
  debug: true,
  timeout: 1000,
  freqMin: 19000,
  freqMax: 20000,
  peakThreshold: -115,
  charDuration: 0.1,
  rampDuration: 0.001,
  bufferLength: 32,
  fps: 100,
  amp: 1,
  minRunLength: 1,
  fftSize: 2048,
};
// Create an ultranet server.
var sonicServer = new SonicServer(params);
// Create an ultranet socket.
var sonicSocket = new SonicSocket(params);


var history = document.querySelector('#history');
var wrap = document.querySelector('#history-wrap');
var form = document.querySelector('form');
var input = document.querySelector('input');

function init() {
  sonicServer.start();
  sonicServer.on('message', onIncomingChat);
  form.addEventListener('submit', onSubmitForm);
}

function onSubmitForm(e) {
  // Get contents of input element.
  var message = input.value;
  // Send via oscillator.
  sonicSocket.send(message);
  // Clear the input element.
  input.value = '';
  // Don't actually submit the form.
  e.preventDefault();
}

function onIncomingChat(message) {
  console.log('chat inbound. message:' + message);
  history.innerHTML += time() + ': ' + message + '<br/>';
  // Scroll history to the bottom.
  wrap.scrollTop = history.scrollHeight;
}

function time() {
  var now = new Date();
  var hours = now.getHours();
  hours = (hours > 9 ? hours: ' ' + hours);
  var mins = now.getMinutes();
  mins = (mins > 9 ? mins : '0' + mins);
  var secs = now.getSeconds();
  secs = (secs > 9 ? secs : '0' + secs);
  return '[' + hours + ':' + mins + ':' + secs + ']';
}

window.addEventListener('load', init);
