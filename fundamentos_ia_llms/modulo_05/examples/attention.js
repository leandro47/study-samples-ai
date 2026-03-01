// ATTENTION MECHANISM DEMONSTRAÇÃO
// O coração da arquitetura Transformers

console.log("🧠 ATTENTION MECHANISM - FOCO SELETIVO CONTEXTUAL\n");

// 1. Softmax Function
// Converte scores em probabilidades que somam 1
function softmax(scores) {
    const expScores = scores.map(s => Math.exp(s - Math.max(...scores))); // Evitar overflow
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(s => s / sumExp);
}

// 2. Scaled Dot-Product Attention
// Attention(Q, K, V) = softmax(QK^T / √d_k)V
function scaledDotProductAttention(query, keys, values) {
    const d_k = keys[0].length; // Dimensão das keys
    const scaleFactor = Math.sqrt(d_k);
    
    console.log(`Dimensão das keys (d_k): ${d_k}`);
    console.log(`Scale factor (√d_k): ${scaleFactor.toFixed(3)}`);
    
    // Calcular scores: Q · K^T
    const scores = keys.map(key => {
        const dotProduct = query.reduce((acc, q, i) => acc + q * key[i], 0);
        return dotProduct / scaleFactor;
    });
    
    console.log(`Scores brutos: [${scores.map(s => s.toFixed(3)).join(', ')}]`);
    
    // Aplicar softmax para obter pesos
    const weights = softmax(scores);
    console.log(`Pesos (softmax): [${weights.map(w => w.toFixed(3)).join(', ')}]`);
    
    // Calcular output: soma ponderada dos valores
    const output = values.reduce((acc, val, i) => 
        acc.map((v, j) => v + val[j] * weights[i]), 
        new Array(values[0].length).fill(0)
    );
    
    return { output, weights, scores };
}

// 3. Exemplo Prático: Análise de Sentenças
console.log("=== EXEMPLO: ANÁLISE DE SENTENÇA ===");

const sentence = "O gato preto dorme no sofá";
const words = sentence.split(" ");

console.log(`Sentença: "${sentence}"`);
console.log(`Palavras: [${words.map(w => `"${w}"`).join(', ')}]`);

// Embeddings simplificados para cada palavra
// Na prática seriam 768+ dimensões de modelos pré-treinados
const wordEmbeddings = {
    "O": [0.1, 0.2, 0.3, 0.1],
    "gato": [0.8, 0.1, 0.4, 0.9],
    "preto": [0.2, 0.7, 0.1, 0.3],
    "dorme": [0.3, 0.3, 0.8, 0.2],
    "no": [0.1, 0.1, 0.2, 0.1],
    "sofá": [0.6, 0.4, 0.2, 0.7]
};

// 4. Self-Attention: Cada palavra prestando atenção às outras
console.log("\n=== SELF-ATTENTION: CADA PALAVRA FOCANDO NAS DEMAIS ===");

function selfAttention(words, embeddings) {
    const results = [];
    
    words.forEach((targetWord, targetIdx) => {
        console.log(`\n--- "${targetWord}" prestando atenção ---`);
        
        const query = embeddings[targetWord];
        const keys = words.map(w => embeddings[w]);
        const values = keys;
        
        const { output, weights, scores } = scaledDotProductAttention(query, keys, values);
        
        console.log(`Attention weights para "${targetWord}":`);
        weights.forEach((weight, i) => {
            console.log(`  ${words[i]}: ${weight.toFixed(3)} (${(weight * 100).toFixed(1)}%)`);
        });
        
        results.push({
            word: targetWord,
            output: output,
            weights: weights,
            attention: words.map((w, i) => ({ word: w, weight: weights[i] }))
        });
    });
    
    return results;
}

const attentionResults = selfAttention(words, wordEmbeddings);

// 5. Visualização da Attention Matrix
console.log("\n=== ATTENTION MATRIX ===");

function printAttentionMatrix(results, words) {
    console.log("      " + words.map(w => w.padEnd(6)).join(" "));
    
    results.forEach((result, i) => {
        const row = result.weights.map(w => w.toFixed(3).padStart(6)).join(" ");
        console.log(`${words[i].padEnd(6)} ${row}`);
    });
}

printAttentionMatrix(attentionResults, words);

// 6. Multi-Head Attention (simplificado)
// Múltiplas "cabeças" de attention focando em diferentes aspectos
console.log("\n=== MULTI-HEAD ATTENTION ===");

