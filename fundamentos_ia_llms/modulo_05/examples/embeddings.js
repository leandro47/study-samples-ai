// EMBEDDINGS DEMONSTRAÇÃO
// Como representações vetoriais capturam significado semântico

console.log("🔤 EMBEDDINGS - REPRESENTAÇÕES VETORIAIS DE PALAVRAS\n");

// 1. Exemplo simplificado de embeddings
// Na prática: 768+ dimensões (BERT, GPT, etc.)
const embeddings = {
    "rei": [0.2, 0.8, 0.1, 0.9, 0.3, 0.7],
    "rainha": [0.3, 0.7, 0.2, 0.8, 0.4, 0.6],
    "homem": [0.4, 0.6, 0.3, 0.7, 0.5, 0.5],
    "mulher": [0.5, 0.5, 0.4, 0.6, 0.6, 0.4],
    "carro": [0.1, 0.2, 0.9, 0.1, 0.8, 0.2],
    "moto": [0.2, 0.1, 0.8, 0.2, 0.7, 0.3],
    "gato": [0.9, 0.1, 0.2, 0.8, 0.1, 0.9],
    "cachorro": [0.8, 0.2, 0.1, 0.9, 0.2, 0.8]
};

// 2. Similaridade de Cosseno
// Mede quão similares são dois vetores
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((acc, a, i) => acc + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, a) => acc + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, b) => acc + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// 3. Distância Euclidiana
// Mede distância geométrica entre vetores
function euclideanDistance(vecA, vecB) {
    return Math.sqrt(
        vecA.reduce((acc, a, i) => acc + Math.pow(a - vecB[i], 2), 0)
    );
}

// 4. Análise de similaridades
console.log("=== ANÁLISE DE SIMILARIDADE SEMÂNTICA ===");

// Relações de gênero
const simReiRainha = cosineSimilarity(embeddings.rei, embeddings.rainha);
const simHomemMulher = cosineSimilarity(embeddings.homem, embeddings.mulher);

// Relações de categoria
const simCarroMoto = cosineSimilarity(embeddings.carro, embeddings.moto);
const simGatoCachorro = cosineSimilarity(embeddings.gato, embeddings.cachorro);

// Relações cruzadas
const simReiCarro = cosineSimilarity(embeddings.rei, embeddings.carro);
const simGatoRainha = cosineSimilarity(embeddings.gato, embeddings.rainha);

console.log("Relações de Gênero:");
console.log(`  Rei ↔ Rainha: ${simReiRainha.toFixed(3)}`);
console.log(`  Homem ↔ Mulher: ${simHomemMulher.toFixed(3)}`);

console.log("\nRelações de Categoria:");
console.log(`  Carro ↔ Moto: ${simCarroMoto.toFixed(3)}`);
console.log(`  Gato ↔ Cachorro: ${simGatoCachorro.toFixed(3)}`);

console.log("\nRelações Cruzadas (baixa similaridade):");
console.log(`  Rei ↔ Carro: ${simReiCarro.toFixed(3)}`);
console.log(`  Gato ↔ Rainha: ${simGatoRainha.toFixed(3)}`);

// 5. Propriedade matemática dos embeddings
// Operações vetoriais preservam relações semânticas
console.log("\n=== PROPRIEDADES MATEMÁTICAS ===");

// Vetor de gênero: rainha - rei ≈ mulher - homem
function vectorSubtract(vecA, vecB) {
    return vecA.map((a, i) => a - vecB[i]);
}

function vectorAdd(vecA, vecB) {
    return vecA.map((a, i) => a + vecB[i]);
}

const genero1 = vectorSubtract(embeddings.rainha, embeddings.rei);
const genero2 = vectorSubtract(embeddings.mulher, embeddings.homem);

const similaridadeGenero = cosineSimilarity(genero1, genero2);
console.log(`Similaridade vetores de gênero: ${similaridadeGenero.toFixed(3)}`);
console.log("→ rainha - rei ≈ mulher - homem (relação de gênero)");

// 6. Analogias
// rei - homem + mulher ≈ rainha
const analogia = vectorAdd(
    vectorSubtract(embeddings.rei, embeddings.homem),
    embeddings.mulher
);

// Encontrar palavra mais próxima da analogia
function findClosestWord(targetVector, embeddings, excludeWords = []) {
    let closestWord = null;
    let maxSimilarity = -1;
    
    for (const [word, embedding] of Object.entries(embeddings)) {
        if (excludeWords.includes(word)) continue;
        
        const similarity = cosineSimilarity(targetVector, embedding);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            closestWord = word;
        }
    }
    
    return { word: closestWord, similarity: maxSimilarity };
}

const resultado = findClosestWord(analogia, embeddings, ["rei", "homem", "mulher"]);
console.log(`Analogia "rei - homem + mulher" ≈ "${resultado.word}" (${resultado.similarity.toFixed(3)})`);

// 7. Aplicações práticas
console.log("\n=== APLICAÇÕES PRÁTICAS ===");

// Busca semântica
function semanticSearch(query, documents, embeddings) {
    const queryEmbedding = embeddings[query.toLowerCase()];
    if (!queryEmbedding) return [];
    
    const results = documents.map(doc => {
        const docEmbedding = embeddings[doc.toLowerCase()];
        if (!docEmbedding) return { doc, similarity: 0 };
        
        return {
            doc,
            similarity: cosineSimilarity(queryEmbedding, docEmbedding)
        };
    });
    
    return results.sort((a, b) => b.similarity - a.similarity);
}

const documentos = ["rei", "rainha", "homem", "mulher", "carro", "gato"];
const busca = semanticSearch("rei", documentos, embeddings);

console.log(`Busca semântica para "rei":`);
busca.forEach(({ doc, similarity }) => {
    console.log(`  ${doc}: ${similarity.toFixed(3)}`);
});

// 8. Visualização simplificada
console.log("\n=== VISUALIZAÇÃO 2D SIMPLIFICADA ===");

// Projeção simplificada para 2D (apenas para demonstração)
function projectTo2D(vector) {
    // Na prática usaríamos PCA ou t-SNE
    return [vector[0], vector[1]];
}

console.log("Coordenadas 2D (simplificado):");
Object.entries(embeddings).forEach(([word, vector]) => {
    const [x, y] = projectTo2D(vector);
    console.log(`  ${word}: (${x.toFixed(2)}, ${y.toFixed(2)})`);
});

console.log("\n✅ CONCEITOS DEMONSTRADOS:");
console.log("  • Embeddings capturam significado semântico");
console.log("  • Similaridade de cosseno mede proximidade semântica");
console.log("  • Operações vetoriais preservam relações");
console.log("  • Analogias podem ser resolvidas algebricamente");
console.log("  • Busca semântica usa similaridade de embeddings");

// 9. Fatos sobre embeddings no mundo real
console.log("\n=== FATOS SOBRE EMBEDDINGS REAIS ===");
console.log("  • Word2Vec (2013): 300 dimensões, treinado em Google News");
console.log("  • GloVe (2014): 300 dimensões, co-occurrence statistics");
console.log("  • BERT (2018): 768 dimensões, contextual embeddings");
console.log("  • GPT-3 (2020): 12288 dimensões, 175 bilhões de parâmetros");
console.log("  • Treinamento: bilhões de palavras, semanas em GPU clusters");
