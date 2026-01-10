import type { Artist } from '../types';

// Sample artist data - to be expanded to 270+ artists
export const artists: Artist[] = [
  {
    id: '1',
    name: 'Mavi Gri',
    genre: 'Pop/Rock',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    flightRiderFile: 'mavi_gri_flight_rider.pdf',
    flightRiderSize: '245 KB',
    flightRiderDate: '2024-12-15',
    technicalRiderFile: 'mavi_gri_technical_rider.pdf',
    technicalRiderSize: '1.2 MB',
    technicalRiderDate: '2024-11-20',
    accommodationRiderFile: 'mavi_gri_accommodation_rider.pdf',
    accommodationRiderSize: '180 KB',
    accommodationRiderDate: '2024-10-05',
  },
  {
    id: '2',
    name: 'Ufuk Beydemir',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    flightRiderFile: 'ufuk_beydemir_flight_rider.pdf',
    flightRiderSize: '220 KB',
    flightRiderDate: '2024-12-01',
    technicalRiderFile: 'ufuk_beydemir_technical_rider.pdf',
    technicalRiderSize: '980 KB',
    technicalRiderDate: '2024-11-15',
  },
  {
    id: '3',
    name: 'Semicenk',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    technicalRiderFile: 'semicenk_technical_rider.pdf',
    technicalRiderSize: '1.5 MB',
    technicalRiderDate: '2024-12-10',
  },
  {
    id: '4',
    name: 'Emir Can İğrek',
    genre: 'Pop/Rock',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    flightRiderFile: 'emir_can_igrek_flight_rider.pdf',
    flightRiderSize: '195 KB',
    flightRiderDate: '2024-11-25',
    technicalRiderFile: 'emir_can_igrek_technical_rider.pdf',
    technicalRiderSize: '2.1 MB',
    technicalRiderDate: '2024-12-05',
    accommodationRiderFile: 'emir_can_igrek_accommodation_rider.pdf',
    accommodationRiderSize: '210 KB',
    accommodationRiderDate: '2024-11-10',
  },
  {
    id: '5',
    name: 'Duman',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&h=200&fit=crop',
    flightRiderFile: 'duman_flight_rider.pdf',
    flightRiderSize: '280 KB',
    flightRiderDate: '2024-12-20',
    technicalRiderFile: 'duman_technical_rider.pdf',
    technicalRiderSize: '3.5 MB',
    technicalRiderDate: '2024-12-18',
    transportRiderFile: 'duman_transport_rider.pdf',
    transportRiderSize: '150 KB',
    transportRiderDate: '2024-12-15',
  },
  {
    id: '6',
    name: 'Mor ve Ötesi',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop',
    technicalRiderFile: 'mor_ve_otesi_technical_rider.pdf',
    technicalRiderSize: '4.2 MB',
    technicalRiderDate: '2024-11-30',
    accommodationRiderFile: 'mor_ve_otesi_accommodation_rider.pdf',
    accommodationRiderSize: '320 KB',
    accommodationRiderDate: '2024-11-28',
  },
  {
    id: '7',
    name: 'Tarkan',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop',
    flightRiderFile: 'tarkan_flight_rider.pdf',
    flightRiderSize: '450 KB',
    flightRiderDate: '2024-12-25',
    technicalRiderFile: 'tarkan_technical_rider.pdf',
    technicalRiderSize: '5.8 MB',
    technicalRiderDate: '2024-12-22',
    accommodationRiderFile: 'tarkan_accommodation_rider.pdf',
    accommodationRiderSize: '580 KB',
    accommodationRiderDate: '2024-12-20',
    transportRiderFile: 'tarkan_transport_rider.pdf',
    transportRiderSize: '290 KB',
    transportRiderDate: '2024-12-18',
  },
  {
    id: '8',
    name: 'Sezen Aksu',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop',
    technicalRiderFile: 'sezen_aksu_technical_rider.pdf',
    technicalRiderSize: '4.5 MB',
    technicalRiderDate: '2024-11-15',
    accommodationRiderFile: 'sezen_aksu_accommodation_rider.pdf',
    accommodationRiderSize: '620 KB',
    accommodationRiderDate: '2024-11-10',
  },
  {
    id: '9',
    name: 'Athena',
    genre: 'Ska/Rock',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    flightRiderFile: 'athena_flight_rider.pdf',
    flightRiderSize: '180 KB',
    flightRiderDate: '2024-12-08',
    technicalRiderFile: 'athena_technical_rider.pdf',
    technicalRiderSize: '2.8 MB',
    technicalRiderDate: '2024-12-05',
  },
  {
    id: '10',
    name: 'Model',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop',
    technicalRiderFile: 'model_technical_rider.pdf',
    technicalRiderSize: '3.2 MB',
    technicalRiderDate: '2024-11-20',
  },
  {
    id: '11',
    name: 'Kenan Doğulu',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop',
    flightRiderFile: 'kenan_dogulu_flight_rider.pdf',
    flightRiderSize: '210 KB',
    flightRiderDate: '2024-12-12',
    technicalRiderFile: 'kenan_dogulu_technical_rider.pdf',
    technicalRiderSize: '2.5 MB',
    technicalRiderDate: '2024-12-10',
  },
  {
    id: '12',
    name: 'Sıla',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop',
    technicalRiderFile: 'sila_technical_rider.pdf',
    technicalRiderSize: '2.9 MB',
    technicalRiderDate: '2024-11-28',
    accommodationRiderFile: 'sila_accommodation_rider.pdf',
    accommodationRiderSize: '340 KB',
    accommodationRiderDate: '2024-11-25',
  },
  {
    id: '13',
    name: 'Manga',
    genre: 'Rock/Electronica',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop',
    flightRiderFile: 'manga_flight_rider.pdf',
    flightRiderSize: '260 KB',
    flightRiderDate: '2024-12-18',
    technicalRiderFile: 'manga_technical_rider.pdf',
    technicalRiderSize: '4.1 MB',
    technicalRiderDate: '2024-12-15',
  },
  {
    id: '14',
    name: 'Şebnem Ferah',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
    technicalRiderFile: 'sebnem_ferah_technical_rider.pdf',
    technicalRiderSize: '3.8 MB',
    technicalRiderDate: '2024-11-22',
  },
  {
    id: '15',
    name: 'Teoman',
    genre: 'Pop/Rock',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    flightRiderFile: 'teoman_flight_rider.pdf',
    flightRiderSize: '175 KB',
    flightRiderDate: '2024-12-02',
    technicalRiderFile: 'teoman_technical_rider.pdf',
    technicalRiderSize: '2.2 MB',
    technicalRiderDate: '2024-12-01',
  },
  {
    id: '16',
    name: 'Ceza',
    genre: 'Hip-Hop/Rap',
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop',
    technicalRiderFile: 'ceza_technical_rider.pdf',
    technicalRiderSize: '1.8 MB',
    technicalRiderDate: '2024-11-18',
  },
  {
    id: '17',
    name: 'Sagopa Kajmer',
    genre: 'Hip-Hop/Rap',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    technicalRiderFile: 'sagopa_kajmer_technical_rider.pdf',
    technicalRiderSize: '1.5 MB',
    technicalRiderDate: '2024-11-12',
  },
  {
    id: '18',
    name: 'Pinhani',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop',
    flightRiderFile: 'pinhani_flight_rider.pdf',
    flightRiderSize: '190 KB',
    flightRiderDate: '2024-12-08',
    technicalRiderFile: 'pinhani_technical_rider.pdf',
    technicalRiderSize: '2.6 MB',
    technicalRiderDate: '2024-12-05',
  },
  {
    id: '19',
    name: 'Evgeny Grinko',
    genre: 'Neoclassical',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    technicalRiderFile: 'evgeny_grinko_technical_rider.pdf',
    technicalRiderSize: '1.1 MB',
    technicalRiderDate: '2024-10-20',
  },
  {
    id: '20',
    name: 'Buray',
    genre: 'Pop',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop',
    flightRiderFile: 'buray_flight_rider.pdf',
    flightRiderSize: '165 KB',
    flightRiderDate: '2024-12-14',
    technicalRiderFile: 'buray_technical_rider.pdf',
    technicalRiderSize: '1.9 MB',
    technicalRiderDate: '2024-12-12',
  },
];

