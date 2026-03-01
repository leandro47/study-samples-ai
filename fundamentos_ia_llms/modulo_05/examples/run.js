#!/usr/bin/env node

// MAIN DEMO - EXECUTAR TODOS OS EXEMPLOS DE LLMs
console.log("🚀 DEMONSTRAÇÃO COMPLETA: COMO FUNCIONAM LLMS");
console.log("=".repeat(60));

const fs = require('fs');
const path = require('path');

// Lista de exemplos para executar
const examples = [
    { file: 'embeddings.js', title: 'EMBEDDINGS - Representações Vetoriais' },
    { file: 'attention.js', title: 'ATTENTION MECHANISM - Foco Seletivo' },
    { file: 'transformer.js', title: 'TRANSFORMER - Arquitetura Completa' },
    { file: 'generation.js', title: 'TEXT GENERATION - Geração Autoregressiva' }
];

// Executar cada exemplo
async function runExample(examplePath, title) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📁 EXECUTANDO: ${title}`);
    console.log(`📂 Arquivo: ${examplePath}`);
    console.log(`${"=".repeat(60)}`);
    
    try {
        // Ler e executar o arquivo
        const fullPath = path.join(__dirname, examplePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Executar o código em um contexto isolado
        const vm = require('vm');
        const context = {
            console: console,
            Math: Math,
            Array: Array,
            Object: Object,
            Set: Set,
            require: require
        };
        
        vm.createContext(context);
        vm.runInContext(content, context);
        
        console.log(`\n✅ ${title} executado com sucesso!`);
        
    } catch (error) {
        console.error(`\n❌ Erro ao executar ${examplePath}:`, error.message);
    }
}

// Menu interativo
function showMenu() {
    console.log("\n📋 MENU DE DEMONSTRAÇÕES:");
    console.log("=".repeat(40));
    
    examples.forEach((example, index) => {
        console.log(`${index + 1}. ${example.title}`);
    });
    
    console.log("0. Executar todos os exemplos");
    console.log("9. Sair");
    console.log("=".repeat(40));
}

// Executar exemplo específico
async function runExampleByIndex(index) {
    if (index === 0) {
        // Executar todos
        console.log("\n🔄 EXECUTANDO TODOS OS EXEMPLOS...\n");
        
        for (let i = 0; i < examples.length; i++) {
            await runExample(examples[i].file, examples[i].title);
            
            // Pausa entre exemplos
            if (i < examples.length - 1) {
                console.log("\n⏸️ Pressione Enter para continuar...");
                await waitForInput();
            }
        }
        
        console.log("\n🎉 TODOS OS EXEMPLOS EXECUTADOS!");
        
    } else if (index >= 1 && index <= examples.length) {
        const example = examples[index - 1];
        await runExample(example.file, example.title);
        
    } else if (index === 9) {
        console.log("\n👋 Até logo!");
        process.exit(0);
        
    } else {
        console.log("\n❌ Opção inválida!");
    }
}

// Esperar input do usuário
function waitForInput() {
    return new Promise((resolve) => {
        process.stdin.once('data', () => resolve());
    });
}

// Execução baseada em argumentos de linha de comando
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Executar exemplo específico por argumento
        const exampleName = args[0].toLowerCase();
        const example = examples.find(ex => 
            ex.file.toLowerCase().includes(exampleName) ||
            ex.title.toLowerCase().includes(exampleName)
        );
        
        if (example) {
            await runExample(example.file, example.title);
        } else {
            console.log(`❌ Exemplo "${exampleName}" não encontrado!`);
            console.log("\nExemplos disponíveis:");
            examples.forEach((ex, i) => {
                console.log(`  ${i + 1}. ${ex.file} - ${ex.title}`);
            });
        }
        
    } else {
        // Modo interativo
        console.log("\n🎯 MODO INTERATIVO");
        
        // Habilitar input do usuário
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        while (true) {
            showMenu();
            console.log("\n🔢 Escolha uma opção (0-9):");
            
            await waitForInput();
            
            // Simular escolha (executar todos por padrão)
            console.log("\n🚀 Executando todos os exemplos...");
            await runExampleByIndex(0);
            break;
        }
        
        process.stdin.setRawMode(false);
        process.stdin.pause();
    }
}

// Informações adicionais
console.log("\n📚 SOBRE ESTA DEMONSTRAÇÃO:");
console.log("Esta demonstração mostra os conceitos fundamentais de LLMs:");
console.log("• Embeddings: Como palavras viram vetores");
console.log("• Attention: Mecanismo de foco seletivo");
console.log("• Transformers: Arquitetura revolucionária");
console.log("• Generation: Como os modelos geram texto");
console.log("\n💡 Dica: Execute individualmente para focar em cada conceito!");

// Executar
if (require.main === module) {
    main().catch(console.error);
} else {
    // Se importado, exportar funções úteis
    module.exports = {
        runExample,
        runExampleByIndex,
        examples
    };
}
