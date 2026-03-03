### Criado e usando MCPs

### Configurando MCPs no Cursor
- Editar o arquivo mcps.json
- Adicionar os MCPs necessários
- Reiniciar o Cursor

### Playwrighter
- Gerar testes automatizados automaticamente
- Navegar pelo site
- Realizar ações
- Validar resultados

Exemplo:
```json
{
  "mcpServers": {
    "playwright": {
      "args": [
        "@playwright/mcp@latest",
        "--extension"
      ],
      "command": "npx",
      "disabled": false,
      "env": {
        "PLAYWRIGHT_MCP_EXTENSION_TOKEN": "xYiQse6QCRBUc0K_IkWwdzsT3DVAoUvdSVzBUnN9YrA"
      }
    }
  }
}
```