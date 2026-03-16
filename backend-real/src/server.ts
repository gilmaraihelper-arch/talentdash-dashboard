import app from './app.js';
import { config } from './config/env.js';
import { prisma } from './prisma.js';

const PORT = config.port;

// Graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} recebido. Iniciando shutdown gracioso...`);

  try {
    // Fechar conexão com o banco
    await prisma.$disconnect();
    console.log('✓ Conexão com o banco fechada');

    process.exit(0);
  } catch (error) {
    console.error('Erro durante o shutdown:', error);
    process.exit(1);
  }
}

// Iniciar servidor
async function startServer(): Promise<void> {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    console.log('✓ Conectado ao banco de dados');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📚 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handlers de sinal
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar
startServer();