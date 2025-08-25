// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '@/services/authService';
import { UserType, CompanySize } from '@/types/auth';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  userType: z.enum(['MENTOR', 'COMPANY']),
  // Campos condicionais para mentor
  title: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  // Campos condicionais para empresa
  companyName: z.string().optional(),
  companySize: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: 'COMPANY',
    },
  });

  const userType = watch('userType');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.register(data as any);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CodeMentor</h1>
            <p className="text-gray-600 mb-8">Crie sua conta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de conta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    {...register('userType')}
                    type="radio"
                    value="COMPANY"
                    className="sr-only"
                  />
                  <div className={`p-4 border rounded-lg cursor-pointer text-center ${
                    userType === 'COMPANY' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-lg font-semibold">Empresa</div>
                    <div className="text-sm text-gray-500">Busco mentores</div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    {...register('userType')}
                    type="radio"
                    value="MENTOR"
                    className="sr-only"
                  />
                  <div className={`p-4 border rounded-lg cursor-pointer text-center ${
                    userType === 'MENTOR' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="text-lg font-semibold">Mentor</div>
                    <div className="text-sm text-gray-500">Ofereço mentoria</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Campos básicos */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Seu nome"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Campos específicos para mentores */}
            {userType === 'MENTOR' && (
              <>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título profissional
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Senior Full Stack Developer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                      Anos de experiência
                    </label>
                    <input
                      {...register('yearsExperience', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                      Valor/hora (R$)
                    </label>
                    <input
                      {...register('hourlyRate', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="150"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campos específicos para empresas */}
            {userType === 'COMPANY' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Nome da empresa
                  </label>
                  <input
                    {...register('companyName')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nome da sua empresa"
                  />
                </div>

                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                    Tamanho da empresa
                  </label>
                  <select
                    {...register('companySize')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecione</option>
                    <option value="STARTUP">Startup (1-10 pessoas)</option>
                    <option value="SMALL">Pequena (11-50 pessoas)</option>
                    <option value="MEDIUM">Média (51-200 pessoas)</option>
                    <option value="LARGE">Grande (200+ pessoas)</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}