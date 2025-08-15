'use client';

import { useEffect, useState, useMemo } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { fetchAddressCoordinates } from '@/services/banService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DecodedToken, BANFeature, TypeIntervention, Slot } from '@/types/types';

export default function BookPage() {
  const router = useRouter();

  const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME || 'hch_token';
  const API = process.env.NEXT_PUBLIC_API_ROUTE ?? '';

  const [userId, setUserId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BANFeature[]>([]);
  const [message, setMessage] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [types, setTypes] = useState<TypeIntervention[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [bikeBrand, setBikeBrand] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [isElectric, setIsElectric] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const token = getCookie(TOKEN_NAME);
    if (typeof token === 'string' && token.length > 0) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUserId(decoded.id ?? null);
      } catch {
        setUserId(null);
      }
    }

    (async () => {
      try {
        const response = await fetch(`${API}types-intervention`);
        if (!response.ok) throw new Error('fetch types failed');
        const data: TypeIntervention[] = await response.json();
        setTypes(Array.isArray(data) ? data : []);
      } catch {
        setTypes([]);
      }
    })();
  }, [API, TOKEN_NAME]);

  const fetchSuggestions = async (text: string) => {
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&limit=5`
      );
      const data = await res.json();
      const feats: BANFeature[] = Array.isArray(data?.features)
        ? data.features
        : [];
      setSuggestions(feats);
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
    if (!query.trim()) {
      setMessage('❌ Veuillez saisir une adresse.');
      return;
    }

    setLoading(true);
    setMessage('');
    setSlots([]);
    setSelectedSlotId(null);

    try {
      const { lat, lon } = await fetchAddressCoordinates(query);
      const coverRes = await fetch(`${API}zones/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      if (!coverRes.ok) throw new Error('zones/check failed');
      const result: { covered: boolean; technicien_id?: number } = await coverRes.json();

      if (!result.covered || !result.technicien_id) {
        setMessage('❌ Nous ne couvrons pas cette adresse.');
        return;
      }

      setMessage('✅ Adresse couverte. Chargement des créneaux...');

      const token = getCookie(TOKEN_NAME);
      const slotResponse = await fetch(
        `${API}interventions/available/${result.technicien_id}?typeId=${selectedTypeId}`,
        {
          headers: typeof token === 'string' && token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );
      if (!slotResponse.ok) throw new Error('fetch slots failed');

      const slotData: Slot[] = await slotResponse.json();
      setSlots(Array.isArray(slotData) ? slotData : []);
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
    formData.append('clientId', String(userId));
    formData.append('marqueVelo', bikeBrand);
    formData.append('modeleVelo', bikeModel);
    formData.append('commentaire', comment);
    formData.append('electrique', isElectric ? '1' : '0');
    formData.append('adresse', query);
    if (photo) formData.append('photo', photo);

    try {
      const token = getCookie(TOKEN_NAME);
      const response = await fetch(`${API}interventions/${selectedSlotId}/book`, {
        method: 'POST',
        headers:
          typeof token === 'string' && token
            ? { Authorization: `Bearer ${token}` }
            : {},
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'booking failed');
      }

      alert('✅ Demande envoyée avec succès.');
      router.push('/profile');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      alert(`❌ Erreur : ${msg}`);
    }
  };

  const groupedSlots = useMemo(() => {
    return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
      const date = new Date(slot.debut).toISOString().split('T')[0];
      (acc[date] ||= []).push(slot);
      return acc;
    }, {});
  }, [slots]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Vous devez être connecté pour faire une demande d’intervention à domicile.
            </p>
            <Button onClick={() => router.push('/login')}>Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {types.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
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
            const val = e.target.value;
            setQuery(val);
            fetchSuggestions(val);
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

      {Object.keys(groupedSlots).length > 0 && (
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
                            className={`p-2 border rounded text-sm transition-colors duration-200 ${isSelected ? 'bg-green-100 border-green-500' : 'bg-white hover:bg-gray-100'
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
              Créneau sélectionné :{' '}
              {new Date(slots.find((s) => s.id === selectedSlotId)?.debut ?? '').toLocaleString('fr-FR')}
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
                  className="w-full border rounded p-2"
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