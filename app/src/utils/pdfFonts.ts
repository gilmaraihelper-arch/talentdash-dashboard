/**
 * Fontes para PDF com suporte UTF-8
 * Inclui Noto Sans para suporte completo a caracteres especiais (acentos, cedilha, etc.)
 * 
 * Fonte: Noto Sans Regular (Google Fonts)
 * Licenca: Open Font License (OFL)
 * 
 * Para usar esta fonte:
 * 1. Baixe a NotoSans-Regular.ttf de https://fonts.google.com/noto
 * 2. Converta para base64 usando: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
 * 3. Substitua o valor abaixo pelo base64 gerado
 * 
 * Alternativa: Use o comando abaixo para converter:
 * base64 -i NotoSans-Regular.ttf -o fonte.txt
 */

// Placeholder - SUBSTITUA PELO BASE64 REAL DA FONTE
// Para testes sem fonte customizada, o sistema usará fallback
export const NOTO_SANS_REGULAR: string = '';

/**
 * Carrega a fonte Noto Sans de forma assíncrona
 * Fallback: se não conseguir carregar, usa configuração UTF-8 com fonte padrão
 */
export async function loadNotoSansFont(): Promise<string> {
  // Se já temos a fonte embutida, retorna ela
  if (NOTO_SANS_REGULAR && NOTO_SANS_REGULAR.length > 100) {
    return NOTO_SANS_REGULAR;
  }
  
  // Tenta carregar de uma URL externa (CDN)
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@latest/files/noto-sans-latin-400-normal.woff2');
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    console.warn('Não foi possível carregar fonte externa:', e);
  }
  
  return '';
}
