const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyBtn');
const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');

inputEl.addEventListener('input', () => {
  convertBtn.disabled = inputEl.value.trim() === '';
  copyBtn.disabled = true;
});

function convert() {
  const input = inputEl.value;
  const lines = input.split('\n');
  let output = [];
  let inNotes = false;

  const map = { '1': '3', '3': '1', '2': '4', '4': '2', '5': '6', '6': '5' };

  for (let line of lines) {
    if (line.startsWith('#START')) inNotes = true;
    if (line.startsWith('#END')) inNotes = false;

    if (inNotes && !line.startsWith('#')) {
      output.push(line.replace(/[123456]/g, m => map[m] || m));
    } else {
      output.push(line);
    }
  }

  outputEl.value = output.join('\n');

  copyBtn.disabled = false;
}

function copyOutput() {
  outputEl.select();
  outputEl.setSelectionRange(0, outputEl.value.length);
  navigator.clipboard.writeText(outputEl.value).then(() => {
    alert('コピーしました');
  });
}
