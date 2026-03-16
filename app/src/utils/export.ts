import type { Job, Candidate } from '@/types';
import { NOTO_SANS_REGULAR, loadNotoSansFont } from './pdfFonts';

// ============================================
// EXPORTAÇÃO COM CARREGAMENTO DINÂMICO
// jsPDF e XLSX só são carregados quando necessário
// Reduz bundle inicial em ~500KB+
// ============================================

// Tipos dinâmicos para as libs
 type XLSXLib = typeof import('xlsx');
 type JSPDFLib = typeof import('jspdf');
 type JSPDFAutoTableLib = typeof import('jspdf-autotable');

// Cache para módulos carregados
let xlsxCache: XLSXLib | null = null;
let jsPDFCache: { jsPDF: JSPDFLib['default']; autoTable: JSPDFAutoTableLib['default'] } | null = null;

/**
 * Carrega XLSX dinamicamente (sob demanda)
 */
async function loadXLSX(): Promise<XLSXLib> {
  if (!xlsxCache) {
    xlsxCache = await import('xlsx');
  }
  return xlsxCache;
}

/**
 * Carrega jsPDF e jspdf-autotable dinamicamente (sob demanda)
 * Configura fonte Noto Sans com suporte UTF-8 (acentos, cedilha)
 */
async function loadJSPDF(): Promise<{ jsPDF: JSPDFLib['default']; autoTable: JSPDFAutoTableLib['default'] }> {
  if (!jsPDFCache) {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    
    // Tenta carregar fonte com suporte UTF-8
    const fontBase64 = await loadNotoSansFont();
    
    if (fontBase64 && fontBase64.length > 100) {
      // Registrar fonte Noto Sans com suporte UTF-8
      (jsPDF as any).API.events.push(['addFonts', function(this: any) {
        this.addFileToVFS('NotoSans-Regular.ttf', fontBase64);
        this.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      }]);
    }
    
    jsPDFCache = { jsPDF, autoTable };
  }
  return jsPDFCache;
}

// ============================================
// EXPORTAÇÃO PARA EXCEL COM FORMATAÇÃO AVANÇADA
// ============================================

