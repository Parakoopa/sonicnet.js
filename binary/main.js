var SonicSocket = require('./lib/sonic-socket.js');
var SonicServer = require('./lib/sonic-server.js');
var SonicCoder = require('./lib/sonic-coder.js');

var BITS = '01234567'; // 89abcdef
var params = {
  bits: BITS,
  debug: true,
  timeout: 1000,
  freqMin: 19000,
  freqMax: 20000,
  freqError: 100,
  peakThreshold: -115,
  charDuration: 0.05,
  rampDuration: 0.0005,
  bufferLength: 64,
  fps: 100,
  amp: 1,
  minRunLength: 2,
  fftSize: 2048, // default
  mode: 1, // 0: freq, 1: freq+bin
};

var freqRange = params.freqMax - params.freqMin;
var rangeHz = freqRange / Math.ceil((BITS.length + 3) / (params.mode + 1));
var aboutFftSize = 44100 / rangeHz;
var recommendFftSize = Math.pow(2, Math.ceil(Math.log2(aboutFftSize))); // 純粋なものだと厳しいので2倍する
params.fftSize = recommendFftSize;

console.log("Start { freqRange: ", freqRange, ", rangeHz: ", rangeHz, ", aboutFftSize: ", aboutFftSize, ", recommendFftSize: ", recommendFftSize);

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
