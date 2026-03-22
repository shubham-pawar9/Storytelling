import type {Locale} from '@/i18n/config';

export type Story = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  totalEpisodes: number;
  language: Locale;
  genre: string;
  quote: string;
  featureImage: string;
};

export type Episode = {
  id: string;
  storyId: string;
  episodeNumber: number;
  title: string;
  content: string[];
  aiImage: string;
};

const storyLocales: Record<Locale, Omit<Story, 'language'>[]> = {
  en: [
    {
      id: 'ramayana',
      title: 'The Celestial Ramayana',
      description: 'A luminous retelling of duty, exile, courage, and return, reimagined as an AI-guided epic.',
      coverImage: '/covers/ramayana.svg',
      totalEpisodes: 50,
      genre: 'Epic Mythology',
      quote: 'Every chapter feels like an illuminated manuscript unfolding at moonrise.',
      featureImage: '/art/ramayana-hall.svg'
    },
    {
      id: 'midnight-archive',
      title: 'The Midnight Archive',
      description: 'Archivists decode forgotten dreams trapped between shelves and starlight.',
      coverImage: '/covers/archive.svg',
      totalEpisodes: 18,
      genre: 'Mystery',
      quote: 'A whispered mystery wrapped in velvet shadows and golden dust.',
      featureImage: '/art/archive-chamber.svg'
    },
    {
      id: 'obsidian-city',
      title: 'The Obsidian City',
      description: 'A noir journey through a city where stories are traded like currency.',
      coverImage: '/covers/obsidian.svg',
      totalEpisodes: 26,
      genre: 'Dark Fantasy',
      quote: 'Sharp as glass, warm as candlelight, and impossible to leave behind.',
      featureImage: '/art/obsidian-gate.svg'
    },
    {
      id: 'verdant-code',
      title: 'The Verdant Code',
      description: 'Engineers and botanists unlock a sentient forest written in living script.',
      coverImage: '/covers/verdant.svg',
      totalEpisodes: 12,
      genre: 'Science Fantasy',
      quote: 'It reads like a field journal penned by poets and dreamers.',
      featureImage: '/art/verdant-forest.svg'
    },
    {
      id: 'clockwork-crown',
      title: 'Clockwork Crown',
      description: 'A royal inheritance tested by machines, memory, and the ethics of invention.',
      coverImage: '/covers/clockwork.svg',
      totalEpisodes: 20,
      genre: 'Steampunk',
      quote: 'Regal, mechanical, and deeply human in all the right places.',
      featureImage: '/art/clockwork-court.svg'
    },
    {
      id: 'salt-and-sky',
      title: 'Salt & Sky',
      description: 'A seafaring meditation on maps, migration, and voices carried by wind.',
      coverImage: '/covers/salt.svg',
      totalEpisodes: 14,
      genre: 'Adventure',
      quote: 'A salt-kissed tale that moves with the patience of tides.',
      featureImage: '/art/salt-coast.svg'
    }
  ],
  hi: [],
  mr: [],
  es: []
};

