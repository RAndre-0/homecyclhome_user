'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Utilisation du router pour redirection
import { useCookies } from 'react-cookie';

export default function Logout() {
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME ?? 'hch_token';
  const [, removeCookie] = useCookies([TOKEN_NAME]); // Accès aux cookies
  const router = useRouter(); // Pour la redirection

  useEffect(() => {
    // Suppression du cookie contenant le token
    removeCookie(TOKEN_NAME, { path: '/' });
    // Redirection vers la page de login, pas de router.push pour recharger la navbar
    window.location.href = "/login";
  }, [removeCookie, router, TOKEN_NAME]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Déconnexion en cours...</p>
    </div>
  );
}
