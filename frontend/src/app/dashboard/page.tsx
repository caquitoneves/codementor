// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { User } from '@/types/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CodeMentor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Dashboard {user.userType === 'MENTOR' ? 'do Mentor' : 'da Empresa'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.userType === 'MENTOR' ? (
                  <>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">Perfil do Mentor</h3>
                      <div className="mt-4 space-y-2">
                        <p><strong>Título:</strong> {user.mentor?.title}</p>
                        <p><strong>Experiência:</strong> {user.mentor?.yearsExperience} anos</p>
                        <p><strong>Valor/hora:</strong> R$ {user.mentor?.hourlyRate}</p>
                        <p><strong>Avaliação:</strong> {user.mentor?.rating}/5</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            user.mentor?.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.mentor?.isApproved ? 'Aprovado' : 'Pendente'}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900">Mentorias</h3>
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-green-600">
                          {user.mentor?.totalReviews || 0}
                        </p>
                        <p className="text-green-700">Mentorias concluídas</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-900">Próximas ações</h3>
                      <div className="mt-4 space-y-2">
                        <button className="block w-full text-left text-purple-700 hover:text-purple-900">
                          • Completar perfil
                        </button>
                        <button className="block w-full text-left text-purple-700 hover:text-purple-900">
                          • Adicionar skills
                        </button>
                        <button className="block w-full text-left text-purple-700 hover:text-purple-900">
                          • Ver oportunidades
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">Perfil da Empresa</h3>
                      <div className="mt-4 space-y-2">
                        <p><strong>Empresa:</strong> {user.company?.companyName}</p>
                        <p><strong>Setor:</strong> {user.company?.industry || 'Não informado'}</p>
                        <p><strong>Tamanho:</strong> {user.company?.companySize}</p>
                        {user.company?.website && (
                          <p><strong>Site:</strong> 
                            <a href={user.company.website} target="_blank" rel="noopener noreferrer" 
                               className="ml-2 text-blue-600 hover:text-blue-800">
                              {user.company.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900">Programas Ativos</h3>
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-green-600">0</p>
                        <p className="text-green-700">Capacitações em andamento</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-900">Próximas ações</h3>
                      <div className="mt-4 space-y-2">
                        <button className="block w-full text-left text-purple-700 hover:text-purple-900">
                          • Buscar mentores
                        </button>
                        <button className="block w-full text-left text-purple-700 hover:text-purple-900">
                          • Criar programa de capacitação
                        </button>
                        <button className="block w-full text-left text-purple-700 hover:text-purple-900">
                          • Ver relatórios
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 MVP Funcionando!</h3>
                  <p className="text-gray-600">
                    Parabéns! Sua aplicação CodeMentor está rodando com sucesso. 
                    Backend conectado, autenticação funcionando, e dashboard carregando dados do usuário.
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p><strong>Próximos passos:</strong> Criar funcionalidades de busca de mentores, 
                    agendamento de sessões, e sistema de pagamentos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}