export async function exportToExcel(
  job: Job,
  candidates: Candidate[],
  filename?: string
): Promise<void> {
  // Carrega XLSX sob demanda
  const XLSX = await loadXLSX();
  
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: `TalentDash - ${job.name}`,
    Subject: 'Relatório de Candidatos',
    Author: 'TalentDash',
    CreatedDate: new Date(),
  };

  // Criar aba principal com os dados
  const wsData = candidates.map((c, index) => {
    const row: Record<string, any> = {
      '#': index + 1,
      'Nome': c.nome,
      'Idade': c.idade,
      'Cidade': c.cidade,
      'Status': getStatusLabel(c.status),
      'Pretensão Salarial': c.pretensaoSalarial,
      'Salário Atual': c.salarioAtual || '-',
      'Observações': c.observacoes || '-',
    };

    // Adicionar campos personalizados
    job.customFields.forEach((field) => {
      const value = c.customFields[field.id];
      if (value !== undefined) {
        if (field.type === 'boolean') {
          row[field.name] = value === true || value === 'Sim' ? 'Sim' : 'Não';
        } else if (field.type === 'rating' && field.maxRating) {
          row[field.name] = `${value}/${field.maxRating}`;
        } else {
          row[field.name] = value;
        }
      } else {
        row[field.name] = '-';
      }
    });

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(wsData);

  // Configurar larguras das colunas
  const colWidths: Record<string, number> = {
    '#': 5,
    'Nome': 25,
    'Idade': 8,
    'Cidade': 20,
    'Status': 15,
    'Pretensão Salarial': 18,
    'Salário Atual': 15,
    'Observações': 40,
  };

  job.customFields.forEach((field) => {
    colWidths[field.name] = field.type === 'link' ? 30 : 18;
  });

  ws['!cols'] = Object.keys(wsData[0] || {}).map((key) => ({
    wch: colWidths[key] || 15,
  }));

  // Adicionar aba de resumo
  const summaryData = generateSummaryData(job, candidates);
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');

  // Adicionar aba de referências (campos do tipo select)
  const refData = generateReferenceData(job);
  if (refData.length > 0) {
    const refWs = XLSX.utils.json_to_sheet(refData);
    refWs['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, refWs, 'Referências');
  }

  // Adicionar aba principal
  XLSX.utils.book_append_sheet(wb, ws, 'Candidatos');

  // Salvar arquivo
  const fileName = filename || `TalentDash_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ============================================
// EXPORTAÇÃO PARA PDF - ESTILO DASHBOARD
// ============================================

export async function exportToPDF(
  job: Job,
  candidates: Candidate[],
  options?: {
    includeCharts?: boolean;
    includeSummary?: boolean;
    filename?: string;
    anonymous?: boolean;
    processOnly?: boolean;
  }
): Promise<void> {
  // Carrega jsPDF sob demanda
  const { jsPDF, autoTable } = await loadJSPDF();
  
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Cores do tema
  const colors = {
    primary: [79, 70, 229] as [number, number, number], // Indigo 600
    secondary: [99, 102, 241] as [number, number, number], // Indigo 500
    accent: [129, 140, 248] as [number, number, number], // Indigo 400
    success: [16, 185, 129] as [number, number, number], // Emerald 500
    warning: [245, 158, 11] as [number, number, number], // Amber 500
    danger: [239, 68, 68] as [number, number, number], // Red 500
    slate: [100, 116, 139] as [number, number, number], // Slate 500
    light: [241, 245, 249] as [number, number, number], // Slate 100
    white: [255, 255, 255] as [number, number, number],
  };

  // Status colors
  const statusColors: Record<string, number[]> = {
    triagem: [148, 163, 184], // Slate 400
    entrevista: [99, 102, 241], // Indigo 500
    teste: [245, 158, 11], // Amber 500
    offer: [168, 85, 247], // Purple 500
    contratado: [16, 185, 129], // Emerald 500
    reprovado: [239, 68, 68], // Red 500
  };

  // Configurar fonte UTF-8 (com fallback para helvetica se NotoSans não estiver disponível)
  const fontName = (doc as any).getFontList()['NotoSans'] ? 'NotoSans' : 'helvetica';
  doc.setFont(fontName);

  // ========== HEADER ==========
  // Header background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Logo/Título
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(22);
  doc.setFont(fontName, 'bold');
  doc.text('TalentDash', margin, 20);

  doc.setFontSize(11);
  doc.setFont(fontName, 'normal');
  doc.text('Relatório de Processo Seletivo', margin, 30);

  // Data
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 40);

  // ========== INFO DA VAGA ==========
  let currentY = 60;
  
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFontSize(16);
  doc.setFont(fontName, 'bold');
  doc.text(job.name, margin, currentY);
  currentY += 8;

  doc.setFontSize(9);
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFont(fontName, 'normal');
  doc.text(`Total de candidatos: ${candidates.length}`, margin, currentY);
  currentY += 15;

  // ========== KPI CARDS ==========
  const stats = calculateStats(candidates);
  const cardWidth = (contentWidth - 9) / 4; // 4 cards com 3mm de gap
  const cardHeight = 28;
  
  const kpis = [
    { label: 'Total', value: stats.total.toString(), color: colors.primary },
    { label: 'Entrevista', value: stats.byStatus.entrevista.toString(), color: colors.secondary },
    { label: 'Contratados', value: stats.byStatus.contratado.toString(), color: colors.success },
    { label: 'Média Salarial', value: `R$ ${(stats.avgSalary / 1000).toFixed(1)}k`, color: colors.accent },
  ];

  kpis.forEach((kpi, index) => {
    const x = margin + (index * (cardWidth + 3));
    
    // Card background
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    (doc as any).roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
    
    // Color bar on top
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    (doc as any).roundedRect(x, currentY, cardWidth, 4, 2, 2, 'F');
    
    // Label
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.setFontSize(8);
    doc.setFont(fontName, 'normal');
    doc.text(kpi.label, x + 4, currentY + 12);
    
    // Value
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(14);
    doc.setFont(fontName, 'bold');
    doc.text(kpi.value, x + 4, currentY + 22);
  });

  currentY += cardHeight + 12;

  // ========== FUNIL DO PROCESSO ==========
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 20;
  }

  // Section title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont(fontName, 'bold');
  doc.text('Distribuição por Etapa', margin, currentY);
  currentY += 8;

  // Funil bars
  const funnelData = [
    { label: 'Triagem', count: stats.byStatus.triagem, color: statusColors.triagem },
    { label: 'Entrevista', count: stats.byStatus.entrevista, color: statusColors.entrevista },
    { label: 'Teste', count: stats.byStatus.teste, color: statusColors.teste },
    { label: 'Offer', count: stats.byStatus.offer, color: statusColors.offer },
    { label: 'Contratado', count: stats.byStatus.contratado, color: statusColors.contratado },
  ];

  const maxCount = Math.max(...funnelData.map(d => d.count), 1);
  const barMaxWidth = contentWidth * 0.6;
  const barHeight = 10;
  const barGap = 6;

  funnelData.forEach((item, index) => {
    const y = currentY + (index * (barHeight + barGap));
    const barWidth = item.count > 0 ? (item.count / maxCount) * barMaxWidth : 0;
    
    // Label
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.setFontSize(9);
    doc.setFont(fontName, 'normal');
    doc.text(item.label, margin, y + 7);
    
    // Bar background
    doc.setFillColor(226, 232, 240); // Slate 200
    (doc as any).roundedRect(margin + 35, y, barMaxWidth, barHeight, 2, 2, 'F');
    
    // Bar
    if (barWidth > 0) {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      (doc as any).roundedRect(margin + 35, y, barWidth, barHeight, 2, 2, 'F');
    }
    
    // Count
    doc.setTextColor(15, 23, 42);
    doc.setFont(fontName, 'bold');
    doc.text(item.count.toString(), margin + 35 + barMaxWidth + 5, y + 7);
  });

  currentY += (funnelData.length * (barHeight + barGap)) + 15;

  // ========== DISTRIBUIÇÃO POR STATUS (PIE CHART SIMULADO) ==========
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont(fontName, 'bold');
  doc.text('Status dos Candidatos', margin, currentY);
  currentY += 10;

  // Legend with colored dots
  const statusData = [
    { label: 'Triagem', count: stats.byStatus.triagem, color: statusColors.triagem },
    { label: 'Entrevista', count: stats.byStatus.entrevista, color: statusColors.entrevista },
    { label: 'Teste', count: stats.byStatus.teste, color: statusColors.teste },
    { label: 'Offer', count: stats.byStatus.offer, color: statusColors.offer },
    { label: 'Contratado', count: stats.byStatus.contratado, color: statusColors.contratado },
    { label: 'Reprovado', count: stats.byStatus.reprovado, color: statusColors.reprovado },
  ].filter(s => s.count > 0);

  const legendCols = 3;
  const legendItemWidth = contentWidth / legendCols;

  statusData.forEach((status, index) => {
    const col = index % legendCols;
    const row = Math.floor(index / legendCols);
    const x = margin + (col * legendItemWidth);
    const y = currentY + (row * 10);

    // Color dot
    doc.setFillColor(status.color[0], status.color[1], status.color[2]);
    doc.circle(x + 3, y + 3, 3, 'F');

    // Label and count
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.setFontSize(9);
    doc.setFont(fontName, 'normal');
    doc.text(`${status.label}: ${status.count}`, x + 10, y + 5);
  });

  currentY += (Math.ceil(statusData.length / legendCols) * 10) + 15;

  // ========== LISTA DE CANDIDATOS (se não for apenas dados do processo) ==========
  if (!options?.processOnly) {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont(fontName, 'bold');
    doc.text(options?.anonymous ? 'Lista de Candidatos (Anônima)' : 'Lista de Candidatos', margin, currentY);
    currentY += 10;

    // Preparar dados para a tabela
    const tableHeaders = options?.anonymous 
      ? ['#', 'Código', 'Idade', 'Cidade', 'Status', 'Pretensão']
      : ['#', 'Nome', 'Idade', 'Cidade', 'Status', 'Pretensão'];
    
    // Adicionar headers de campos personalizados visíveis na tabela
    job.customFields
      .filter((f) => f.visibility.table)
      .slice(0, 2) // Limitar a 2 campos para não quebrar layout
      .forEach((field) => tableHeaders.push(field.name));

    const tableData = candidates.map((c, index) => {
      const displayName = options?.anonymous 
        ? `Candidato ${String(index + 1).padStart(3, '0')}`
        : c.nome;
      
      const row: (string | number)[] = [
        index + 1,
        displayName,
        c.idade,
        c.cidade,
        getStatusLabel(c.status),
        `R$ ${c.pretensaoSalarial.toLocaleString('pt-BR')}`,
      ];

      // Adicionar campos personalizados
      job.customFields
        .filter((f) => f.visibility.table)
        .slice(0, 2)
        .forEach((field) => {
          const value = c.customFields[field.id];
          if (value !== undefined) {
            if (field.type === 'boolean') {
              row.push(value === true || value === 'Sim' ? 'Sim' : 'Não');
            } else if (field.type === 'rating' && field.maxRating) {
              row.push(`${value}/${field.maxRating}`);
            } else {
            row.push(String(value));
          }
        } else {
          row.push('-');
        }
      });

    return row;
  });

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35 },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Footer em cada página
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      doc.setFontSize(8);
      doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
      doc.text(
        `TalentDash - ${job.name} - Página ${currentPage} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    },
  });
  } else {
    // Modo apenas dados do processo - adicionar nota
    currentY += 10;
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.setFontSize(10);
    doc.setFont(fontName, 'italic');
    doc.text('Este relatório contém apenas dados agregados do processo seletivo.', margin, currentY);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
    doc.text(
      `TalentDash - ${job.name}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Salvar
  const fileName = options?.filename || `TalentDash_${job.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ============================================
// GOOGLE SHEETS - GERAR LINK DE CRIAÇÃO
// ============================================

export function generateGoogleSheetsLink(job: Job): string {
  // Criar URL do Google Sheets com título pré-definido
  const sheetName = encodeURIComponent(`TalentDash - ${job.name}`);
  return `https://docs.google.com/spreadsheets/create?usp=sheets_web&title=${sheetName}`;
}

// ============================================
// TEMPLATE EXCEL AVANÇADO PARA IMPORTAÇÃO
// ============================================

export async function generateAdvancedExcelTemplate(job: Job): Promise<void> {
  // Carrega XLSX sob demanda
  const XLSX = await loadXLSX();
  
  const wb = XLSX.utils.book_new();

  // Aba de instruções
  const instrucoesData = [
    ['TALENTDASH - TEMPLATE DE IMPORTAÇÃO'],
    [''],
    [`Vaga: ${job.name}`],
    [''],
    ['COMO USAR ESTE TEMPLATE:'],
    ['1. Vá para a aba "Candidatos" (última aba)'],
    ['2. Preencha os dados começando da linha 3 (após os exemplos)'],
    ['3. Para campos de LISTA/DROPDOWN, use apenas os valores permitidos (veja abaixo)'],
    ['4. Salve e importe no TalentDash'],
    [''],
    ['───────────────────────────────────────'],
    ['STATUS VÁLIDOS (coluna Status):'],
    ['• triagem - Candidato em análise inicial'],
    ['• entrevista - Em processo de entrevistas'],
    ['• teste - Realizando teste técnico/prático'],
    ['• offer - Proposta enviada'],
    ['• contratado - Contratado'],
    ['• reprovado - Não seguiu no processo'],
    [''],
    ['───────────────────────────────────────'],
    ['CAMPOS PERSONALIZADOS:'],
    ...job.customFields.map(f => {
      if (f.type === 'select' && f.options) {
        return [`${f.name}:`, `${f.options.join(' | ')}`];
      }
      if (f.type === 'boolean') {
        return [`${f.name}:`, 'Sim | Não'];
      }
      if (f.type === 'rating') {
        return [`${f.name}:`, `0 a ${f.maxRating || 5}`];
      }
      return [`${f.name}:`, 'Texto livre'];
    }),
    [''],
    ['───────────────────────────────────────'],
    ['DICAS:'],
    ['• Não altere os nomes das colunas'],
    ['• Use o formato de data do Brasil (DD/MM/AAAA)'],
    ['• Para valores monetários, use apenas números (sem R$)'],
  ];

  const instrucoesWs = XLSX.utils.aoa_to_sheet(instrucoesData);
  instrucoesWs['!cols'] = [{ wch: 40 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, instrucoesWs, 'Instruções');

  // Headers
  const basicHeaders = ['Nome', 'Idade', 'Cidade', 'Curriculo_URL', 'Pretensao_Salarial', 'Salario_Atual', 'Status', 'Observacoes'];
  const customHeaders = job.customFields.map((cf) => cf.name);
  const allHeaders = [...basicHeaders, ...customHeaders];

  // Aba de candidatos
  const candidatesData: any[][] = [
    allHeaders,
    [
      'João Silva',
      28,
      'São Paulo, SP',
      'https://linkedin.com/in/joao-silva',
      8500,
      6500,
      'triagem',
      'Candidato com ótimo perfil técnico',
      ...job.customFields.map((field) => {
        switch (field.type) {
          case 'number': return 5;
          case 'rating': return 4;
          case 'boolean': return 'Sim';
          case 'select': return field.options?.[0] || '';
          case 'link': return 'https://github.com/joaosilva';
          default: return '';
        }
      }),
    ],
    [
      'Maria Santos',
      32,
      'Rio de Janeiro, RJ',
      'https://linkedin.com/in/maria-santos',
      12000,
      9500,
      'entrevista',
      'Sênior com experiência internacional',
      ...job.customFields.map((field) => {
        switch (field.type) {
          case 'number': return 8;
          case 'rating': return 5;
          case 'boolean': return 'Sim';
          case 'select': return field.options?.[1] || field.options?.[0] || '';
          case 'link': return 'https://portfolio.com/maria';
          default: return '';
        }
      }),
    ],
    // Linhas vazias para o usuário preencher
    [],
    [],
    [],
    [],
    [],
  ];

  const candidatesWs = XLSX.utils.aoa_to_sheet(candidatesData);

  // Estilizar header
  allHeaders.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (!candidatesWs[cellRef]) candidatesWs[cellRef] = {};
    candidatesWs[cellRef].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '3B82F6' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  });

  // Configurar larguras
  candidatesWs['!cols'] = allHeaders.map((h) => ({ wch: Math.max(h.length + 5, 15) }));

  XLSX.utils.book_append_sheet(wb, candidatesWs, 'Candidatos');

  // Salvar
  XLSX.writeFile(wb, `Template_Importacao_${job.name.replace(/\s+/g, '_')}.xlsx`);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    triagem: 'Triagem',
    entrevista: 'Entrevista',
    teste: 'Teste',
    offer: 'Offer',
    contratado: 'Contratado',
    reprovado: 'Reprovado',
  };
  return labels[status] || status;
}

function calculateStats(candidates: Candidate[]) {
  const total = candidates.length;
  const byStatus = {
    triagem: candidates.filter((c) => c.status === 'triagem').length,
    entrevista: candidates.filter((c) => c.status === 'entrevista').length,
    teste: candidates.filter((c) => c.status === 'teste').length,
    offer: candidates.filter((c) => c.status === 'offer').length,
    contratado: candidates.filter((c) => c.status === 'contratado').length,
    reprovado: candidates.filter((c) => c.status === 'reprovado').length,
  };

  const avgSalary =
    total > 0
      ? Math.round(
          candidates.reduce((sum, c) => sum + c.pretensaoSalarial, 0) / total
        )
      : 0;

  return { total, byStatus, avgSalary };
}

function generateSummaryData(job: Job, candidates: Candidate[]) {
  const stats = calculateStats(candidates);

  return [
    { Métrica: 'Nome do Mapeamento', Valor: job.name },
    { Métrica: 'Data de Geração', Valor: new Date().toLocaleDateString('pt-BR') },
    { Métrica: '', Valor: '' },
    { Métrica: 'RESUMO DO PROCESSO', Valor: '' },
    { Métrica: 'Total de Candidatos', Valor: stats.total },
    { Métrica: 'Em Triagem', Valor: stats.byStatus.triagem },
    { Métrica: 'Em Entrevista', Valor: stats.byStatus.entrevista },
    { Métrica: 'Em Teste', Valor: stats.byStatus.teste },
    { Métrica: 'Com Offer', Valor: stats.byStatus.offer },
    { Métrica: 'Contratados', Valor: stats.byStatus.contratado },
    { Métrica: 'Reprovados', Valor: stats.byStatus.reprovado },
    { Métrica: 'Média Salarial', Valor: `R$ ${stats.avgSalary.toLocaleString('pt-BR')}` },
  ];
}

function generateReferenceData(job: Job): any[] {
  const data: any[] = [];
  
  // Status
  data.push({ Campo: 'STATUS', Valores_Permitidos: 'triagem | entrevista | teste | offer | contratado | reprovado' });
  
  // Campos personalizados
  job.customFields.forEach((field) => {
    if (field.type === 'select' && field.options) {
      data.push({ Campo: field.name, Valores_Permitidos: field.options.join(' | ') });
    } else if (field.type === 'boolean') {
      data.push({ Campo: field.name, Valores_Permitidos: 'Sim | Não' });
    } else if (field.type === 'rating') {
      data.push({ Campo: field.name, Valores_Permitidos: `0 a ${field.maxRating || 5}` });
    }
  });
  
  return data;
}
