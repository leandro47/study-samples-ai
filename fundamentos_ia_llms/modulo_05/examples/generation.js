// TEXT GENERATION DEMONSTRAÇÃO
// Como LLMs geram texto de forma autoregressiva

console.log("✍️ TEXT GENERATION - GERAÇÃO AUTOREGRESSIVA DE TEXTO\n");

// 1. Vocabulary e Tokenizer
class SimpleTokenizer {
    constructor() {
        this.vocab = [
            "<PAD>", "<UNK>", "<EOS>", "<BOS>",
            "o", "gato", "preto", "dorme", "no", "sofá",
            "feliz", "brinca", "com", "bola", "corre",
            "come", "peixe", "mia", "rápido", "devagar"
        ];
        
        this.vocabToId = {};
        this.vocab.forEach((word, id) => {
            this.vocabToId[word] = id;
        });
        
        console.log(`Vocabulário criado com ${this.vocab.length} tokens`);
        console.log("Tokens:", this.vocab.slice(4).join(", "));
    }
    
    encode(text) {
        const tokens = text.toLowerCase()
            .replace(/[.,!?]/g, "")
            .split(/\s+/)
            .filter(t => t.length > 0);
        
        return tokens.map(token => 
            this.vocabToId[token] || this.vocabToId["<UNK>"]
        );
    }
    
    decode(tokenIds) {
        return tokenIds
            .map(id => this.vocab[id] || "<UNK>")
            .join(" ");
    }
}

// 2. Language Model Simplificado
class SimpleLanguageModel {
    constructor(vocabSize, embeddingDim = 8) {
        this.vocabSize = vocabSize;
        this.embeddingDim = embeddingDim;
        
        // Embeddings aleatórios (na prática seriam aprendidos)
        this.embeddings = Array(vocabSize).fill(0).map(() => 
            Array(embeddingDim).fill(0).map(() => Math.random() * 0.2 - 0.1)
        );
        
        // Matriz de output (simplificada)
        this.outputWeights = Array(vocabSize).fill(0).map(() => 
            Array(embeddingDim).fill(0).map(() => Math.random() * 0.1)
        );
        
        // Context window
        this.contextWindow = 4;
        
        console.log(`Modelo criado: vocabSize=${vocabSize}, embedDim=${embeddingDim}`);
    }
    
    // Forward pass
    forward(contextTokens) {
        // 1. Embeddings dos tokens de contexto
        const contextEmbeddings = contextTokens.map(tokenId => 
            this.embeddings[tokenId]
        );
        
        // 2. Pooling simples (média dos contextos)
        const pooledEmbedding = contextEmbeddings.reduce((acc, emb) => 
            acc.map((v, i) => v + emb[i] / contextEmbeddings.length), 
            new Array(this.embeddingDim).fill(0)
        );
        
        // 3. Calcular logits para todos os tokens
        const logits = this.outputWeights.map(weights => 
            weights.reduce((sum, w, i) => sum + w * pooledEmbedding[i], 0)
        );
        
        return logits;
    }
    
    // Converter logits em probabilidades
    logitsToProbs(logits, temperature = 1.0) {
        const scaledLogits = logits.map(l => l / temperature);
        const maxLogit = Math.max(...scaledLogits);
        const expLogits = scaledLogits.map(l => Math.exp(l - maxLogit));
        const sumExp = expLogits.reduce((a, b) => a + b, 0);
        
        return expLogits.map(e => e / sumExp);
    }
    
    // Prever próximo token
    predictNext(contextTokens, temperature = 1.0) {
        const logits = this.forward(contextTokens);
        const probs = this.logitsToProbs(logits, temperature);
        
        return { logits, probs };
    }
}

// 3. Sampling Strategies
class SamplingStrategies {
    // Greedy: sempre escolhe o token mais provável
    static greedy(probs) {
        const maxProb = Math.max(...probs);
        return probs.indexOf(maxProb);
    }
    
    // Temperature sampling: controla aleatoriedade
    static temperature(probs, temp = 1.0) {
        if (temp <= 0.1) return SamplingStrategies.greedy(probs);
        
        const scaledProbs = probs.map(p => Math.pow(p, 1.0 / temp));
        const sumScaled = scaledProbs.reduce((a, b) => a + b, 0);
        const normalized = scaledProbs.map(p => p / sumScaled);
        
        return SamplingStrategies.multinomial(normalized);
    }
    
