export class View {
    constructor() {
        this.elements = {
            temperature: document.getElementById('temperature'),
            temperatureValue: document.getElementById('temp-value'),
            topKValue: document.getElementById('topk-value'),
            topK: document.getElementById('topK'),
            form: document.getElementById('question-form'),
            questionInput: document.getElementById('question'),
            output: document.getElementById('output'),
            button: document.getElementById('ask-button'),
            year: document.getElementById('year'),
            fileInput: document.getElementById('file-input'),
            filePreview: document.getElementById('file-preview'),
            fileUploadBtn: document.getElementById('file-upload-btn'),
            fileSelectedName: document.getElementById('file-selected-name'),
            downloadModelBtn: document.getElementById('download-model-btn'),
            downloadTranslationBtn: document.getElementById('download-translation-btn'),
            downloadProgress: document.getElementById('download-progress'),
            downloadProgressBar: document.getElementById('download-progress-bar'),
        };
    }

    setYear() {
        this.elements.year.textContent = new Date().getFullYear();
    }

    initializeParameters(params) {
        this.elements.topK.max = params.maxTopK;
        this.elements.topK.min = 1;
        this.elements.topK.value = params.defaultTopK;
        this.elements.topKValue.textContent = params.defaultTopK;

        this.elements.temperatureValue.textContent = params.defaultTemperature;
        this.elements.temperature.max = params.maxTemperature;
        this.elements.temperature.min = 0;
        this.elements.temperature.value = params.defaultTemperature;
    }

    updateTemperatureDisplay(value) {
        this.elements.temperatureValue.textContent = value;
    }

    updateTopKDisplay(value) {
        this.elements.topKValue.textContent = value;
    }

    getQuestionText() {
        return this.elements.questionInput.value;
    }

    getTemperature() {
        return parseFloat(this.elements.temperature.value);
    }

    getTopK() {
        return parseInt(this.elements.topK.value);
    }

    getFile() {
        return this.elements.fileInput.files[0];
    }

    setOutput(text) {
        this.elements.output.textContent = text;
    }

    appendOutput(text) {
        this.elements.output.textContent += text;
    }

    showError(errors) {
        this.elements.output.innerHTML = errors.join('<br/>');
        this.elements.button.disabled = true;
    }

    setButtonToStopMode() {
        this.elements.button.textContent = 'Parar';
        this.elements.button.classList.add('stop-button');
    }

    setButtonToSendMode() {
        this.elements.button.textContent = 'Enviar';
        this.elements.button.classList.remove('stop-button');
    }

    handleFilePreview(event) {
        const file = event.target.files[0];
        this.elements.filePreview.innerHTML = '';
        this.elements.fileSelectedName.textContent = '';

        if (!file) return;

        // Show selected file name
        this.elements.fileSelectedName.textContent = `✓ ${file.name}`;
        this.elements.fileSelectedName.classList.add('selected');

        const fileType = file.type.split('/')[0];
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'preview-image';
            fileInfo.appendChild(img);
        } else if (fileType === 'audio') {
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            audio.controls = true;
            audio.className = 'preview-audio';
            fileInfo.appendChild(audio);
        }

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-file-btn';
        removeBtn.textContent = '× Remover arquivo';
        removeBtn.onclick = () => {
            this.elements.fileInput.value = '';
            this.elements.filePreview.innerHTML = '';
            this.elements.fileSelectedName.textContent = '';
            this.elements.fileSelectedName.classList.remove('selected');
        };
        fileInfo.appendChild(removeBtn);

