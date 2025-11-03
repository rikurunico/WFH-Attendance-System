import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LogIn } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validation
    const newErrors = {};
    if (!email) newErrors.email = 'Email wajib diisi';
    if (!password) newErrors.password = 'Kata sandi wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect based on role
        if (result.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <LogIn size={32} className="text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              TSD
            </h1>
            <p className="text-gray-600">Masuk ke akun Anda</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="karyawan@example.com"
              required
            />

            <Input
              label="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Masukkan kata sandi Anda"
              required
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Kredensial Demo:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Karyawan:</strong> employee@example.com / password123</p>
              <p><strong>Manager:</strong> manager@example.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