storyLocales.hi = storyLocales.en.map((story, index) => ({
  ...story,
  title: ['दैवी रामायण', 'मध्यरात्रि अभिलेखागार', 'ओब्सीडियन नगर', 'हरित संकेत', 'घड़ीदार मुकुट', 'नमक और आकाश'][index],
  description: [
    'कर्तव्य, वनवास, साहस और वापसी की उज्ज्वल कथा, जिसे एआई ने नए रूप में बुना है।',
    'पुस्तकों और तारों के बीच फंसे स्वप्नों को पढ़ते अभिलेखपालों की रहस्यमयी यात्रा।',
    'ऐसे नगर की नॉयर यात्रा जहाँ कहानियाँ मुद्रा की तरह खरीदी-बेची जाती हैं।',
    'जीवित लिपि में लिखे संवेदनशील वन को समझने की खोज।',
    'आविष्कार, स्मृति और उत्तराधिकार के बीच एक राजसी संघर्ष।',
    'मानचित्रों, प्रवास और हवा में बहती आवाज़ों पर आधारित समुद्री कथा।'
  ][index],
  genre: ['महाकाव्य', 'रहस्य', 'डार्क फैंटेसी', 'विज्ञान फैंटेसी', 'स्टीमपंक', 'साहसिक'][index],
  quote: [
    'हर अध्याय चाँदनी में खुलती चित्रित पांडुलिपि जैसा लगता है।',
    'मखमली अँधेरे और सुनहरी धूल में लिपटा रहस्य।',
    'काँच-सा तीखा, दीपक-सा गर्म, और भूलना कठिन।',
    'मानो कवियों और स्वप्नदर्शियों ने मिलकर वन-दैनंदिनी लिखी हो।',
    'राजसी, यांत्रिक और गहराई से मानवीय।',
    'ज्वार की धैर्यपूर्ण चाल से आगे बढ़ती नमकीन कथा।'
  ][index]
}));
storyLocales.mr = storyLocales.en.map((story, index) => ({
  ...story,
  title: ['दैवी रामायण', 'मध्यरात्री संग्रह', 'ओब्सिडियन शहर', 'हरित संकेत', 'घड्याळी मुकुट', 'मीठ आणि आकाश'][index],
  description: [
    'कर्तव्य, वनवास, धैर्य आणि पुनरागमनाची एआयने नव्याने विणलेली उजळ महाकथा.',
    'शेल्फ आणि तारकांच्या मध्ये अडकलेल्या स्वप्नांचा मागोवा घेणाऱ्या ग्रंथपालांची कथा.',
    'जिथे कथा चलनासारख्या फिरतात अशा शहरातील गूढ प्रवास.',
    'जिवंत लिपीत लिहिलेल्या जाणत्या जंगलाचा शोध.',
    'आविष्कार, स्मृती आणि वारशामधील राजघराण्याची परीक्षा.',
    'नकाशे, स्थलांतर आणि वाऱ्यावर वाहणाऱ्या आवाजांची सागरी कथा.'
  ][index],
  genre: ['महाकाव्य', 'रहस्य', 'डार्क फँटसी', 'विज्ञान फँटसी', 'स्टीमपंक', 'साहसी'][index],
  quote: [
    'प्रत्येक अध्याय चांदण्यात खुलणाऱ्या सुलेखन हस्तलिखितासारखा वाटतो.',
    'मखमली सावल्या आणि सोनसळी धुळीत गुंडाळलेले रहस्य.',
    'काचेसारखे तीक्ष्ण, मेणबत्तीप्रमाणे उबदार.',
    'जणू कवींनी आणि स्वप्नरंजन करणाऱ्यांनी लिहिलेली वन-दैनंदिनी.',
    'राजेशाही, यांत्रिक आणि खोलवर मानवी.',
    'भरती-ओहोटीच्या संयमी लयीत पुढे सरकणारी कथा.'
  ][index]
}));
storyLocales.es = storyLocales.en.map((story, index) => ({
  ...story,
  title: ['Ramayana Celestial', 'El Archivo de Medianoche', 'La Ciudad de Obsidiana', 'El Código Verde', 'Corona Mecánica', 'Sal y Cielo'][index],
  description: [
    'Un relato luminoso sobre deber, exilio, valor y regreso, reinventado con guía de IA.',
    'Archiveros descifran sueños olvidados atrapados entre estantes y estrellas.',
    'Un viaje noir por una ciudad donde las historias se intercambian como moneda.',
    'Ingenieras y botánicos descifran un bosque consciente escrito en lenguaje vivo.',
    'Una herencia real puesta a prueba por máquinas, memoria y ética.',
    'Una meditación marítima sobre mapas, migración y voces llevadas por el viento.'
  ][index],
  genre: ['Mitología épica', 'Misterio', 'Fantasía oscura', 'Ciencia fantástica', 'Steampunk', 'Aventura'][index],
  quote: [
    'Cada capítulo se siente como un manuscrito iluminado al caer la luna.',
    'Un misterio susurrado entre terciopelo y polvo dorado.',
    'Filoso como vidrio, cálido como la luz de una vela.',
    'Se lee como un cuaderno de campo escrito por poetas.',
    'Regia, mecánica y profundamente humana.',
    'Una historia salada que avanza con la paciencia de las mareas.'
  ][index]
}));

export function getStories(locale: Locale): Story[] {
  return storyLocales[locale].map((story) => ({...story, language: locale}));
}

export function getStory(locale: Locale, storyId: string): Story | undefined {
  return getStories(locale).find((story) => story.id === storyId);
}

export function getEpisodes(locale: Locale, storyId: string): Episode[] {
  const story = getStory(locale, storyId) ?? getStories(locale)[0];
  const openingParagraphs: Record<Locale, string[]> = {
    en: [
      'The hall of memory opened with a hush, as if the walls themselves remembered every prayer spoken within them.',
      'Each lantern held a different age of light, and beneath them the path forward looked both ancient and new.',
      'In this telling, the narrator listens first, allowing history to bloom slowly like ink warming beneath the hand.'
    ],
    hi: [
      'स्मृति का प्रांगण ऐसी शांति से खुला मानो दीवारों ने भीतर कही गई हर प्रार्थना सँभाल रखी हो।',
      'हर दीपक में अलग समय की रोशनी थी और उनके नीचे का मार्ग एक साथ पुराना और नया लगता था।',
      'इस कथा में कथावाचक पहले सुनता है, ताकि इतिहास धीरे-धीरे स्याही की तरह खिल सके।'
    ],
    mr: [
      'स्मृतीचा सभामंडप इतक्या शांतपणे उघडला की भिंतींनी प्रत्येक प्रार्थना जपून ठेवली आहे असे वाटले.',
      'प्रत्येक कंदिलात वेगळ्या काळाचा प्रकाश होता आणि त्याखालील वाट एकाच वेळी जुनी आणि नवी भासत होती.',
      'या कथनात निवेदक आधी ऐकतो, मग इतिहास हाताखाली उबदार होत जाणाऱ्या शाईसारखा खुलतो.'
    ],
    es: [
      'El salón de la memoria se abrió en silencio, como si las paredes recordaran cada plegaria pronunciada allí.',
      'Cada lámpara guardaba una edad distinta de luz, y bajo ellas el camino parecía antiguo y nuevo a la vez.',
      'En esta versión, la narradora escucha primero para que la historia florezca lentamente.'
    ]
  };

  return Array.from({length: story.totalEpisodes}, (_, index) => {
    const number = index + 1;
    return {
      id: `${storyId}-${number}`,
      storyId,
      episodeNumber: number,
      title: `${story.title} — ${locale === 'en' ? 'Part' : locale === 'es' ? 'Parte' : 'भाग'} ${number}`,
      content: [
        openingParagraphs[locale][0],
        `${openingParagraphs[locale][1]} ${story.description}`,
        `${openingParagraphs[locale][2]} ${story.quote}`
      ],
      aiImage: story.featureImage
    };
  });
}

export function getEpisode(locale: Locale, storyId: string, episodeNumber: number): Episode | undefined {
  return getEpisodes(locale, storyId).find((episode) => episode.episodeNumber === episodeNumber);
}
