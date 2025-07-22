import { Button } from '@/components/ui/button';
import Image from 'next/image';
import peugeotBike from '@/public/media/image/peugeot_bike.jpeg';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">Réparation et entretien de vélo à domicile</h1>
          <p className="mb-6">
            Nos mécaniciens certifiés se déplacent chez vous avec tout l’équipement nécessaire pour remettre votre vélo en état.
          </p>
          <Link href="/book" passHref>
            <Button className="bg-white text-green-600 hover:bg-gray-100">
              Prendre rendez-vous
            </Button>
          </Link>
        </div>
        <div className="md:w-1/2">
          <Image
            src={peugeotBike}
            alt="Mécanicien vélo en intervention"
            width={500}
            height={400}
            className="rounded-xl shadow-xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
