'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Menu, CircleUser, X } from 'lucide-react';

const navLinks = [
  { title: 'Accueil', href: '/' },
  { title: 'Services', href: '/#services' },
  { title: 'Réserver', href: '/book' },
  { title: 'Tarifs', href: '/#pricing' },
  { title: 'Contact', href: '/#contact' },
]

export default function HeaderNav() {
  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || 'hch_token';
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = getCookie(TOKEN_NAME) as string | undefined;
    setIsAuthenticated(!!token)
  }, [TOKEN_NAME])

  const toggleMenu = () => setMenuOpen(prev => !prev)

  return (
    <div className="relative flex items-center gap-4 w-full justify-end">
      {/* Desktop menu */}
      <div className="hidden md:flex items-center gap-6">
        <NavigationMenu>
          <NavigationMenuList className="gap-x-4">
            {navLinks.map(link => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link href={link.href}>{link.title}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Compte utilisateur desktop */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <CircleUser className="h-6 w-6 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild><Link href="/profile">Mon profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/logout">Déconnexion</Link></DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild><Link href="/login">Connexion / Inscription</Link></DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bouton toggle mobile */}
      <Button variant="ghost" className="md:hidden" onClick={toggleMenu}>
        {menuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
      </Button>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="absolute top-14 right-2 left-2 max-w-[95vw] bg-white shadow-lg border rounded-md p-4 z-50 md:hidden text-right">
          <ul className="flex flex-col gap-3 text-sm">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}>{link.title}</Link>
              </li>
            ))}
            <li className="pt-2 border-t text-gray-600 text-xs">Mon compte</li>
            {isAuthenticated ? (
              <>
                <li><Link href="/profile" onClick={() => setMenuOpen(false)}>Mon profil</Link></li>
                <li><Link href="/logout" onClick={() => setMenuOpen(false)}>Déconnexion</Link></li>
              </>
            ) : (
              <li><Link href="/login" onClick={() => setMenuOpen(false)}>Connexion / Inscription</Link></li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
