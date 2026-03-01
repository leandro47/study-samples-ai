export class FormController {
    constructor(aiService, translationService, view) {
        this.aiService = aiService;
        this.translationService = translationService;
        this.view = view;
        this.isGenerating = false;
    }

    setupEventListeners() {
        // Update display values for range inputs
        this.view.onTemperatureChange((e) => {
            this.view.updateTemperatureDisplay(e.target.value);
        });

        this.view.onTopKChange((e) => {
            this.view.updateTopKDisplay(e.target.value);
        });

        // File input handlers
        this.view.onFileChange((event) => {
            this.view.handleFilePreview(event);
        });

        this.view.onFileButtonClick(() => {
            this.view.triggerFileInput();
        });

        // Form submit handler
        this.view.onFormSubmit(async (event) => {
            event.preventDefault();

            if (this.isGenerating) {
                this.stopGeneration();
                return;
            }

            await this.handleSubmit();
        });

        // Model download handlers
        this.view.onDownloadModelClick(async () => {
            await this.handleModelDownload();
        });

        this.view.onDownloadTranslationClick(async () => {
            await this.handleTranslationDownload();
        });

        // Listen for global download event (fallback)
        window.addEventListener('downloadModelClick', async () => {
            await this.handleModelDownload();
        });

        window.addEventListener('downloadTranslationClick', async () => {
            await this.handleTranslationDownload();
        });

        // Listen for model download events
        window.addEventListener('modelDownloadProgress', (e) => {
            this.view.updateDownloadProgress(e.detail.percent);
        });

        window.addEventListener('modelDownloadComplete', (e) => {
            this.view.onDownloadComplete();
            // Re-check requirements after successful download
            this.checkRequirements();
        });

        window.addEventListener('modelDownloadError', (e) => {
            this.view.onDownloadError(e.detail.error);
        });

        // Listen for translation download events
        window.addEventListener('translatorDownloadProgress', (e) => {
            this.view.updateDownloadProgress(e.detail.percent);
            this.view.updateProgressLabel('Baixando serviços de tradução...');
        });

        window.addEventListener('translationServicesReady', (e) => {
            this.view.onTranslationDownloadComplete();
        });

        window.addEventListener('translationServicesError', (e) => {
            this.view.onDownloadError(e.detail.error);
        });
    }

    async handleSubmit() {
        const question = this.view.getQuestionText();

        if (!question.trim()) {
            return;
        }

        // Get parameters from form
        const temperature = this.view.getTemperature();
        const topK = this.view.getTopK();
        const file = this.view.getFile();

        console.log('Using parameters:', { temperature, topK });

        // Change button to stop mode
        this.toggleButton(true);

        this.view.setOutput('Processing your question...');

        try {
            const aiResponseChunks = await this.aiService.createSession(
                question,
                temperature,
                topK,
                file
            );

            this.view.setOutput('');

            let fullResponse = '';
            for await (const chunk of aiResponseChunks) {
                if (this.aiService.isAborted()) {
                    break;
                }
                console.log('Received chunk:', chunk);
                fullResponse += chunk;
                this.view.setOutput(fullResponse);
            }

            // Translate the full response to Portuguese
            if (fullResponse && !this.aiService.isAborted()) {
                this.view.setOutput('Traduzindo resposta...');
                const translatedResponse = await this.translationService.translateToPortuguese(fullResponse);
                this.view.setOutput(translatedResponse);
            }
        } catch (error) {
            console.error('Error during AI generation:', error);
            this.view.setOutput(`Erro: ${error.message}`);
        }

        this.toggleButton(false);
    }

    stopGeneration() {
        this.aiService.abort();
        this.toggleButton(false);
    }

    async handleTranslationDownload() {
        this.view.setTranslationButtonLoading(true);
        this.view.showDownloadProgress(0);
        this.view.updateProgressLabel('Baixando serviços de tradução...');

        try {
            const result = await this.translationService.downloadServices();
            
            if (result.success) {
                this.view.onTranslationDownloadComplete();
                // Re-initialize translation after download
                await this.translationService.initialize();
            } else {
                this.view.onDownloadError(result.error);
            }
        } catch (error) {
            console.error('Error during translation download:', error);
            this.view.onDownloadError(error.message);
        } finally {
            this.view.setTranslationButtonLoading(false);
        }
    }

    async checkRequirements() {
        const errors = await this.aiService.checkRequirements();
        if (errors) {
            this.view.showErrors(errors);
        } else {
            this.view.hideErrors();
        }
    }

    toggleButton(isGenerating) {
        this.isGenerating = isGenerating;

        if (isGenerating) {
            this.view.setButtonToStopMode();
        } else {
            this.view.setButtonToSendMode();
        }
    }
}
