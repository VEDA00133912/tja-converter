const convertBtn = document.getElementById('convertBtn');
const convertDonBtn = document.getElementById('convertDonBtn');
const convertKaBtn = document.getElementById('convertKaBtn');
const convertEqualBtn = document.getElementById('convertEqualBtn');
const copyBtn = document.getElementById('copyBtn');
const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');

inputEl.addEventListener('input', () => {
  const hasValue = inputEl.value.trim() !== '';
  convertBtn.disabled = !hasValue;
  convertDonBtn.disabled = !hasValue;
  convertKaBtn.disabled = !hasValue;
  convertEqualBtn.disabled = !hasValue;
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

// 等速
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

function copyOutput() {
  outputEl.select();
  outputEl.setSelectionRange(0, outputEl.value.length);
  navigator.clipboard.writeText(outputEl.value).then(() => {
    alert('コピーしました');
  });
}
