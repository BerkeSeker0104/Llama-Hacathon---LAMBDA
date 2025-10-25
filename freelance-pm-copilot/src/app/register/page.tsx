'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Hesap oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hesap Oluştur</CardTitle>
          <CardDescription>
            Serbest PM Asistanı çalışma alanınız için kayıt olun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Giriş yap
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
