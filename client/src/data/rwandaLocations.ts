// Complete Rwanda Administrative Divisions
// Source: Official Rwanda administrative structure

export interface Sector {
  name: string;
}

export interface District {
  name: string;
  sectors: string[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const rwandaLocations: Province[] = [
  {
    name: 'Kigali City',
    districts: [
      {
        name: 'Gasabo',
        sectors: [
          'Bumbogo', 'Gatsata', 'Jali', 'Gikomero', 'Gisozi', 'Jabana',
          'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
          'Nduba', 'Remera', 'Rusororo', 'Rutunga'
        ]
      },
      {
        name: 'Kicukiro',
        sectors: [
          'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe',
          'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'
        ]
      },
      {
        name: 'Nyarugenge',
        sectors: [
          'Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Mageragere',
          'Muhima', 'Nyakabanda', 'Nyamirambo', 'Nyarugenge', 'Rwezamenyo'
        ]
      }
    ]
  },
  {
    name: 'Eastern Province',
    districts: [
      {
        name: 'Bugesera',
        sectors: [
          'Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange',
          'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata',
          'Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara'
        ]
      },
      {
        name: 'Gatsibo',
        sectors: [
          'Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo',
          'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama',
          'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo'
        ]
      },
      {
        name: 'Kayonza',
        sectors: [
          'Gahini', 'Kabare', 'Kabarondo', 'Mukarange', 'Murama',
          'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira'
        ]
      },
      {
        name: 'Kirehe',
        sectors: [
          'Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe',
          'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho',
          'Nyamugari', 'Nyarubuye'
        ]
      },
      {
        name: 'Ngoma',
        sectors: [
          'Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo',
          'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira',
          'Rukumberi', 'Rurenge', 'Sake', 'Zaza'
        ]
      },
      {
        name: 'Nyagatare',
        sectors: [
          'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Kiyombe',
          'Matimba', 'Mimuli', 'Mukama', 'Musheli', 'Nyagatare',
          'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe'
        ]
      },
      {
        name: 'Rwamagana',
        sectors: [
          'Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro',
          'Muhazi', 'Munyaga', 'Munyiginya', 'Musha', 'Muyumbu',
          'Mwulire', 'Nyakariro', 'Nzige', 'Rubona'
        ]
      }
    ]
  },
  {
    name: 'Northern Province',
    districts: [
      {
        name: 'Burera',
        sectors: [
          'Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga',
          'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa',
          'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde',
          'Rusarabuye', 'Rwerere'
        ]
      },
      {
        name: 'Gakenke',
        sectors: [
          'Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi',
          'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba',
          'Minazi', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba',
          'Ruli', 'Rusasa', 'Rushashi', 'Shangasha'
        ]
      },
      {
        name: 'Gicumbi',
        sectors: [
          'Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti',
          'Kageyo', 'Kaniga', 'Manyagiro', 'Miyove', 'Mukarange',
          'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya',
          'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko', 'Shangasha'
        ]
      },
      {
        name: 'Musanze',
        sectors: [
          'Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga',
          'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze',
          'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro'
        ]
      },
      {
        name: 'Rulindo',
        sectors: [
          'Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi',
          'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo',
          'Murambi', 'Ngoma', 'Ntarabana', 'Rukozo', 'Rusiga',
          'Shyorongi', 'Tumba'
        ]
      }
    ]
  },
  {
    name: 'Southern Province',
    districts: [
      {
        name: 'Gisagara',
        sectors: [
          'Gikonko', 'Gishubi', 'Kansi', 'Kibilizi', 'Kigembe',
          'Mamba', 'Muganza', 'Mugombwa', 'Mukindo', 'Musha',
          'Ndora', 'Nyanza', 'Save'
        ]
      },
      {
        name: 'Huye',
        sectors: [
          'Gishamvu', 'Huye', 'Karama', 'Kigoma', 'Kinazi',
          'Maraba', 'Mbazi', 'Mukura', 'Ngoma', 'Ruhashya',
          'Rusatira', 'Rwaniro', 'Simbi', 'Tumba'
        ]
      },
      {
        name: 'Kamonyi',
        sectors: [
          'Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina',
          'Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rukoma',
          'Rugarika', 'Runda'
        ]
      },
      {
        name: 'Muhanga',
        sectors: [
          'Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga',
          'Mushishiro', 'Nyabinoni', 'Nyamabuye', 'Nyarusange',
          'Rongi', 'Rugendabari', 'Shyogwe'
        ]
      },
      {
        name: 'Nyamagabe',
        sectors: [
          'Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha',
          'Kamegeri', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi',
          'Mugano', 'Musange', 'Musebeya', 'Mushubi', 'Nkomane',
          'Tare', 'Uwinkingi'
        ]
      },
      {
        name: 'Nyanza',
        sectors: [
          'Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kigoma',
          'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma'
        ]
      },
      {
        name: 'Nyaruguru',
        sectors: [
          'Cyahinda', 'Busanze', 'Kibeho', 'Kivu', 'Mata',
          'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata',
          'Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge'
        ]
      },
      {
        name: 'Ruhango',
        sectors: [
          'Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira',
          'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango'
        ]
      }
    ]
  },
  {
    name: 'Western Province',
    districts: [
      {
        name: 'Karongi',
        sectors: [
          'Bwishyura', 'Gashari', 'Gishyita', 'Gisovu', 'Gitesi',
          'Mubuga', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera',
          'Rugabano', 'Ruganda', 'Rwankuba'
        ]
      },
      {
        name: 'Ngororero',
        sectors: [
          'Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo',
          'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro',
          'Ngororero', 'Nyange', 'Sovu'
        ]
      },
      {
        name: 'Nyabihu',
        sectors: [
          'Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago',
          'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera',
          'Rurembo', 'Shyira'
        ]
      },
      {
        name: 'Nyamasheke',
        sectors: [
          'Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano',
          'Kanjongo', 'Karambi', 'Karengera', 'Kirimbi', 'Macuba',
          'Mahembe', 'Nyabitekeri', 'Rangiro', 'Ruharambuga', 'Shangi'
        ]
      },
      {
        name: 'Rubavu',
        sectors: [
          'Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama',
          'Kanzenze', 'Mudende', 'Nyakiliba', 'Nyamyumba', 'Nyundo',
          'Rubavu', 'Rugerero'
        ]
      },
      {
        name: 'Rusizi',
        sectors: [
          'Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke',
          'Gihundwe', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu',
          'Nkanka', 'Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo',
          'Nzahaha', 'Rwimbogo'
        ]
      },
      {
        name: 'Rutsiro',
        sectors: [
          'Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira',
          'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati',
          'Nyabirasi', 'Ruhango', 'Rusebeya'
        ]
      }
    ]
  }
];

// Helper functions
export const getAllProvinces = (): string[] => {
  return rwandaLocations.map(province => province.name);
};

export const getDistrictsByProvince = (provinceName: string): string[] => {
  const province = rwandaLocations.find(p => p.name === provinceName);
  return province ? province.districts.map(d => d.name) : [];
};

export const getSectorsByDistrict = (districtName: string): string[] => {
  for (const province of rwandaLocations) {
    const district = province.districts.find(d => d.name === districtName);
    if (district) {
      return district.sectors;
    }
  }
  return [];
};

export const getProvinceByDistrict = (districtName: string): string | null => {
  for (const province of rwandaLocations) {
    if (province.districts.some(d => d.name === districtName)) {
      return province.name;
    }
  }
  return null;
};

export const getAllDistricts = (): string[] => {
  const districts: string[] = [];
  rwandaLocations.forEach(province => {
    province.districts.forEach(district => {
      districts.push(district.name);
    });
  });
  return districts.sort();
};

export const getAllSectors = (): string[] => {
  const sectors: string[] = [];
  rwandaLocations.forEach(province => {
    province.districts.forEach(district => {
      sectors.push(...district.sectors);
    });
  });
  return sectors.sort();
};

// Reverse geocoding helper - find location from coordinates
export const findLocationFromCoordinates = async (lat: number, lng: number): Promise<{
  province?: string;
  district?: string;
  sector?: string;
  address?: string;
} | null> => {
  try {
    // Use Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components;
      
      let province = '';
      let district = '';
      let sector = '';
      let address = result.formatted_address;
      
      // Extract administrative levels
      for (const component of addressComponents) {
        const types = component.types;
        
        // District level (administrative_area_level_2)
        if (types.includes('administrative_area_level_2')) {
          const districtName = component.long_name.replace(' District', '');
          // Verify it's a valid Rwanda district
          if (getAllDistricts().includes(districtName)) {
            district = districtName;
            province = getProvinceByDistrict(districtName) || '';
          }
        }
        
        // Sector level (administrative_area_level_3 or locality)
        if (types.includes('administrative_area_level_3') || types.includes('locality')) {
          const sectorName = component.long_name.replace(' Sector', '');
          // Verify it's a valid sector for the district
          if (district && getSectorsByDistrict(district).includes(sectorName)) {
            sector = sectorName;
          }
        }
      }
      
      return { province, district, sector, address };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};