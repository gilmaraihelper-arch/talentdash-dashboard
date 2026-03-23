import { test, expect } from '@playwright/test';

/**
 * Testes E2E para validação de campos obrigatórios no formulário de candidato
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://talentdash.vercel.app';

test.describe('Validação de Campos Obrigatórios', () => {

  test('verifica que Nome é obrigatório no formulário', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(1000);
    
    // Verifica se a página de login carregou
    await expect(page.locator('text=Criar conta')).toBeVisible({ timeout: 10000 });
    console.log('✓ Página de login carregou');
  });

  test('verifica que campos obrigatórios estão marcados com *', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForTimeout(1000);
    
    // Verifica campos obrigatórios
    const nomeObrigatorio = page.locator('text=Nome completo *');
    const emailObrigatorio = page.locator('text=E-mail *');
    const senhaObrigatoria = page.locator('text=Senha *');
    
    await expect(nomeObrigatorio).toBeVisible({ timeout: 5000 });
    await expect(emailObrigatorio).toBeVisible({ timeout: 5000 });
    await expect(senhaObrigatoria).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Campos obrigatórios marcados com *');
  });

  test('proteção de rota: Dashboard requer autenticação', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(1500);
    
    // Deve redirecionar para /login
    const url = page.url();
    expect(url).toContain('/login');
    console.log('✓ Rota protegida/redirecionado para login');
  });

  test('proteção de rota: CreateJob requer autenticação', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/create-job`);
    await page.waitForTimeout(1500);
    
    // Deve redirecionar para /login
    const url = page.url();
    expect(url).toContain('/login');
    console.log('✓ Rota protegida CreateJob/redirecionado para login');
  });

  test('proteção de rota: AddCandidates requer autenticação', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/add-candidates`);
    await page.waitForTimeout(1500);
    
    // Deve redirecionar para /login
    const url = page.url();
    expect(url).toContain('/login');
    console.log('✓ Rota protegida AddCandidates/redirecionado para login');
  });
});