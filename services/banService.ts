export async function fetchAddressCoordinates(address: string) {
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`);
  if (!response.ok) {
    throw new Error("Erreur lors de la requête à l'API BAN");
  }

  const data = await response.json();

  if (data.features && data.features.length > 0) {
    const feature = data.features[0];
    const [lon, lat] = feature.geometry.coordinates;
    return { lat, lon, label: feature.properties.label };
  } else {
    throw new Error("Adresse non trouvée");
  }
}