    // Top-k: considera apenas os k tokens mais prováveis
    static topK(probs, k = 5) {
        const indexed = probs.map((p, i) => ({ prob: p, index: i }));
        indexed.sort((a, b) => b.prob - a.prob);
        
        const topK = indexed.slice(0, k);
        const topKProbs = topK.map(item => item.prob);
        const sumTopK = topKProbs.reduce((a, b) => a + b, 0);
        const normalized = topKProbs.map(p => p / sumTopK);
        
        const sampledIndex = SamplingStrategies.multinomial(normalized);
        return topK[sampledIndex].index;
    }
    
    // Top-p (nucleus sampling): soma cumulativa de probabilidades
    static topP(probs, p = 0.9) {
        const indexed = probs.map((prob, i) => ({ prob, index: i }));
        indexed.sort((a, b) => b.prob - a.prob);
        
        let cumSum = 0;
        const nucleus = [];
        
        for (const item of indexed) {
            nucleus.push(item);
            cumSum += item.prob;
            if (cumSum >= p) break;
        }
        
        const nucleusProbs = nucleus.map(item => item.prob);
        const sumNucleus = nucleusProbs.reduce((a, b) => a + b, 0);
        const normalized = nucleusProbs.map(p => p / sumNucleus);
        
        const sampledIndex = SamplingStrategies.multinomial(normalized);
        return nucleus[sampledIndex].index;
    }
    
    // Amostragem multinomial
    static multinomial(probs) {
        const random = Math.random();
        let cumSum = 0;
        
        for (let i = 0; i < probs.length; i++) {
            cumSum += probs[i];
            if (random <= cumSum) return i;
        }
        
        return probs.length - 1;
    }
}

// 4. Text Generator
class TextGenerator {
    constructor(tokenizer, model) {
        this.tokenizer = tokenizer;
        this.model = model;
        this.bosToken = this.tokenizer.vocabToId["<BOS>"];
        this.eosToken = this.tokenizer.vocabToId["<EOS>"];
    }
    
    generate(prompt, maxLength = 20, strategy = "greedy", options = {}) {
        console.log(`\n🎯 Gerando texto para: "${prompt}"`);
        console.log(`Estratégia: ${strategy}, Max length: ${maxLength}`);
        
        // 1. Tokenizar o prompt
        const promptTokens = [
            this.bosToken,
            ...this.tokenizer.encode(prompt)
        ];
        
        console.log(`Prompt tokens: [${promptTokens.map(id => 
            this.tokenizer.vocab[id]).join(", ")}]`);
        
        let generatedTokens = [...promptTokens];
        let generationLog = [];
        
        // 2. Geração autoregressiva
        for (let step = 0; step < maxLength; step++) {
            // Pegar contexto da janela
            const contextWindow = generatedTokens.slice(
                -this.model.contextWindow
            );
            
            // Prever próximo token
            const { probs } = this.model.predictNext(
                contextWindow, 
                options.temperature || 1.0
            );
            
            // Escolher token com a estratégia especificada
            let nextTokenId;
            switch (strategy) {
                case "greedy":
                    nextTokenId = SamplingStrategies.greedy(probs);
                    break;
                case "temperature":
                    nextTokenId = SamplingStrategies.temperature(
                        probs, options.temperature || 1.0
                    );
                    break;
                case "topk":
                    nextTokenId = SamplingStrategies.topK(
                        probs, options.k || 5
                    );
                    break;
                case "topp":
                    nextTokenId = SamplingStrategies.topP(
                        probs, options.p || 0.9
                    );
                    break;
                default:
                    nextTokenId = SamplingStrategies.greedy(probs);
            }
            
            // Adicionar token gerado
            generatedTokens.push(nextTokenId);
            
            // Log da geração
            const nextToken = this.tokenizer.vocab[nextTokenId];
            const confidence = (probs[nextTokenId] * 100).toFixed(1);
            
            generationLog.push({
                step: step + 1,
                token: nextToken,
                confidence: confidence,
                topProbs: this.getTopProbs(probs, 3)
            });
            
            // Parar se encontrar EOS
            if (nextTokenId === this.eosToken) {
                console.log(`\n🛑 Token <EOS> encontrado na etapa ${step + 1}`);
                break;
            }
        }
        
        // 3. Decodificar resultado
        const generatedText = this.tokenizer.decode(
            generatedTokens.slice(1) // Remover <BOS>
        );
        
        return {
            prompt,
            generatedText,
            generationLog,
            tokens: generatedTokens.slice(1)
        };
    }
    