        this.elements.filePreview.appendChild(fileInfo);
    }

    triggerFileInput() {
        this.elements.fileInput.click();
    }

    onTemperatureChange(callback) {
        this.elements.temperature.addEventListener('input', callback);
    }

    onTopKChange(callback) {
        this.elements.topK.addEventListener('input', callback);
    }

    onFileChange(callback) {
        this.elements.fileInput.addEventListener('change', callback);
    }

    onFileButtonClick(callback) {
        this.elements.fileUploadBtn.addEventListener('click', callback);
    }

    onFormSubmit(callback) {
        this.elements.form.addEventListener('submit', callback);
    }

    // Model download methods
    onDownloadModelClick(callback) {
        if (this.elements.downloadModelBtn) {
            this.elements.downloadModelBtn.addEventListener('click', callback);
        }
    }

    onDownloadTranslationClick(callback) {
        if (this.elements.downloadTranslationBtn) {
            this.elements.downloadTranslationBtn.addEventListener('click', callback);
        }
    }

    setDownloadButtonLoading(isLoading) {
        if (this.elements.downloadModelBtn) {
            if (isLoading) {
                this.elements.downloadModelBtn.disabled = true;
                this.elements.downloadModelBtn.textContent = 'Baixando...';
                this.elements.downloadModelBtn.classList.add('loading');
            } else {
                this.elements.downloadModelBtn.disabled = false;
                this.elements.downloadModelBtn.innerHTML = '<span class="download-icon">⬇️</span><span class="download-text">Download Model</span>';
                this.elements.downloadModelBtn.classList.remove('loading');
            }
        }
    }

    setTranslationButtonLoading(isLoading) {
        if (this.elements.downloadTranslationBtn) {
            if (isLoading) {
                this.elements.downloadTranslationBtn.disabled = true;
                this.elements.downloadTranslationBtn.textContent = 'Baixando...';
                this.elements.downloadTranslationBtn.classList.add('loading');
            } else {
                this.elements.downloadTranslationBtn.disabled = false;
                this.elements.downloadTranslationBtn.innerHTML = '<span class="download-icon">🌐</span><span class="download-text">Download Translation Services</span>';
                this.elements.downloadTranslationBtn.classList.remove('loading');
            }
        }
    }

    showDownloadProgress(percent) {
        if (this.elements.downloadProgress && this.elements.downloadProgressBar) {
            this.elements.downloadProgress.style.display = 'block';
            this.elements.downloadProgressBar.style.width = `${percent}%`;
            this.elements.downloadProgressBar.textContent = `${percent}%`;
        }
    }

    updateDownloadProgress(percent) {
        this.showDownloadProgress(percent);
    }

    updateProgressLabel(label) {
        const progressLabel = this.elements.downloadProgress.querySelector('.progress-label');
        if (progressLabel) {
            progressLabel.textContent = label;
        }
    }

    hideDownloadProgress() {
        if (this.elements.downloadProgress) {
            this.elements.downloadProgress.style.display = 'none';
        }
    }

    onDownloadComplete() {
        this.hideDownloadProgress();
        this.setOutput('✅ Modelo baixado com sucesso! Você já pode usar a IA.');
        this.elements.button.disabled = false;
        
        // Hide download button if it exists
        if (this.elements.downloadModelBtn) {
            this.elements.downloadModelBtn.style.display = 'none';
        }
    }

    onTranslationDownloadComplete() {
        this.hideDownloadProgress();
        this.setOutput('✅ Serviços de tradução baixados com sucesso!');
        
        // Hide translation button if it exists
        if (this.elements.downloadTranslationBtn) {
            this.elements.downloadTranslationBtn.style.display = 'none';
        }
    }

    onDownloadError(error) {
        this.hideDownloadProgress();
        this.setOutput(`❌ Erro ao baixar: ${error}`);
        this.setDownloadButtonLoading(false);
        this.setTranslationButtonLoading(false);
    }

    showErrors(errors) {
        this.elements.output.innerHTML = errors.join('<br/>');
        this.elements.button.disabled = true;
        
        // Show download button if model needs to be downloaded
        if (errors.some(error => error.includes('precisa ser baixado'))) {
            if (this.elements.downloadModelBtn) {
                this.elements.downloadModelBtn.style.display = 'block';
            }
        }
        
        // Show translation button if translation services need to be downloaded
        if (errors.some(error => error.includes('tradutor precisa ser baixado'))) {
            if (this.elements.downloadTranslationBtn) {
                this.elements.downloadTranslationBtn.style.display = 'block';
            }
        }
    }

    hideErrors() {
        this.elements.output.textContent = '';
        this.elements.button.disabled = false;
        
        // Hide download buttons if everything is ready
        if (this.elements.downloadModelBtn) {
            this.elements.downloadModelBtn.style.display = 'none';
        }
        if (this.elements.downloadTranslationBtn) {
            this.elements.downloadTranslationBtn.style.display = 'none';
        }
    }
}