// Get artist by ID
export function getArtistById(id: string): Artist | undefined {
  return artists.find(artist => artist.id === id);
}

// Search artists by name
export function searchArtists(query: string): Artist[] {
  const lowercaseQuery = query.toLowerCase();
  return artists.filter(artist =>
    artist.name.toLowerCase().includes(lowercaseQuery) ||
    artist.genre?.toLowerCase().includes(lowercaseQuery)
  );
}

// Get artists sorted alphabetically
export function getArtistsSorted(): Artist[] {
  return [...artists].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

// Get artists by genre
export function getArtistsByGenre(genre: string): Artist[] {
  return artists.filter(artist =>
    artist.genre?.toLowerCase().includes(genre.toLowerCase())
  );
}

// Check if artist has all riders
export function hasCompleteRiders(artist: Artist): boolean {
  return !!(
    artist.flightRiderFile &&
    artist.technicalRiderFile &&
    artist.accommodationRiderFile &&
    artist.transportRiderFile
  );
}

// Get rider completion percentage
export function getRiderCompletionPercentage(artist: Artist): number {
  let count = 0;
  if (artist.flightRiderFile) count++;
  if (artist.technicalRiderFile) count++;
  if (artist.accommodationRiderFile) count++;
  if (artist.transportRiderFile) count++;
  return (count / 4) * 100;
}
