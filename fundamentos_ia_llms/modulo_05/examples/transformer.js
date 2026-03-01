// MINI-TRANSFORMER DEMONSTRAÇÃO
// Implementação simplificada da arquitetura Transformer

console.log("🤖 MINI-TRANSFORMER - ARQUITETURA COMPLETA SIMPLIFICADA\n");

// 1. Positional Encoding
// Adiciona informação de posição aos embeddings
function positionalEncoding(maxLength, dModel) {
    const encoding = [];
    
    for (let pos = 0; pos < maxLength; pos++) {
        const posVector = [];
        
        for (let i = 0; i < dModel; i++) {
            const angle = pos / Math.pow(10000, 2 * i / dModel);
            posVector.push(i % 2 === 0 ? Math.sin(angle) : Math.cos(angle));
        }
        
        encoding.push(posVector);
    }
    
    return encoding;
}

// 2. Layer Normalization
// Estabiliza o treinamento, normalizando por amostra
function layerNorm(x, eps = 1e-6) {
    const mean = x.reduce((sum, val) => sum + val, 0) / x.length;
    const variance = x.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / x.length;
    
    return x.map(val => (val - mean) / Math.sqrt(variance + eps));
}

// 3. Feed-Forward Network
// Processamento não-linear após attention
function feedForward(x, dModel, dFF = 2048) {
    // Simplificação: projeção linear + ReLU + projeção linear
    // Na prática seriam matrizes de pesos aprendidas
    
    const W1 = Array(dFF).fill(0).map(() => 
        Array(dModel).fill(0).map(() => Math.random() * 0.1)
    );
    const W2 = Array(dModel).fill(0).map(() => 
        Array(dFF).fill(0).map(() => Math.random() * 0.1)
    );
    
    // Primeira camada: x · W1
    const hidden = W1.map(w => 
        x.reduce((sum, val, i) => sum + val * w[i], 0)
    ).map(val => Math.max(0, val)); // ReLU
    
    // Segunda camada: hidden · W2
    const output = W2.map(w => 
        hidden.reduce((sum, val, i) => sum + val * w[i], 0)
    );
    
    return output;
}

// 4. Multi-Head Attention (completo)
function multiHeadAttention(queries, keys, values, numHeads = 2, dModel = 4) {
    const headDim = dModel / numHeads;
    const heads = [];
    
    for (let head = 0; head < numHeads; head++) {
        // Projeções simplificadas para cada cabeça
        const project = (matrix, headId) => {
            return matrix.map(vector => 
                vector.map((v, i) => v * (1 + headId * 0.2) * Math.cos(i + headId))
            );
        };
        
        const projectedQueries = project(queries, head);
        const projectedKeys = project(keys, head);
        const projectedValues = project(values, head);
        
        // Attention para cada cabeça
        const headOutputs = projectedQueries.map(query => {
            const scores = projectedKeys.map(key => 
                query.reduce((acc, q, i) => acc + q * key[i], 0) / Math.sqrt(headDim)
            );
            
            const weights = softmax(scores);
            
            return projectedValues.reduce((acc, val, i) => 
                acc.map((v, j) => v + val[j] * weights[i]), 
                new Array(headDim).fill(0)
            );
        });
        
        heads.push(headOutputs);
    }
    
    // Concatenar cabeças
    const concatenated = queries.map((_, seqIdx) => {
        const result = [];
        for (let head = 0; head < numHeads; head++) {
            result.push(...heads[head][seqIdx]);
        }
        return result;
    });
    
    return concatenated;
}

// 5. Softmax
function softmax(scores) {
    const expScores = scores.map(s => Math.exp(s - Math.max(...scores)));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(s => s / sumExp);
}

// 6. Transformer Layer (Encoder)
function transformerLayer(x, numHeads = 2, dModel = 4) {
    console.log(`\n--- Transformer Layer (dModel=${dModel}, heads=${numHeads}) ---`);
    
    // 1. Multi-Head Self-Attention
    console.log("1. Multi-Head Self-Attention...");
    const attentionOutput = multiHeadAttention(x, x, x, numHeads, dModel);
    
    // 2. Add & Norm (Residual Connection + Layer Norm)
    console.log("2. Add & Norm...");
    const attentionNorm = layerNorm(
        x.map((vec, i) => vec.map((v, j) => v + attentionOutput[i][j]))
    );
    
    // 3. Feed-Forward
    console.log("3. Feed-Forward Network...");
    const ffOutput = attentionNorm.map(vec => feedForward(vec, dModel));
    
    // 4. Add & Norm (segunda residual connection)
    console.log("4. Add & Norm final...");
    const output = layerNorm(
        attentionNorm.map((vec, i) => vec.map((v, j) => v + ffOutput[i][j]))
    );
    
    return output;
}

// 7. Mini Transformer Encoder
class MiniTransformer {
    constructor(numLayers = 2, numHeads = 2, dModel = 4, maxLength = 10) {
        this.numLayers = numLayers;
        this.numHeads = numHeads;
        this.dModel = dModel;
        this.maxLength = maxLength;
        
        // Positional encoding pré-calculada
        this.posEncoding = positionalEncoding(maxLength, dModel);
        
        console.log(`MiniTransformer criado:`);
        console.log(`  - Layers: ${numLayers}`);
        console.log(`  - Heads: ${numHeads}`);
        console.log(`  - Model dim: ${dModel}`);
        console.log(`  - Max length: ${maxLength}`);
    }
    
    // Tokenização simplificada
    tokenize(text) {
        return text.toLowerCase().split(" ").filter(t => t.length > 0);
    }
    
