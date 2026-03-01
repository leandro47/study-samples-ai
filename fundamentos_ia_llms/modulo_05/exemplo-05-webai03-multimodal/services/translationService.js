export class TranslationService {
    constructor() {
        this.translator = null;
        this.languageDetector = null;
    }

    async initialize() {
        try {
            // Check translator availability first
            const translatorAvailability = await Translator.availability({ 
                sourceLanguage: 'en', 
                targetLanguage: 'pt' 
            });
            console.log('Translator Availability:', translatorAvailability);

            if (translatorAvailability === 'downloadable') {
                console.log('⚠️ Translator precisa ser baixado. Requer interação do usuário.');
                throw new Error('⚠️ O tradutor precisa ser baixado. Por favor, inicialize o serviço manualmente quando solicitado.');
            }

            if (translatorAvailability === 'available') {
                this.translator = await Translator.create({
                    sourceLanguage: 'en',
                    targetLanguage: 'pt',
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            const percent = ((e.loaded / e.total) * 100).toFixed(0);
                            console.log(`Translator downloaded ${percent}%`);
                        });
                    }
                });
                console.log('Translator initialized');
            }

            // Check language detector availability
            const detectorAvailability = await LanguageDetector.availability();
            console.log('Language Detector Availability:', detectorAvailability);

            if (detectorAvailability === 'downloadable') {
                console.log('⚠️ Language Detector precisa ser baixado. Requer interação do usuário.');
            } else if (detectorAvailability === 'available') {
                this.languageDetector = await LanguageDetector.create();
                console.log('Language Detector initialized');
            }

            return true;
        } catch (error) {
            console.error('Error initializing translation:', error);
            throw new Error('⚠️ Erro ao inicializar APIs de tradução: ' + error.message);
        }
    }

    async downloadServices() {
        try {
            console.log('Iniciando download dos serviços de tradução...');
            
            // Download translator
            if (!this.translator) {
                this.translator = await Translator.create({
                    sourceLanguage: 'en',
                    targetLanguage: 'pt',
                    monitor(m) {
                        m.addEventListener('downloadprogress', (e) => {
                            const percent = ((e.loaded / e.total) * 100).toFixed(0);
                            console.log(`Translator download progress: ${percent}%`);
                            
                            window.dispatchEvent(new CustomEvent('translatorDownloadProgress', {
                                detail: { percent: parseInt(percent) }
                            }));
                        });
                    }
                });
                console.log('✅ Translator baixado com sucesso!');
            }

            // Download language detector
            if (!this.languageDetector) {
                this.languageDetector = await LanguageDetector.create();
                console.log('✅ Language Detector baixado com sucesso!');
            }

            window.dispatchEvent(new CustomEvent('translationServicesReady', {
                detail: { success: true }
            }));

            return { success: true, message: 'Serviços de tradução baixados com sucesso!' };
            
        } catch (error) {
            console.error('Erro ao baixar serviços:', error);
            window.dispatchEvent(new CustomEvent('translationServicesError', {
                detail: { error: error.message }
            }));
            
            return { success: false, error: error.message };
        }
    }

    async translateToPortuguese(text) {
        if (!this.translator) {
            console.warn('Translator not available, returning original text');
            return text;
        }

        try {
            // Detect language first
            if (this.languageDetector) {
                const detectionResults = await this.languageDetector.detect(text);
                console.log('Detected languages:', detectionResults);

                // If already in Portuguese, no need to translate
                if (detectionResults && detectionResults[0]?.detectedLanguage === 'pt') {
                    console.log('Text is already in Portuguese');
                    return text;
                }
            }

            // Use streaming translation
            const stream = this.translator.translateStreaming(text);
            let translated = '';
            for await (const chunk of stream) {
                translated = chunk; // Each chunk is the full translation so far
            }
            console.log('Translated text:', translated);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text if translation fails
        }
    }
}
