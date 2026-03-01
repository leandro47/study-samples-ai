# COMO FUNCIONAM LLMS: TRANSFORMERS, EMBEDDINGS, ATTENTION

## Overview

Large Language Models (LLMs) são modelos de IA que processam e geram linguagem natural usando arquiteturas avançadas de deep learning. Os componentes fundamentais são:

## 1. EMBEDDINGS

### O que são?
- Representações vetoriais de palavras/tokens
- Capturam significado semântico em espaços multidimensionais
- Palavras similares têm vetores próximos no espaço

### Como funcionam?
```javascript
// Exemplo simplificado
const embeddings = {
    "rei": [0.2, 0.8, 0.1, 0.9],
    "rainha": [0.3, 0.7, 0.2, 0.8],
    "homem": [0.4, 0.6, 0.3, 0.7]
};
```

### Características:
- **Dimensão**: 768+ na prática (ex: BERT, GPT)
- **Treinamento**: Aprendidos durante o pré-treinamento
- **Propriedade**: Operações aritméticas preservam significado

## 2. ATTENTION MECHANISM

### O que é?
- Mecanismo que permite ao modelo focar em partes relevantes da entrada
- Similar à atenção humana em palavras-chave
- Base dos Transformers

### Como funciona?
1. **Query**: O que estou procurando agora
2. **Keys**: O que cada palavra oferece
3. **Values**: O conteúdo real de cada palavra
4. **Scores**: Similaridade entre query e keys
5. **Weights**: Normalização dos scores (softmax)
6. **Output**: Combinação ponderada dos valores

### Fórmula:
```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

## 3. TRANSFORMERS

### Arquitetura principal:
- **Multi-Head Attention**: Múltiplas atenções em paralelo
- **Positional Encoding**: Informação de posição das palavras
- **Feed-Forward Networks**: Processamento não-linear
- **Layer Normalization**: Estabilização do treinamento
- **Residual Connections**: Evitam vanishing gradients

### Vantagens:
- Processamento paralelo (diferente de RNNs)
- Captura dependências de longo alcance
- Escalabilidade para grandes modelos

## 4. COMO LLMs GERAM TEXTO

### Processo de Decodificação:
1. **Tokenization**: Texto → Tokens
2. **Embedding**: Tokens → Vetores
3. **Context Encoding**: Attention + Transformers
4. **Prediction**: Probabilidades do próximo token
5. **Sampling**: Seleção do token (temperature, top-k, top-p)
6. **Iteration**: Repetir até token de fim

### Exemplo:
```
Input: "O gato"
Process: Prever próximo token → "está"
Output: "O gato está"
```

## 5. TÉCNICAS AVANÇADAS

### Fine-Tuning
- Adaptar modelos pré-treinados para domínios específicos
- Transfer learning: conhecimento geral → específico

### Chain-of-Thought
- Raciocínio passo a passo
- Melhora resolução de problemas complexos

### Few-Shot Learning
- Aprendizado com poucos exemplos
- Contextualização in-context

## 6. MÉTRICAS DE AVALIAÇÃO

### Perplexity
- Quão surpreso o modelo está com o próximo token
- Menor = melhor (mais confiante)

### BLEU/ROUGE
- Similaridade com textos de referência
- Usado para tradução e sumarização

### Human Evaluation
- Qualidade e utilidade percebida
- Alinhamento com expectativas humanas

## 7. ESCALA E IMPACTO

### Dados de Treinamento:
- **Scale**: Trilhões de tokens
- **Fontes**: Internet, livros, artigos, código
- **Qualidade**: Diversidade e limpeza crucial

### Computação:
- **Hardware**: GPU clusters, TPUs
- **Tempo**: Semanas a meses de treinamento
- **Custo**: Milhões de dólares

## EXEMPLOS PRÁTICOS

Veja os exemplos executáveis na pasta `examples/`:
- `embeddings.js` - Demonstração de embeddings e similaridade
- `attention.js` - Mecanismo de attention passo a passo
- `transformer.js` - Mini-transformer funcional
- `generation.js` - Geração autoregressiva de texto

## CONCEITOS-CHAVE

✅ **Embeddings**: Palavras → Vetores numéricos com significado  
✅ **Attention**: Foco seletivo nas partes importantes  
✅ **Transformers**: Arquitetura com attention paralela  
✅ **LLMs**: Models treinados em escala massiva  
✅ **Generation**: Previsão autoregressiva de tokens  
✅ **Fine-Tuning**: Adaptação para domínios específicos  

## A MÁGICA DOS LLMs

A eficácia dos LLMs vem da combinação de:
- **Dados massivos** (trilhões de tokens)
- **Arquitetura Transformers** eficiente
- **Treinamento em escala** (GPU clusters)
- **Otimização avançada** (Adam, learning rates)

---

## Referências
- "Attention Is All You Need" (Vaswani et al., 2017)
- "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018)
- "GPT-3: Language Models are Few-Shot Learners" (Brown et al., 2020)