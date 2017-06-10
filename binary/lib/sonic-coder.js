/**
 * A simple sonic encoder/decoder for [a-z0-9] => frequency (and back).
 * A way of representing characters with frequency.
 */
var BITS = '01234567';

function SonicCoder(params) {
  params = params || {};
  this.mode = params.mode || 0;
  this.freqMin = params.freqMin || 18500;
  this.freqMax = params.freqMax || 19500;
  this.freqError = params.freqError || 50;
  this.bitString = params.bits || BITS;
  this.startChar = params.startChar || '^';
  this.endChar = params.endChar || '$';
  this.sepChar = params.sepChar || '¥';
  // Make sure that the bits has the start and end chars.
  this.bits = this.startChar + this.bitString + this.endChar + (this.mode == 0 ? this.sepChar : "");
  // 指定帯域を区切る数(+1はsepChar用)
  if (this.mode == 0) {
    this.bitsLength = this.bits.length;
  } else {
    this.bitsLength = Math.ceil(this.bits.length / 2) + 1;
  }
}

SonicCoder.prototype.isModeFreqBin = function() {
  return this.mode == 1;
}

/**
 * Given a character, convert to the corresponding frequency.
 */
SonicCoder.prototype.charToFreq = function(char) {
  // Get the index of the character.
  var index;
  if (this.isModeFreqBin() && char == this.sepChar) {
    index = this.bitsLength - 1;
  } else {
    index = this.bits.indexOf(char);
    if (index == -1) {
      // If this character isn't in the bits, error out.
      console.error(char, 'is an invalid character.');
      index = this.bits.length - 1;
    }
    if (this.isModeFreqBin()) {
      // バイナリ化した際のindex
      index = index % (this.bitsLength - 1);
    }
  }

  // Convert from index to frequency.
  var freqRange = this.freqMax - this.freqMin;
  var percent = index / this.bitsLength;
  var freqOffset = Math.round(freqRange * percent);
  return this.freqMin + freqOffset;
};

/**
 * バイナリ化した際の0,1どちらなのか
 */
SonicCoder.prototype.charToBin = function(char) {
  // Get the index of the character.
    var index;
  if (this.isModeFreqBin() && char == this.sepChar) {
    index = this.bitsLength - 1;
  } else {
    index = this.bits.indexOf(char);
    if (index == -1) {
      // If this character isn't in the bits, error out.
      console.error(char, 'is an invalid character.');
      index = this.bits.length - 1;
    }
  }
  // バイナリ化した際の0,1どちらなのか
  return Math.floor(index / (this.bitsLength - 1));
};

/**
 * Given a frequency, convert to the corresponding character.
 */
SonicCoder.prototype.freqToChar = function(freq, bin) {
  // If the frequency is out of the range.
  if (!(this.freqMin < freq && freq < this.freqMax)) {
    // If it's close enough to the min, clamp it (and same for max).
    if (this.freqMin - freq < this.freqError) {
      freq = this.freqMin;
    } else if ((freq - this.freqMax) < this.freqError && (freq - this.freqMax) > 0) {
      freq = this.freqMax;
    } else {
      // Otherwise, report error.
      console.error(freq, 'is out of range.');
      return null;
    }
    console.warn("correction freq:", freq);
  }
  // Convert frequency to index to char.
  var freqRange = this.freqMax - this.freqMin;
  var percent = (freq - this.freqMin) / freqRange;
  var index = Math.round(this.bitsLength * percent);
  if (this.isModeFreqBin()) {
    if (index == (this.bitsLength - 1)) {
      return this.sepChar;
    } else if (bin == 1 && index < (this.bits.length - 1)) {
      index += this.bitsLength - 1;
    }
    return this.bits[index];
  } else {
    return this.bits[index];
  }
};

module.exports = SonicCoder;
