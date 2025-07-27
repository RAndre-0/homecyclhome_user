'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { fetchAddressCoordinates } from '@/services/banService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DecodedToken {
  id: number;
  exp: number;
}

export default function BookPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [bikeBrand, setBikeBrand] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [isElectric, setIsElectric] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || 'hch_token';
    const token = getCookie(TOKEN_NAME) as string | undefined;
    if (!token) return;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserId(decoded.id);
    } catch {
      setUserId(null);
    }

    (async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}types-intervention`);
      const data = await response.json();
      setTypes(data);
    })();
  }, []);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) return;
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&limit=5`);
      const data = await res.json();
      setSuggestions(Array.isArray(data.features) ? data.features : []);
    } catch {
      setSuggestions([]);
    }
  };

  const handleSelect = (label: string) => {
    setQuery(label);
    setSuggestions([]);
    setMessage('');
  };

  const handleCheckAddress = async () => {
    if (!selectedTypeId) {
      setMessage('❌ Veuillez d’abord choisir un type d’intervention.');
      return;
    }

    setLoading(true);
    setMessage('');
    setSlots([]);

    try {
      const { lat, lon } = await fetchAddressCoordinates(query);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}zones/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon })
      });
      const result = await res.json();

      if (!result.covered) {
        setMessage('❌ Nous ne couvrons pas cette adresse.');
        return;
      }

      setMessage('✅ Adresse couverte. Chargement des créneaux...');

      const slotResponse = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}interventions/available/${result.technicien_id}?typeId=${selectedTypeId}`, {
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
        },
      });
      const slotData = await slotResponse.json();
      setSlots(slotData);
      setMessage('✅ Créneaux disponibles.');
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur lors de la vérification.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert('Seuls les fichiers JPG, PNG ou WEBP sont autorisés.');
      return;
    }

    if (file.size > maxSize) {
      alert('Fichier trop lourd (max 5 Mo).');
      return;
    }

    setPhoto(file);
  };

  const handleSubmit = async () => {
    if (!selectedSlotId || !userId) return;

    const formData = new FormData();
    formData.append('clientId', userId.toString());
    formData.append('marqueVelo', bikeBrand);
    formData.append('modeleVelo', bikeModel);
    formData.append('commentaire', comment);
    formData.append('electrique', isElectric ? '1' : '0');
    formData.append('adresse', query);
    if (photo) formData.append('photo', photo);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}interventions/${selectedSlotId}/book`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert('✅ Demande envoyée avec succès.');
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      alert(`❌ Erreur : ${err.message}`);
    }
  };


  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Vous devez être connecté pour faire une demande d’intervention à domicile.</p>
            <Button onClick={() => router.push('/login')}>Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc: Record<string, any[]>, slot: any) => {
    const date = new Date(slot.debut).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Nouvelle demande d’intervention</h1>

      {/* Sélecteur de type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Type d’intervention</label>
        <Select onValueChange={(val) => setSelectedTypeId(Number(val))}>
          <SelectTrigger>
            <SelectValue placeholder="Choisissez un type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((type: any) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.nom} – {type.prix_depart}€
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Saisie de l’adresse */}
      <div className="relative">
        <Input
          placeholder="Entrez votre adresse"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-60 overflow-auto">
            {suggestions.map((s) => (
              <li
                key={s.properties.id}
                onClick={() => handleSelect(s.properties.label)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {s.properties.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button className="mt-4 w-full" onClick={handleCheckAddress} disabled={loading}>
        {loading ? 'Vérification...' : "Vérifier l'adresse"}
      </Button>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}

      {slots.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Créneaux disponibles</h2>
          <Accordion type="single" collapsible>
            {Object.entries(groupedSlots).map(([dateStr, daySlots]) => {
              const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });

              return (
                <AccordionItem key={dateStr} value={dateStr}>
                  <AccordionTrigger>{formattedDate}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {daySlots.map((s) => {
                        const timeLabel = new Date(s.debut).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const isSelected = selectedSlotId === s.id;

                        return (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSlotId(s.id)}
                            className={`p-2 border rounded text-sm transition-colors duration-200 ${isSelected
                              ? 'bg-green-100 border-green-500'
                              : 'bg-white hover:bg-gray-100'
                              }`}
                          >
                            {timeLabel}
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          {selectedSlotId && (
            <p className="mt-4 text-sm text-center text-green-600">
              Créneau sélectionné : {new Date(slots.find((s) => s.id === selectedSlotId)?.debut).toLocaleString('fr-FR')}
            </p>
          )}
          {selectedSlotId && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Informations sur le vélo</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Marque du vélo</label>
                <Input
                  placeholder="Ex: Lapierre, Btwin, etc."
                  value={bikeBrand}
                  onChange={(e) => setBikeBrand(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Modèle du vélo</label>
                <Input
                  placeholder="Ex: Xelius, Elops 500..."
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="electrique"
                  type="checkbox"
                  checked={isElectric}
                  onChange={(e) => setIsElectric(e.target.checked)}
                />
                <label htmlFor="electrique" className="text-sm font-medium">
                  Mon vélo est électrique
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commentaire</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border ... "
                  placeholder="Ajoutez un commentaire pour le technicien si besoin..."
                  rows={4}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Photo du vélo (facultatif)</label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileChange}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit}>
                Envoyer la demande
              </Button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