    getTopProbs(probs, n = 3) {
        const indexed = probs.map((p, i) => ({ 
            prob: p, 
            token: this.tokenizer.vocab[i] 
        }));
        indexed.sort((a, b) => b.prob - a.prob);
        
        return indexed.slice(0, n).map(item => 
            `${item.token}: ${(item.prob * 100).toFixed(1)}%`
        );
    }
}

// 5. Demonstrações
console.log("=== CONFIGURAÇÃO INICIAL ===");

const tokenizer = new SimpleTokenizer();
const model = new SimpleLanguageModel(tokenizer.vocab.length, 8);
const generator = new TextGenerator(tokenizer, model);

// 6. Testar diferentes estratégias de geração
const prompts = [
    "o gato preto",
    "o gato feliz",
    "o gato corre"
];

const strategies = [
    { name: "greedy", params: {} },
    { name: "temperature", params: { temperature: 0.7 } },
    { name: "topk", params: { k: 3 } },
    { name: "topp", params: { p: 0.8 } }
];

prompts.forEach(prompt => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📝 PROMPT: "${prompt}"`);
    
    strategies.forEach(({ name, params }) => {
        const result = generator.generate(prompt, 10, name, params);
        
        console.log(`\n🎲 Estratégia ${name}:`);
        console.log(`   Texto gerado: "${result.generatedText}"`);
        console.log(`   Tokens: [${result.tokens.map(t => tokenizer.vocab[t]).join(", ")}]`);
        
        // Mostrar detalhes da primeira geração
        if (result.generationLog.length > 0) {
            const firstStep = result.generationLog[0];
            console.log(`   Primeiro token: "${firstStep.token}" (${firstStep.confidence}% confiança)`);
            console.log(`   Top 3: ${firstStep.topProbs.join(", ")}`);
        }
    });
});

// 7. Análise de Diversidade
console.log(`\n${"=".repeat(60)}`);
console.log("=== ANÁLISE DE DIVERSIDADE DE GERAÇÃO ===");

const testPrompt = "o cachorro";
const numGenerations = 5;

strategies.forEach(({ name, params }) => {
        console.log(`\n🎲 Estratégia: ${name}`);
        const generations = [];
        
        for (let i = 0; i < numGenerations; i++) {
            const result = generator.generate(testPrompt, 8, name, params);
            generations.push(result.generatedText);
            console.log(`  ${i + 1}: "${result.generatedText}"`);
        }
        
        // Calcular diversidade (tokens únicos)
        const allTokens = generations.join(" ").split(" ");
        const uniqueTokens = new Set(allTokens);
        const diversity = (uniqueTokens.size / allTokens.length * 100).toFixed(1);
        
        console.log(`  📊 Diversidade: ${diversity}% (${uniqueTokens.size}/${allTokens.length} tokens únicos)`);
    });

// 8. Beam Search (avançado)
console.log(`\n${"=".repeat(60)}`);
console.log("=== BEAM SEARCH (BUSCA EM FEIXE) ===");

function beamSearch(model, tokenizer, prompt, beamWidth = 3, maxLength = 10) {
    console.log(`🔍 Beam Search: width=${beamWidth}, maxLen=${maxLength}`);
    
    const bosToken = tokenizer.vocabToId["<BOS>"];
    const eosToken = tokenizer.vocabToId["<EOS>"];
    
    // Inicializar beam com o prompt
    let beams = [{
        tokens: [bosToken, ...tokenizer.encode(prompt)],
        score: 0.0,
        finished: false
    }];
    
    const results = [];
    
    for (let step = 0; step < maxLength; step++) {
        const newBeams = [];
        
        for (const beam of beams) {
            if (beam.finished) {
                newBeams.push(beam);
                continue;
            }
            
            // Prever próximos tokens
            const context = beam.tokens.slice(-model.contextWindow);
            const { probs } = model.predictNext(context);
            
            // Expandir beam com top-k tokens
            const topTokens = probs
                .map((p, i) => ({ prob: p, token: i }))
                .sort((a, b) => b.prob - a.prob)
                .slice(0, beamWidth);
            
            for (const { prob, token } of topTokens) {
                const newTokens = [...beam.tokens, token];
                const newScore = beam.score + Math.log(prob + 1e-8);
                const finished = token === eosToken;
                
                newBeams.push({
                    tokens: newTokens,
                    score: newScore,
                    finished
                });
            }
        }
        
        // Manter apenas os melhores beams
        newBeams.sort((a, b) => b.score - a.score);
        beams = newBeams.slice(0, beamWidth);
        
        // Verificar se todos terminaram
        if (beams.every(beam => beam.finished)) {
            results.push(...beams);
            break;
        }
    }
    
    // Retornar melhor resultado
    const best = beams[0];
    const text = tokenizer.decode(best.tokens.slice(1)); // Remover <BOS>
    
    console.log(`   Melhor resultado: "${text}" (score: ${best.score.toFixed(3)})`);
    console.log(`   Tokens: [${best.tokens.map(t => tokenizer.vocab[t]).join(", ")}]`);
    
    return text;
}

// Testar beam search
const beamResult = beamSearch(model, tokenizer, "o gato", 3, 8);

// 9. Métricas de Qualidade
console.log(`\n${"=".repeat(60)}`);
console.log("=== MÉTRICAS DE QUALIDADE ===");

// Perplexity
function calculatePerplexity(model, tokenizer, testTexts) {
    let totalLogProb = 0;
    let totalTokens = 0;
    
    testTexts.forEach(text => {
        const tokens = tokenizer.encode(text);
        
        for (let i = 0; i < tokens.length - 1; i++) {
            const context = tokens.slice(Math.max(0, i - model.contextWindow + 1), i + 1);
            const { probs } = model.predictNext(context);
            const targetProb = probs[tokens[i + 1]];
            
            totalLogProb += Math.log(targetProb + 1e-8);
            totalTokens++;
        }
    });
    
    const avgLogProb = totalLogProb / totalTokens;
    const perplexity = Math.exp(-avgLogProb);
    
    return perplexity;
}

const testTexts = [
    "o gato preto dorme",
    "o gato feliz brinca",
    "o gato come peixe"
];

const perplexity = calculatePerplexity(model, tokenizer, testTexts);
console.log(`📊 Perplexity: ${perplexity.toFixed(2)}`);
console.log("   (Menor = melhor, modelo mais confiante)");

// 10. Resumo dos Conceitos
console.log(`\n${"=".repeat(60)}`);
console.log("=== RESUMO DE TEXT GENERATION ===");

console.log("✅ Componentes da Geração:");
console.log("   • Tokenizer: texto ↔ tokens");
console.log("   • Language Model: prevê probabilidades");
console.log("   • Sampling Strategies: como escolher tokens");
console.log("   • Decoding: tokens ↔ texto");

console.log("\n✅ Estratégias de Sampling:");
console.log("   • Greedy: sempre o mais provável (determinístico)");
console.log("   • Temperature: controla criatividade");
console.log("   • Top-k: limita a candidatos mais prováveis");
console.log("   • Top-p: soma cumulativa de probabilidade");
console.log("   • Beam Search: busca em feixe (melhor qualidade)");

console.log("\n✅ Processo Autoregressivo:");
console.log("   1. Tokenizar input");
console.log("   2. Prever próximo token");
console.log("   3. Adicionar token à sequência");
console.log("   4. Repetir até EOS ou max length");

console.log("\n✅ Aplicações:");
console.log("   • Chatbots e assistentes virtuais");
console.log("   • Geração de conteúdo criativo");
console.log("   • Tradução automática");
console.log("   • Sumarização de texto");

console.log(`\n🎉 TEXT GENERATION DEMONSTRADO!`);
