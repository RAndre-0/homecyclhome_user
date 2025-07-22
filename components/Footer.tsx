import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">HomeCyclHome</h3>
          <p className="text-gray-400">Service de réparation et d'entretien de vélos à domicile.</p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#">Accueil</Link></li>
            <li><Link href="#services">Services</Link></li>
            <li><Link href="#how-it-works">Fonctionnement</Link></li>
            <li><Link href="#pricing">Tarifs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-green-500" /> (555) 123-4567</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-green-500" /> contact@homecyclhome.com</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> Zone de service locale</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Légal</h4>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="#">Politique de confidentialité</Link></li>
            <li><Link href="#">Conditions d'utilisation</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-slate-700 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} HomeCyclHome. Tous droits réservés.
      </div>
    </footer>
  );
}
