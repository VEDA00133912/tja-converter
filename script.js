const convertBtn = document.getElementById('convertBtn'); 
const convertDonBtn = document.getElementById('convertDonBtn');
const convertKaBtn = document.getElementById('convertKaBtn');
const convertEqualBtn = document.getElementById('convertEqualBtn');
const convertAltBtn = document.getElementById('convertAltBtn');
const convertDensityBtn = document.getElementById('convertDensityBtn');
const copyBtn = document.getElementById('copyBtn');

const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');

inputEl.addEventListener('input', () => {
  const hasValue = inputEl.value.trim() !== '';
  convertBtn.disabled = !hasValue;
  convertDonBtn.disabled = !hasValue;
  convertKaBtn.disabled = !hasValue;
  convertEqualBtn.disabled = !hasValue;
  convertAltBtn.disabled = !hasValue;
  convertDensityBtn.disabled = !hasValue;
  copyBtn.disabled = true;
});

function convertWithMap(map) {
  const input = inputEl.value;
  const lines = input.split('\n');
  let output = [];
  let inNotes = false;

  for (let line of lines) {
    if (line.trim() === '#START') inNotes = true;
    if (line.trim() === '#END') inNotes = false;

    if (inNotes && !line.startsWith('#')) {
      output.push(line.replace(/[123456]/g, m => map[m] || m));
    } else {
      output.push(line);
    }
  }

  outputEl.value = output.join('\n');
  copyBtn.disabled = false;
}

// 大小反転
function convert() {
  const map = { '1': '3', '3': '1', '2': '4', '4': '2', '5': '6', '6': '5' };
  convertWithMap(map);
}

// 全部ドン
function convertToDon() {
  const map = { '4': '3', '2': '1' };
  convertWithMap(map);
}

// 全部カッ
function convertToKa() {
  const map = { '3': '4', '1': '2' };
  convertWithMap(map);
}

// 大小交互
function convertAlternateSize() {
  const input = inputEl.value;
  const lines = input.split('\n');
  let output = [];
  let inNotes = false;

  let isBig = false;

  for (let line of lines) {
    if (line.trim() === '#START') {
      inNotes = true;
      isBig = false;
    }

    if (line.trim() === '#END') {
      inNotes = false;
    }

    if (inNotes && !line.startsWith('#')) {
      let converted = line.replace(/[123456]/g, m => {

        if (m === '1' || m === '3') {
          const result = isBig ? '3' : '1';
          isBig = !isBig;
          return result;
        }

        if (m === '2' || m === '4') {
          const result = isBig ? '4' : '2';
          isBig = !isBig;
          return result;
        }

        if (m === '5') return '6';
        if (m === '6') return '5';

        return m;
      });

      output.push(converted);

    } else {
      output.push(line);
    }
  }

  outputEl.value = output.join('\n');
  copyBtn.disabled = false;
}

// 等速変換
function convertEqualSpeed(targetBPM, targetHS = 1) {
  const input = inputEl.value;
  const lines = input.split('\n');
  let output = [];
  let baseBPM = null;
  let scrollInserted = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line.startsWith('#SCROLL')) continue;

    if (line.startsWith('BPM:')) {
      const bpm = parseFloat(line.split(':')[1]);
      if (!isNaN(bpm)) baseBPM = bpm;
      output.push(line);
      continue;
    }

    if (line.startsWith('#START')) {
      scrollInserted = false;
    }

    output.push(line);

    if (!scrollInserted && line.startsWith('#START')) {
      if (baseBPM !== null) {
        const scroll = (targetBPM / baseBPM) * targetHS;
        output.push(`#SCROLL ${scroll}`);
        scrollInserted = true;
      }
    }

    if (line.startsWith('#BPMCHANGE')) {
      const bpm = parseFloat(line.split(' ')[1]);
      if (!isNaN(bpm)) {
        const scroll = (targetBPM / bpm) * targetHS;
        output.push(`#SCROLL ${scroll}`);
      }
    }
  }

  outputEl.value = output.join('\n');
  copyBtn.disabled = false;
}

function convertEqualSpeedPrompt() {
  const targetBPM = parseFloat(prompt('基準とするBPMを入力してください', 300));
  if (isNaN(targetBPM)) return;
  const targetHS = parseFloat(prompt('HSを入力してください', 1));
  if (isNaN(targetHS)) return;
  convertEqualSpeed(targetBPM, targetHS);
}

// 密度変更
function convertDensity(density) {
  const input = inputEl.value;
  const lines = input.split('\n');
  let output = [];
  let inNotes = false;

  for (let line of lines) {
    if (line.trim() === '#START') inNotes = true;
    if (line.trim() === '#END') inNotes = false;

    if (inNotes && !line.startsWith('#')) {
      let converted = line.replace(/[0-9]/g, m => m.repeat(density));
      output.push(converted);
    } else {
      output.push(line);
    }
  }

  outputEl.value = output.join('\n');
  copyBtn.disabled = false;
}

function convertDensityPrompt() {
  const density = parseInt(prompt('密度を何倍にしますか?', 2));

  if (isNaN(density) || density < 1 || density > 10) {
    alert('1〜10の自然数で入力してください');
    return;
  }

  convertDensity(density);
}

function copyOutput() {
  outputEl.select();
  outputEl.setSelectionRange(0, outputEl.value.length);
  navigator.clipboard.writeText(outputEl.value).then(() => {
    alert('コピーしました');
  });
}