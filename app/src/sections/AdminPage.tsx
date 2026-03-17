import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Trash2, 
  Edit2, 
  Crown,
  Shield,
  MoreVertical,
  ChevronLeft,
  Mail,
  Building2,
  Calendar
} from 'lucide-react';
import type { User, UserRole, PlanType } from '@/types';
import { cn } from '@/lib/utils';

// Mock users data - em produção viria da API
const mockUsers: User[] = [
  {
    id: '1',
    email: 'gilmar.aihelper@gmail.com',
    name: 'Gilmar Admin',
    companyName: 'taldash',
    plan: 'enterprise',
    role: 'ADMIN',
    paymentMethods: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'user1@example.com',
    name: 'João Silva',
    companyName: 'Tech Corp',
    plan: 'pro',
    role: 'USER',
    paymentMethods: [],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'user2@example.com',
    name: 'Maria Santos',
    companyName: 'HR Solutions',
    plan: 'basic',
    role: 'USER',
    paymentMethods: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date(),
  },
  {
    id: '4',
    email: 'user3@example.com',
    name: 'Pedro Costa',
    plan: 'free',
    role: 'USER',
    paymentMethods: [],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date(),
  },
];

interface AdminPageProps {
  onBack?: () => void;
}

const planColors: Record<PlanType, string> = {
  FREE: 'bg-slate-100 text-slate-700',
  BASIC: 'bg-blue-100 text-blue-700',
  PRO: 'bg-violet-100 text-violet-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
};

const planLabels: Record<PlanType, string> = {
  FREE: 'Free',
  BASIC: 'Basic',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

export function AdminPage({ onBack }: AdminPageProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleRole = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' }
        : u
    ));
  };

  const handleChangePlan = (userId: string, newPlan: PlanType) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, plan: newPlan }
        : u
    ));
  };

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    proUsers: users.filter(u => u.plan === 'PRO' || u.plan === 'ENTERPRISE').length,
    freeUsers: users.filter(u => u.plan === 'FREE').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h1 className="text-lg font-semibold text-slate-900">
                  Painel Administrativo
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                <Crown className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={<Users className="w-5 h-5" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Administradores"
            value={stats.admins}
            icon={<Shield className="w-5 h-5" />}
            color="bg-violet-500"
          />
          <StatCard
            title="Usuários Pro"
            value={stats.proUsers}
            icon={<Crown className="w-5 h-5" />}
            color="bg-amber-500"
          />
          <StatCard
            title="Usuários Free"
            value={stats.freeUsers}
            icon={<Users className="w-5 h-5" />}
            color="bg-slate-500"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{filteredUsers.length} usuários encontrados</span>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Plano
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Função
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Cadastro
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {user.companyName || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.plan}
                        onChange={(e) => handleChangePlan(user.id, e.target.value as PlanType)}
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer",
                          planColors[user.plan]
                        )}
                      >
                        {Object.entries(planLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleRole(user.id)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                          user.role === 'ADMIN'
                            ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {user.role === 'ADMIN' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3" />
                            User
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.createdAt.toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="text-slate-600 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-slate-600 hover:text-red-600"
                          disabled={user.role === 'ADMIN'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", color)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
