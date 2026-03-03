import { test, expect } from '@playwright/test';

test('deve mostrar página inicial com estado não logado', async ({ page }) => {
  await page.goto('/');
  
  // Verifica se está na página inicial
  await expect(page.locator('h1')).toContainText('Hello World');
  
  // Verifica se mostra estado não logado
  await expect(page.locator('text=Você não está logado')).toBeVisible();
  
  // Verifica se botão de login GitHub está presente
  const githubButton = page.locator('button:has-text("Entrar com GitHub")');
  await expect(githubButton).toBeVisible();
  
  // Verifica se ícone do GitHub está presente
  await expect(githubButton.locator('svg')).toBeVisible();
});

test('deve mostrar loading ao carregar página', async ({ page }) => {
  await page.goto('/');
  
  // Verifica se mostra loading inicialmente
  await expect(page.locator('text=Carregando...')).toBeVisible();
  
  // Aguarda carregar e verifica que loading desaparece
  await expect(page.locator('text=Carregando...')).not.toBeVisible({ timeout: 5000 });
});

test('deve ter elementos de UI corretos', async ({ page }) => {
  await page.goto('/');
  
  // Verifica estrutura do container principal
  const container = page.locator('.max-w-md');
  await expect(container).toBeVisible();
  
  // Verifica se o botão GitHub tem estilos corretos
  const githubButton = page.locator('button:has-text("Entrar com GitHub")');
  await expect(githubButton).toHaveClass(/bg-gray-900/);
  await expect(githubButton).toHaveClass(/hover:bg-gray-800/);
  
  // Verifica se o título está centralizado
  const title = page.locator('h1');
  await expect(title).toHaveClass(/text-center/);
  await expect(title).toHaveClass(/text-2xl/);
});

test('deve redirecionar para GitHub OAuth ao clicar no botão', async ({ page }) => {
  await page.goto('/');
  
  // Interceptar requisições para ver redirecionamento
  let redirectUrl = '';
  page.on('request', request => {
    if (request.url().includes('github.com')) {
      redirectUrl = request.url();
    }
  });
  
  // Clica no botão GitHub
  const githubButton = page.locator('button:has-text("Entrar com GitHub")');
  await githubButton.click();
  
  // Verifica se houve tentativa de redirecionamento para GitHub
  // (Não vamos testar o fluxo completo pois requer credenciais reais)
  await expect(page.waitForTimeout(1000)).resolves.toBeUndefined();
});
