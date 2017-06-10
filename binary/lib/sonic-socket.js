var SonicCoder = require('./sonic-coder.js');

var audioContext = new window.AudioContext || new webkitAudioContext();

/**
 * Encodes text as audio streams.
 *
 * 1. Receives a string of text.
 * 2. Creates an oscillator.
 * 3. Converts characters into frequencies.
 * 4. Transmits frequencies, waiting in between appropriately.
 */
function SonicSocket(params) {
  params = params || {};
  this.mode = params.mode || 0;
  this.coder = params.coder || new SonicCoder();
  this.charDuration = params.charDuration || 0.2;
  this.coder = params.coder || new SonicCoder(params);
  this.rampDuration = params.rampDuration || 0.001;
  this.amp = params.amp || 1;
  this.gain;
  this.osc;
}

SonicSocket.prototype.isModeFreqBin = function() {
  return this.mode == 1;
}

SonicSocket.prototype.send = function(input, opt_callback) {
  // Surround the word with start and end characters.
  input = this.coder.startChar + input + this.coder.endChar;
  var sepChar = this.coder.sepChar;
  var tmpArray = [];
  input.split("").forEach(function(s, index) {
    tmpArray.push(s);
    if (index < input.length -1) {
      tmpArray.push(sepChar);
    }
  });
  input = tmpArray.join("");

  // Use WAAPI to schedule the frequencies.
  var durationLength = 0;
  for (var i = 0; i < input.length; i++) {
    var char = input[i];
    var freq = this.coder.charToFreq(char);

    var bin = 0;
    if (this.isModeFreqBin() && char != sepChar) {
      bin = this.coder.charToBin(char);
    } else {

    }

    console.log("Sending char:" + char + ", freq:" + freq + ", bin: " + bin + ", amp: " + this.amp);
    var duration = (char == sepChar) ? (this.charDuration * 0.5) : (bin == 0 ? this.charDuration : this.charDuration * 2);
    durationLength += duration;
    var time = audioContext.currentTime + durationLength;
    this.scheduleToneAt(freq, time, duration, this.amp);
    // 90°位相をずらした波を重ねる
    // this.scheduleToneAt(freq, time + (1/freq/4), this.charDuration, this.amp);
  }

  // If specified, callback after roughly the amount of time it would have
  // taken to transmit the token.
  if (opt_callback) {
    var totalTime = this.charDuration * input.length;
    setTimeout(opt_callback, totalTime * 1000);
  }
};

SonicSocket.prototype.scheduleToneAt = function(freq, startTime, duration, amp) {
  var gainNode = this.gain || audioContext.createGain();
  // Gain => Merger
  gainNode.gain.value = 0;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(amp, startTime + this.rampDuration);
  gainNode.gain.setValueAtTime(amp, startTime + duration - this.rampDuration);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  gainNode.connect(audioContext.destination);

  var osc = this.osc || audioContext.createOscillator();
  osc.frequency.value = freq;
  // osc.type = "square";
  osc.connect(gainNode);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

module.exports = SonicSocket;
