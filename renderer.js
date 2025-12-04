const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const selectSaveDirBtn = document.getElementById('selectSaveDir');
const convertBtn = document.getElementById('convertBtn');
const savePathDisplay = document.getElementById('savePathDisplay');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const resultStats = document.getElementById('resultStats');

let selectedFiles = [];
let saveDirectory = null;

// Quality slider
qualitySlider.addEventListener('input', (e) => {
  qualityValue.textContent = e.target.value;
});

// Drop zone click
dropZone.addEventListener('click', async () => {
  const files = await window.electronAPI.selectFiles();
  if (files.length > 0) {
    addFiles(files);
  }
});

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');

  const files = Array.from(e.dataTransfer.files)
    .filter(file => /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file.name))
    .map(file => window.electronAPI.getPathForFile(file));

  if (files.length > 0) {
    addFiles(files);
  }
});

function addFiles(files) {
  files.forEach(file => {
    if (!selectedFiles.includes(file)) {
      selectedFiles.push(file);
    }
  });
  updateFileList();
  updateButtons();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
  updateButtons();
}

function updateFileList() {
  fileList.innerHTML = selectedFiles.map((file, index) => {
    const filename = file.split('/').pop().split('\\').pop();
    return `
      <div class="file-item" data-index="${index}">
        <span class="filename">${filename}</span>
        <span class="status pending">대기</span>
        <button class="remove-btn" onclick="removeFile(${index})">×</button>
      </div>
    `;
  }).join('');
}

function updateButtons() {
  selectSaveDirBtn.disabled = selectedFiles.length === 0;
  convertBtn.disabled = selectedFiles.length === 0 || !saveDirectory;
}

// Select save directory
selectSaveDirBtn.addEventListener('click', async () => {
  const dir = await window.electronAPI.selectSaveDirectory();
  if (dir) {
    saveDirectory = dir;
    savePathDisplay.textContent = `저장 위치: ${dir}`;
    updateButtons();
  }
});

// Convert button
convertBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0 || !saveDirectory) return;

  // Reset UI
  resultSection.style.display = 'none';
  progressSection.style.display = 'block';
  progressFill.style.width = '0%';
  convertBtn.disabled = true;
  selectSaveDirBtn.disabled = true;

  // Update file status
  document.querySelectorAll('.file-item .status').forEach(el => {
    el.textContent = '대기';
    el.className = 'status pending';
  });

  const quality = parseInt(qualitySlider.value);

  try {
    const results = await window.electronAPI.convertImages({
      files: selectedFiles,
      outputDir: saveDirectory,
      quality
    });

    showResults(results);
  } catch (error) {
    alert('변환 중 오류가 발생했습니다: ' + error.message);
  }

  convertBtn.disabled = false;
  selectSaveDirBtn.disabled = false;
});

// Progress updates
window.electronAPI.onConversionProgress((data) => {
  const percent = (data.current / data.total) * 100;
  progressFill.style.width = percent + '%';
  progressText.textContent = `변환 중... (${data.current}/${data.total}) - ${data.file}`;

  // Update file status
  const items = document.querySelectorAll('.file-item');
  items.forEach((item, index) => {
    const status = item.querySelector('.status');
    if (index < data.current) {
      status.textContent = '완료';
      status.className = 'status done';
    } else if (index === data.current - 1) {
      status.textContent = '변환중...';
      status.className = 'status processing';
    }
  });
});

function showResults(results) {
  progressSection.style.display = 'none';
  resultSection.style.display = 'block';

  const successCount = results.filter(r => r.success).length;
  const totalInputSize = results.filter(r => r.success).reduce((sum, r) => sum + r.inputSize, 0);
  const totalOutputSize = results.filter(r => r.success).reduce((sum, r) => sum + r.outputSize, 0);
  const reduction = totalInputSize > 0 ? ((1 - totalOutputSize / totalInputSize) * 100).toFixed(1) : 0;

  resultStats.innerHTML = `
    <div class="stat-row">
      <span>성공:</span>
      <span>${successCount}/${results.length} 파일</span>
    </div>
    <div class="stat-row">
      <span>원본 크기:</span>
      <span>${formatBytes(totalInputSize)}</span>
    </div>
    <div class="stat-row">
      <span>변환 후 크기:</span>
      <span>${formatBytes(totalOutputSize)}</span>
    </div>
    <div class="stat-row">
      <span>용량 절감:</span>
      <span class="size-reduction">${reduction}% 감소</span>
    </div>
  `;

  // Update all file statuses
  const items = document.querySelectorAll('.file-item');
  results.forEach((result, index) => {
    if (items[index]) {
      const status = items[index].querySelector('.status');
      if (result.success) {
        status.textContent = '완료';
        status.className = 'status done';
      } else {
        status.textContent = '오류';
        status.className = 'status error';
      }
    }
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