function multiHeadAttention(query, keys, values, numHeads = 3) {
    console.log(`Usando ${numHeads} cabeças de attention`);
    
    const heads = [];
    
    for (let head = 0; head < numHeads; head++) {
        // Na prática, cada teria suas próprias matrizes W_q, W_k, W_v
        // Aqui usamos projeções simplificadas
        const projection = (vector, headId) => {
            return vector.map((v, i) => v * (1 + headId * 0.1) * Math.sin(i + headId));
        };
        
        const projectedQuery = projection(query, head);
        const projectedKeys = keys.map(k => projection(k, head));
        const projectedValues = values.map(v => projection(v, head));
        
        const { output, weights } = scaledDotProductAttention(
            projectedQuery, 
            projectedKeys, 
            projectedValues
        );
        
        heads.push({ head: head + 1, output, weights });
        
        console.log(`Head ${head + 1}: Maior peso na palavra ${
            words[weights.indexOf(Math.max(...weights))]
        } (${Math.max(...weights).toFixed(3)})`);
    }
    
    // Concatenar e projetar outputs (simplificado)
    const combinedOutput = heads.reduce((acc, head) => 
        acc.map((v, i) => v + head.output[i] / numHeads), 
        new Array(values[0].length).fill(0)
    );
    
    return { heads, combinedOutput };
}

// Testar com "gato" como query
const gatoQuery = wordEmbeddings["gato"];
const allKeys = words.map(w => wordEmbeddings[w]);
const allValues = allKeys;

const multiHeadResult = multiHeadAttention(gatoQuery, allKeys, allValues);

// 7. Cross-Attention (Encoder-Decoder)
// Query do decoder, Keys/Values do encoder
console.log("\n=== CROSS-ATTENTION (ENCODER-DECODER) ===");

// Contexto do encoder (frase em português)
const encoderTokens = ["O", "gato", "dorme"];
const encoderEmbeddings = encoderTokens.map(t => wordEmbeddings[t]);

// Query do decoder (gerando tradução)
const decoderQuery = [0.7, 0.2, 0.5, 0.8]; // "The" em inglês (simplificado)

console.log("Encoder tokens:", encoderTokens.join(" "));
console.log("Decoder query: [tradução de 'The']");

const crossAttention = scaledDotProductAttention(
    decoderQuery,
    encoderEmbeddings,
    encoderEmbeddings
);

console.log("Cross-attention weights:");
encoderTokens.forEach((token, i) => {
    console.log(`  ${token}: ${crossAttention.weights[i].toFixed(3)}`);
});

// 8. Aplicações Práticas
console.log("\n=== APLICAÇÕES DO ATTENTION ===");

console.log("✅ Tradução Automática:");
console.log("   • Alinha palavras entre idiomas");
console.log("   • Lida com ordens de palavras diferentes");

console.log("\n✅ Sumarização de Texto:");
console.log("   • Identifica partes mais importantes");
console.log("   • Gera resumos coerentes");

console.log("\n✅ Question Answering:");
console.log("   • Foca em partes relevantes do contexto");
console.log("   • Responde perguntas específicas");

console.log("\n✅ Análise de Sentimento:");
console.log("   • Identifica palavras-chave emocionais");
console.log("   • Captura nuances contextuais");

// 9. Propriedades Importantes
console.log("\n=== PROPRIEDADES DO ATTENTION ===");

console.log("🔹 Complexidade: O(n²·d) onde n = sequência, d = dimensão");
console.log("🔹 Paralelizável: Diferente de RNNs/LSTMs");
console.log("🔹 Interpretável: Pesos mostram o que o modelo 'olha'");
console.log("🔹 Flexível: Self-attention, cross-attention, multi-head");

// 10. Exemplo de Cálculo Detalhado
console.log("\n=== CÁLCULO DETALHADO DE ATTENTION ===");

const query = [1, 0, 1];
const keys = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const values = [[10, 20], [30, 40], [50, 60]];

console.log("Query:", query);
console.log("Keys:", keys);
console.log("Values:", values);

const detailed = scaledDotProductAttention(query, keys, values);

console.log("\nPasso a passo:");
console.log("1. Calcular scores (dot products):");
keys.forEach((key, i) => {
    const score = query.reduce((acc, q, j) => acc + q * key[j], 0);
    console.log(`   Q·K${i+1}: ${score}`);
});

console.log("\n2. Aplicar softmax:");
console.log("   Pesos normalizados:", detailed.weights.map(w => w.toFixed(3)));

console.log("\n3. Calcular output (soma ponderada):");
console.log("   Output final:", detailed.output.map(v => v.toFixed(2)));

console.log("\n✅ ATTENTION COMPREENDIDO!");
console.log("   • Mecanismo fundamental dos Transformers");
console.log("   • Permite foco seletivo e contextual");
console.log("   • Base do sucesso de modelos como BERT e GPT");
