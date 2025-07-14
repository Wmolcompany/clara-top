import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthLayout from '../../components/layouts/AuthLayout';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password, data.remember);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        
        // Redirect based on user role
        const redirectPath = router.query.redirect as string;
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          switch (result.user.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'affiliate':
              router.push('/affiliate/dashboard');
              break;
            default:
              router.push('/dashboard');
              break;
          }
        }
      } else {
        toast.error(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Entre na sua conta Clara Zen"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            icon={<Mail className="w-5 h-5" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'E-mail é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'E-mail inválido',
              },
            })}
          />
        </div>

        <div>
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            icon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
            error={errors.password?.message}
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha deve ter pelo menos 6 caracteres',
              },
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('remember')}
            />
            <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
          icon={<LogIn className="w-5 h-5" />}
        >
          Entrar
        </Button>

        <div className="text-center">
          <span className="text-gray-600">Não tem uma conta? </span>
          <Link
            href="/auth/register"
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Cadastre-se aqui
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}