    // Embeddings simplificados
    embed(tokens) {
        const vocab = {
            "o": [0.1, 0.2, 0.3, 0.4],
            "gato": [0.8, 0.1, 0.5, 0.9],
            "preto": [0.2, 0.7, 0.1, 0.3],
            "dorme": [0.3, 0.3, 0.8, 0.2],
            "no": [0.1, 0.1, 0.2, 0.1],
            "sofá": [0.6, 0.4, 0.2, 0.7],
            "feliz": [0.9, 0.8, 0.1, 0.5],
            "brinca": [0.7, 0.2, 0.6, 0.8]
        };
        
        return tokens.map(token => 
            vocab[token] || Array(this.dModel).fill(0).map(() => Math.random() * 0.1)
        );
    }
    
    // Forward pass completo
    forward(text) {
        console.log(`\n🔄 FORWARD PASS: "${text}"`);
        
        // 1. Tokenização
        const tokens = this.tokenize(text);
        console.log(`Tokens: [${tokens.map(t => `"${t}"`).join(', ')}]`);
        
        // 2. Embeddings
        const embeddings = this.embed(tokens);
        console.log(`Embeddings shape: [${embeddings.length} x ${this.dModel}]`);
        
        // 3. Adicionar Positional Encoding
        const inputWithPos = embeddings.map((emb, i) => 
            emb.map((v, j) => v + this.posEncoding[i][j])
        );
        console.log("Positional encoding adicionada");
        
        // 4. Passar pelas camadas Transformer
        let output = inputWithPos;
        
        for (let layer = 0; layer < this.numLayers; layer++) {
            console.log(`\n📍 Layer ${layer + 1}/${this.numLayers}`);
            output = transformerLayer(output, this.numHeads, this.dModel);
        }
        
        return {
            tokens,
            embeddings,
            output,
            representation: output
        };
    }
    
    // Classificação simplificada
    classify(text, classes = ["animal", "objeto", "ação"]) {
        const result = this.forward(text);
        
        // Pooling simples: média das representações
        const pooled = result.output.reduce((acc, vec) => 
            acc.map((v, i) => v + vec[i] / result.output.length), 
            new Array(this.dModel).fill(0)
        );
        
        // Projeção para classes (simplificado)
        const scores = classes.map((cls, i) => 
            pooled.reduce((sum, val, j) => sum + val * Math.sin(i + j), 0)
        );
        
        const probabilities = softmax(scores);
        
        return {
            text,
            classes: classes.map((cls, i) => ({
                class: cls,
                probability: probabilities[i],
                confidence: (probabilities[i] * 100).toFixed(1) + "%"
            })),
            prediction: classes[probabilities.indexOf(Math.max(...probabilities))]
        };
    }
}

// 8. Demonstrações Práticas
console.log("=== DEMONSTRAÇÃO DO MINI-TRANSFORMER ===");

// Criar o modelo
const transformer = new MiniTransformer(2, 2, 4, 10);

// Testar com diferentes frases
const frases = [
    "O gato preto dorme",
    "O gato feliz brinca",
    "O sofá confortável"
];

frases.forEach(frase => {
    console.log(`\n${"=".repeat(50)}`);
    const result = transformer.classify(frase);
    
    console.log(`\n📊 Classificação de: "${frase}"`);
    result.classes.forEach(({ class: cls, probability, confidence }) => {
        console.log(`  ${cls}: ${confidence}`);
    });
    console.log(`🎯 Predição: ${result.prediction}`);
});

// 9. Análise de Attention
console.log(`\n${"=".repeat(50)}`);
console.log("=== ANÁLISE DE ATTENTION ===");

// Examinar como o modelo processa a frase
const analise = transformer.forward("O gato preto dorme");

console.log("\nRepresentações finais por token:");
analise.tokens.forEach((token, i) => {
    const repr = analise.output[i].map(v => v.toFixed(3));
    console.log(`  ${token}: [${repr.join(', ')}]`);
});

// 10. Comparação com Arquiteturas Anteriores
console.log(`\n${"=".repeat(50)}`);
console.log("=== COMPARAÇÃO COM ARQUITETURAS ANTERIORES ===");

console.log("🔄 RNN/LSTM:");
console.log("  • Processamento sequencial");
console.log("  • Dificuldade com dependências longas");
console.log("  • Não paralelizável");
console.log("  • Vanishing gradients");

console.log("\n⚡ Transformer:");
console.log("  • Processamento paralelo");
console.log("  • Attention captura dependências longas");
console.log("  • Altamente escalável");
console.log("  • Residual connections evitam gradients");

// 11. Escalabilidade
console.log(`\n${"=".repeat(50)}`);
console.log("=== ESCALABILIDADE DE TRANSFORMERS ===");

const modelos = [
    { name: "BERT-Base", layers: 12, heads: 12, dModel: 768, params: "110M" },
    { name: "BERT-Large", layers: 24, heads: 16, dModel: 1024, params: "340M" },
    { name: "GPT-2", layers: 48, heads: 25, dModel: 1600, params: "1.5B" },
    { name: "GPT-3", layers: 96, heads: 96, dModel: 12288, params: "175B" }
];

console.log("Modelos Transformer na prática:");
modelos.forEach(model => {
    console.log(`  ${model.name}:`);
    console.log(`    Layers: ${model.layers}, Heads: ${model.heads}`);
    console.log(`    Dim: ${model.dModel}, Params: ${model.params}`);
});

console.log(`\n✅ MINI-TRANSFORMER DEMONSTRADO!`);
console.log("   • Arquitetura completa implementada");
console.log("   • Multi-head attention + feed-forward");
console.log("   • Positional encoding + layer norm");
console.log("   • Base para modelos como BERT e GPT");
