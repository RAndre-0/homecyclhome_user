import Image from 'next/image';
import mechanicImage from '@/public/media/image/bg_velo.jpeg';
import bookingImage from '@/public/media/image/booking_online.jpg';
import geotestImage from '@/public/media/image/geo_test.jpg';
import bikingImage from '@/public/media/image/biking.jpg';

const steps = [
  {
    title: '1. Vérifiez votre zone',
    description:
      'Renseignez votre adresse sur la page d’accueil pour savoir instantanément si nous intervenons chez vous.',
    image: geotestImage,
  },
  {
    title: '2. Réservez en ligne',
    description:
      'Choisissez un créneau, le service souhaité et donnez quelques infos sur votre vélo via notre formulaire.',
    image: bookingImage,
  },
  {
    title: '3. On vient chez vous',
    description:
      'Un mécanicien se déplace avec tout le matériel nécessaire. Pas besoin de bouger de chez vous.',
    image: mechanicImage,
  },
  {
    title: '4. Profitez de votre vélo',
    description:
      'Votre vélo est prêt à rouler. Et en cas de souci, notre service est garanti 30 jours.',
    image: bikingImage,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-16">Comment ça fonctionne ?</h2>
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2 text-green-600">{step.title}</h3>
                <p className="text-gray-700 text-base">{step.description}</p>
              </div>
              {step.image && (
                <div className="md:w-1/2">
                  <Image
                    src={step.image}
                    alt={step.title}
                    className="rounded-xl shadow-lg"
                    width={500}
                    height={320}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
