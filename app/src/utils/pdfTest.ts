/**
 * Teste de Exportação PDF com UTF-8
 * 
 * Este arquivo testa a exportação de PDF com caracteres especiais:
 * - Acentos: á, é, í, ó, ú, à, è, ì, ò, ù, â, ê, î, ô, û
 * - Cedilha: ç
 * - Tremas: ü
 * - Nomes brasileiros: João, José, São Paulo, etc.
 */

import { exportToPDF } from './export';
import type { Job, Candidate } from '@/types';

// Dados de teste com caracteres acentuados
const testJob: Job = {
  id: 'test-1',
  name: 'Desenvolvedor Sênior - São Paulo',
  description: 'Vaga para desenvolvedor com experiência em ção',
  plan: 'pro',
  dashboardModel: 'padrao',
  colorTheme: 'blue',
  createdAt: new Date(),
  customFields: [
    { id: '1', name: 'Nível de Inglês', type: 'select', icon: 'Star', options: ['Básico', 'Intermediário', 'Avançado'], visibility: { card: true, table: true, detail: true } },
    { id: '2', name: 'Pretensão Salarial', type: 'number', icon: 'Hash', visibility: { card: true, table: true, detail: true } },
  ],
};

const testCandidates: Candidate[] = [
  {
    id: 'c1',
    jobId: 'test-1',
    nome: 'João Silva',
    idade: 28,
    cidade: 'São Paulo, SP',
    curriculo: 'https://linkedin.com/in/joao-silva',
    pretensaoSalarial: 8500,
    salarioAtual: 6500,
    status: 'triagem',
    observacoes: 'Candidato com ótimo perfil técnico',
    customFields: { '1': 'Avançado', '2': 8500 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'c2',
    jobId: 'test-1',
    nome: 'José Carlos André',
    idade: 32,
    cidade: 'Curitiba, PR',
    curriculo: 'https://linkedin.com/in/jose-carlos',
    pretensaoSalarial: 12000,
    salarioAtual: 9500,
    status: 'entrevista',
    observacoes: 'Sênior com experiência internacional',
    customFields: { '1': 'Avançado', '2': 12000 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'c3',
    jobId: 'test-1',
    nome: 'Ana Maria Conceição',
    idade: 29,
    cidade: 'Belo Horizonte, MG',
    curriculo: 'https://linkedin.com/in/ana-maria',
    pretensaoSalarial: 9000,
    salarioAtual: 7000,
    status: 'teste',
    observacoes: 'Perfil versátil, adapta-se bem',
    customFields: { '1': 'Intermediário', '2': 9000 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'c4',
    jobId: 'test-1',
    nome: 'Mário Gomes da Silva',
    idade: 35,
    cidade: 'Porto Alegre, RS',
    curriculo: 'https://linkedin.com/in/mario-gomes',
    pretensaoSalarial: 15000,
    salarioAtual: 12000,
    status: 'contratado',
    observacoes: 'Excelente cultura organizacional',
    customFields: { '1': 'Avançado', '2': 15000 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Função de teste
export async function testPDFExportUTF8(): Promise<void> {
  console.log('🧪 Iniciando teste de exportação PDF com UTF-8...');
  console.log('📄 Dados de teste:');
  console.log('  - Vaga:', testJob.name);
  console.log('  - Candidatos:', testCandidates.map(c => c.nome).join(', '));
  
  try {
    await exportToPDF(testJob, testCandidates, {
      filename: 'Teste_UTF8_TalentDash.pdf',
    });
    console.log('✅ PDF exportado com sucesso!');
    console.log('📁 Arquivo: Teste_UTF8_TalentDash.pdf');
  } catch (error) {
    console.error('❌ Erro ao exportar PDF:', error);
    throw error;
  }
}

// Executar teste se este arquivo for executado diretamente
if (import.meta.url === `file://${process.cwd()}/src/utils/pdfTest.ts`) {
  testPDFExportUTF8();
}
