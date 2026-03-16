import { Spinner } from '@/components/ui/spinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-lg">T</span>
          </div>
        </div>
        <p className="text-indigo-600 font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export function SectionLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8 text-indigo-600" />
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  );
}
