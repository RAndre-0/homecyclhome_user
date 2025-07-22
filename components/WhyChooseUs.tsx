import { CheckCircle, Clock, Home, Award } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-10">Pourquoi choisir HomeCyclHome</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Home className="mx-auto mb-3 text-green-500" size={36} />
            <h3 className="font-semibold text-xl mb-2">Praticité</h3>
            <p>Nous nous déplaçons directement chez vous, plus besoin de transporter votre vélo.</p>
          </div>

          <div className="text-center">
            <Award className="mx-auto mb-3 text-blue-500" size={36} />
            <h3 className="font-semibold text-xl mb-2">Expertise</h3>
            <p>Des mécaniciens certifiés avec une grande expérience sur tous types de vélos.</p>
          </div>

          <div className="text-center">
            <Clock className="mx-auto mb-3 text-green-500" size={36} />
            <h3 className="font-semibold text-xl mb-2">Fiabilité</h3>
            <p>Nous sommes ponctuels et garantissons notre service pendant 30 jours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}