# COMO USAR ESTA DEMONSTRAÇÃO

## Estrutura de Arquivos

```
modulo_05/
├── readme.md                    # Documentação completa
├── package.json                 # Configuração do projeto
└── examples/
    ├── run.js                   # Executador principal
    ├── embeddings.js            # Demo de embeddings
    ├── attention.js             # Demo de attention mechanism
    ├── transformer.js           # Demo de transformers
    └── generation.js            # Demo de text generation
```

## Como Executar

### 1. Executar Todos os Exemplos
```bash
cd modulo_05
node examples/run.js
```

### 2. Executar Exemplo Específico
```bash
# Embeddings
node examples/embeddings.js

# Attention Mechanism
node examples/attention.js

# Transformers
node examples/transformer.js

# Text Generation
node examples/generation.js
```

### 3. Usar npm scripts (se disponível)
```bash
npm start          # Executar todos
npm run embeddings  # Apenas embeddings
npm run attention   # Apenas attention
npm run transformer # Apenas transformer
npm run generation  # Apenas generation
```

## O que Cada Demo Mostra

### 🔤 embeddings.js
- **Conceito**: Como palavras viram vetores numéricos
- **Demonstrações**:
  - Similaridade de cosseno entre palavras
  - Propriedades matemáticas (analogias)
  - Busca semântica
  - Visualização 2D simplificada

### 🧠 attention.js
- **Conceito**: Mecanismo de foco seletivo dos Transformers
- **Demonstrações**:
  - Scaled dot-product attention
  - Self-attention em frases
  - Multi-head attention
  - Cross-attention (encoder-decoder)
  - Matriz de attention

### 🤖 transformer.js
- **Conceito**: Arquitetura completa Transformer
- **Demonstrações**:
  - Positional encoding
  - Layer normalization
  - Feed-forward networks
  - Multi-head attention
  - Mini-transformer funcional
  - Classificação de texto

### ✍️ generation.js
- **Conceito**: Geração autoregressiva de texto
- **Demonstrações**:
  - Tokenização e vocabulário
  - Language model simplificado
  - Estratégias de sampling (greedy, temperature, top-k, top-p)
  - Beam search
  - Análise de diversidade
  - Métricas de qualidade

## Conceitos Fundamentais Demonstrados

✅ **Embeddings**: Palavras → Vetores numéricos com significado  
✅ **Attention**: Foco seletivo nas partes importantes  
✅ **Transformers**: Arquitetura com attention paralela  
✅ **Generation**: Previsão autoregressiva de tokens  
✅ **Fine-Tuning**: Adaptação para domínios específicos  

## Requisitos

- Node.js 14+ 
- Nenhum pacote externo necessário (usa apenas Node.js nativo)

## Dicas de Aprendizado

1. **Execute na ordem**: embeddings → attention → transformer → generation
2. **Leia o código**: Cada demo tem comentários detalhados
3. **Experimente**: Modifique parâmetros e veja os resultados
4. **Compare**: Note como cada conceito se conecta

## Para Estudo Avançado

Depois de entender os conceitos básicos, explore:
- Arquiteturas específicas (BERT, GPT, T5)
- Técnicas de fine-tuning
- Métricas de avaliação (BLEU, ROUGE, Perplexity)
- Otimização e escalabilidade

---

**Nota**: Esta é uma demonstração educacional simplificada. LLMs reais usam:
- Milhões/bilhões de parâmetros
- Dados massivos de treinamento
- Hardware especializado (GPUs/TPUs)
- Otimização avançada
