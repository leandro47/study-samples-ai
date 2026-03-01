export class AIService {
    constructor() {
        this.session = null;
        this.abortController = null;
    }

    async checkRequirements() {
        const errors = [];

        // @ts-ignore
        const isChrome = !!window.chrome;
        if (!isChrome) {
            errors.push("⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente).");
        }

        if (!('LanguageModel' in self)) {
            errors.push("⚠️ As APIs nativas de IA não estão ativas.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)");
            errors.push("Depois reinicie o Chrome e tente novamente.");
            return errors;
        }

        // Check Translator availability
        if ('Translator' in self) {
            const translatorAvailability = await Translator.availability({
                sourceLanguage: 'en',
                targetLanguage: 'pt'
            });
            console.log('Translator Availability:', translatorAvailability);

            if (translatorAvailability === 'no') {
                errors.push("⚠️ Tradução de inglês para português não está disponível.");
            }
        } else {
            errors.push("⚠️ A API de Tradução não está ativa.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Translation API (chrome://flags/#translation-api)");
        }

        // Check Language Detection API
        if (!('LanguageDetector' in self)) {
            errors.push("⚠️ A API de Detecção de Idioma não está ativa.");
            errors.push("Ative a seguinte flag em chrome://flags/:");
            errors.push("- Language Detection API (chrome://flags/#language-detector-api)");
        }

        if (errors.length > 0) {
            return errors;
        }

        const availability = await LanguageModel.availability({ languages: ["en"] });
        console.log('Language Model Availability:', availability);

        if (availability === 'available') {
            return null;
        }

        if (availability === 'unavailable') {
            errors.push(`⚠️ O seu dispositivo não suporta modelos de linguagem nativos de IA.`);
        }

        if (availability === 'downloading') {
            errors.push(`⚠️ O modelo de linguagem de IA está sendo baixado. Por favor, aguarde alguns minutos e tente novamente.`);
        }

        if (availability === 'downloadable') {
            errors.push(`⚠️ O modelo de linguagem de IA precisa ser baixado.`);
            errors.push(`📱 Por favor, clique no botão "Download Model" na interface para iniciar o download.`);
            errors.push(`💡 O download requer uma interação do usuário (gesto do usuário) por questões de segurança.`);
            
            // Não tentar baixar automaticamente - requer user gesture
            // O download deve ser iniciado pelo usuário através da interface
            return errors;
        }

        return errors.length > 0 ? errors : null;
    }

    async getParams() {
        const params = await LanguageModel.params();
        console.log('Language Model Params:', params);
        return params;
    }

    async checkModelStatus() {
        const availability = await LanguageModel.availability({ languages: ["en"] });
        console.log('Current model status:', availability);
        return availability;
    }

    async downloadModel() {
        try {
            console.log('Iniciando download do modelo...');
            
            // Usar configuração mínima para download
            const session = await LanguageModel.create({
                expectedInputs: ["text"],
                expectedOutputs: ["text"],
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        const percent = ((e.loaded / e.total) * 100).toFixed(0);
                        console.log(`Download progress: ${percent}%`);
                        
                        // Disparar evento para interface
                        window.dispatchEvent(new CustomEvent('modelDownloadProgress', {
                            detail: { percent: parseInt(percent) }
                        }));
                    });
                }
            });
            
            // Testar sessão brevemente para garantir funcionamento
            await session.prompt('Hello');
            session.destroy();
            
            // Aguardar um momento e verificar disponibilidade
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const finalAvailability = await LanguageModel.availability({ languages: ["en"] });
            console.log('Model availability after download:', finalAvailability);
            
            if (finalAvailability === 'available') {
                console.log('✅ Download do modelo concluído com sucesso!');
                
                // Notificar sucesso
                window.dispatchEvent(new CustomEvent('modelDownloadComplete', {
                    detail: { success: true }
                }));
                
                return { success: true, message: 'Modelo baixado com sucesso!' };
            } else {
                throw new Error(`Download concluído mas modelo ainda não disponível. Status: ${finalAvailability}`);
            }
            
        } catch (error) {
            console.error('Erro ao baixar modelo:', error);
            
            // Notificar erro
            window.dispatchEvent(new CustomEvent('modelDownloadError', {
                detail: { error: error.message }
            }));
            
            return { success: false, error: error.message };
        }
    }

    async* createSession(question, temperature, topK, file = null) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        // Check model availability before creating session
        const availability = await LanguageModel.availability({ languages: ["en"] });
        console.log('Model availability before session:', availability);
        
        if (availability !== 'available') {
            throw new Error(`Model capability is not available. Current status: ${availability}. Please ensure the model is downloaded.`);
        }

        // Destroy previous session and create new one with updated parameters
        if (this.session) {
            this.session.destroy();
        }

        try {
            // Verificar se precisamos de suporte a multimídia
            const needsImageSupport = file && file.type.startsWith('image/');
            const needsAudioSupport = file && file.type.startsWith('audio/');
            const needsMultimediaSupport = needsImageSupport || needsAudioSupport;
            
            if (needsMultimediaSupport) {
                console.log('Criando sessão com suporte multimídia...', { image: needsImageSupport, audio: needsAudioSupport });
                
                const inputs = [{ type: "text", languages: ["en"] }];
                if (needsImageSupport) inputs.push({ type: "image" });
                if (needsAudioSupport) inputs.push({ type: "audio" });
                
                this.session = await LanguageModel.create({
                    expectedInputs: inputs,
                    expectedOutputs: [{ type: "text", languages: ["en"] }],
                    temperature: temperature,
                    topK: topK,
                    initialPrompts: [
                        {
                            role: 'system',
                            content: [{
                                type: "text",
                                value: `You are an AI assistant that responds clearly and objectively.
                                Always respond in plain text format instead of markdown.`
                            }]
                        },
                    ],
                });
            } else {
                console.log('Criando sessão apenas com texto...');
                this.session = await LanguageModel.create({
                    expectedInputs: [
                        { type: "text", languages: ["en"] }
                    ],
                    expectedOutputs: [{ type: "text", languages: ["en"] }],
                    temperature: temperature,
                    topK: topK,
                    initialPrompts: [
                        {
                            role: 'system',
                            content: [{
                                type: "text",
                                value: `You are an AI assistant that responds clearly and objectively.
                                Always respond in plain text format instead of markdown.`
                            }]
                        },
                    ],
                });
            }
        } catch (sessionError) {
            console.warn('Failed to create session with full config, trying minimal config:', sessionError);
            
            // Fallback: tentar com configuração mínima
            this.session = await LanguageModel.create({
                expectedInputs: ["text"],
                expectedOutputs: ["text"],
                temperature: temperature,
                topK: topK
            });
            
            // Se estamos usando fallback e há arquivo, avisar o usuário
            if (file) {
                throw new Error('Arquivo não suportado. A sessão foi criada apenas com suporte a texto.');
            }
        }

        // Build content array with text and optional file
        const contentArray = [{ type: "text", value: question }];

        if (file) {
            const fileType = file.type.split('/')[0];
            if (fileType === 'image' || fileType === 'audio') {
                // Convert file to blob for proper handling
                const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                contentArray.push({ type: fileType, value: blob });
                console.log(`Adding ${fileType} to prompt:`, file.name);
            }
        }

        const responseStream = await this.session.promptStreaming(
            [
                {
                    role: 'user',
                    content: contentArray,
                },
            ],
            {
                signal: this.abortController.signal,
            }
        );

        for await (const chunk of responseStream) {
            if (this.abortController.signal.aborted) {
                break;
            }
            yield chunk;
        }
    }

    abort() {
        this.abortController?.abort();
    }

    isAborted() {
        return this.abortController?.signal.aborted;
    }
}
