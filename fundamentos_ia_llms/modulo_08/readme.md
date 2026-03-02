### Criado e usando MCPs

### Configurando MCPs no Cursor
- Editar o arquivo mcps.json
- Adicionar os MCPs necessários
- Reiniciar o Cursor

Exemplo:
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/cli/mcp"]
    }
  }
}
```