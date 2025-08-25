'use client';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';

export default function Logout() {
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME ?? 'hch_token_u';
  const [, , removeCookie] = useCookies([TOKEN_NAME]);

  useEffect(() => {
    // Suppression du cookie
    removeCookie(TOKEN_NAME, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Rechargement de la page de login (forcé pour rafraîchir la navbar)
    window.location.replace('/login');
  }, [removeCookie, TOKEN_NAME]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Déconnexion en cours...</p>
    </div>
  );
}
