import type {Locale} from "@/i18n/config";

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

type StoryFields = Omit<Story, "id" | "language">;
type EpisodeFields = Omit<Episode, "id" | "storyId">;
type FirestoreValue =
  | {stringValue: string}
  | {integerValue: string}
  | {doubleValue: number}
  | {booleanValue: boolean}
  | {mapValue: {fields?: Record<string, FirestoreValue>}}
  | {arrayValue: {values?: FirestoreValue[]}}
  | {nullValue: null};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type LocalizedFields<T> = Partial<Record<Locale, Partial<T>>> & {
  translations?: Partial<Record<Locale, Partial<T>>>;
  locales?: Partial<Record<Locale, Partial<T>>>;
};

const firestoreConfig = {
  apiKey: "AIzaSyAxB2FX_fNeue30Pn_06Cou2-Y3f6kQ7cc",
  projectId: "storytelling-2d8a4"
};

const partLabel: Record<Locale, string> = {
  en: "Part",
  hi: "भाग",
  mr: "भाग"
};

const storyLocales: Record<Locale, Omit<Story, "language">[]> = {
  en: [
    {
      id: "ramayana",
      title: "The Celestial Ramayana",
      description: "A luminous retelling of duty, exile, courage, and return, reimagined as an AI-guided epic.",
      coverImage: "/covers/ramayana.svg",
      totalEpisodes: 50,
      genre: "Epic Mythology",
      quote: "Every chapter feels like an illuminated manuscript unfolding at moonrise.",
      featureImage: "/art/ramayana-hall.svg"
    },
    {
      id: "midnight-archive",
      title: "The Midnight Archive",
      description: "Archivists decode forgotten dreams trapped between shelves and starlight.",
      coverImage: "/covers/archive.svg",
      totalEpisodes: 18,
      genre: "Mystery",
      quote: "A whispered mystery wrapped in velvet shadows and golden dust.",
      featureImage: "/art/archive-chamber.svg"
    },
    {
      id: "obsidian-city",
      title: "The Obsidian City",
      description: "A noir journey through a city where stories are traded like currency.",
      coverImage: "/covers/obsidian.svg",
      totalEpisodes: 26,
      genre: "Dark Fantasy",
      quote: "Sharp as glass, warm as candlelight, and impossible to leave behind.",
      featureImage: "/art/obsidian-gate.svg"
    },
    {
      id: "verdant-code",
      title: "The Verdant Code",
      description: "Engineers and botanists unlock a sentient forest written in living script.",
      coverImage: "/covers/verdant.svg",
      totalEpisodes: 12,
      genre: "Science Fantasy",
      quote: "It reads like a field journal penned by poets and dreamers.",
      featureImage: "/art/verdant-forest.svg"
    },
    {
      id: "clockwork-crown",
      title: "Clockwork Crown",
      description: "A royal inheritance tested by machines, memory, and the ethics of invention.",
      coverImage: "/covers/clockwork.svg",
      totalEpisodes: 20,
      genre: "Steampunk",
      quote: "Regal, mechanical, and deeply human in all the right places.",
      featureImage: "/art/clockwork-court.svg"
    },
    {
      id: "salt-and-sky",
      title: "Salt & Sky",
      description: "A seafaring meditation on maps, migration, and voices carried by wind.",
      coverImage: "/covers/salt.svg",
      totalEpisodes: 14,
      genre: "Adventure",
      quote: "A salt-kissed tale that moves with the patience of tides.",
      featureImage: "/art/salt-coast.svg"
    }
  ],
  hi: [],
  mr: []
};

storyLocales.hi = storyLocales.en.map((story, index) => ({
  ...story,
  title: ["दैवी रामायण", "मध्यरात्रि अभिलेखागार", "ओब्सीडियन नगर", "हरित संकेत", "घड़ीदार मुकुट", "नमक और आकाश"][index],
  description: [
    "कर्तव्य, वनवास, साहस और वापसी की उज्ज्वल कथा, जिसे एआई ने नए रूप में बुना है।",
    "पुस्तकों और तारों के बीच फंसे स्वप्नों को पढ़ते अभिलेखपालों की रहस्यमयी यात्रा।",
    "ऐसे नगर की नॉयर यात्रा जहाँ कहानियाँ मुद्रा की तरह खरीदी-बेची जाती हैं।",
    "जीवित लिपि में लिखे संवेदनशील वन को समझने की खोज।",
    "आविष्कार, स्मृति और उत्तराधिकार के बीच एक राजसी संघर्ष।",
    "मानचित्रों, प्रवास और हवा में बहती आवाज़ों पर आधारित समुद्री कथा।"
  ][index],
  genre: ["महाकाव्य", "रहस्य", "डार्क फैंटेसी", "विज्ञान फैंटेसी", "स्टीमपंक", "साहसिक"][index],
  quote: [
    "हर अध्याय चाँदनी में खुलती चित्रित पांडुलिपि जैसा लगता है।",
    "मखमली अँधेरे और सुनहरी धूल में लिपटा रहस्य।",
    "काँच-सा तीखा, दीपक-सा गर्म, और भूलना कठिन।",
    "मानो कवियों और स्वप्नदर्शियों ने मिलकर वन-दैनंदिनी लिखी हो।",
    "राजसी, यांत्रिक और गहराई से मानवीय।",
    "ज्वार की धैर्यपूर्ण चाल से आगे बढ़ती नमकीन कथा।"
  ][index]
}));
storyLocales.mr = storyLocales.en.map((story, index) => ({
  ...story,
  title: ["दैवी रामायण", "मध्यरात्री संग्रह", "ओब्सिडियन शहर", "हरित संकेत", "घड्याळी मुकुट", "मीठ आणि आकाश"][index],
  description: [
    "कर्तव्य, वनवास, धैर्य आणि पुनरागमनाची एआयने नव्याने विणलेली उजळ महाकथा.",
    "शेल्फ आणि तारकांच्या मध्ये अडकलेल्या स्वप्नांचा मागोवा घेणाऱ्या ग्रंथपालांची कथा.",
    "जिथे कथा चलनासारख्या फिरतात अशा शहरातील गूढ प्रवास.",
    "जिवंत लिपीत लिहिलेल्या जाणत्या जंगलाचा शोध.",
    "आविष्कार, स्मृती आणि वारशामधील राजघराण्याची परीक्षा.",
    "नकाशे, स्थलांतर आणि वाऱ्यावर वाहणाऱ्या आवाजांची सागरी कथा."
  ][index],
  genre: ["महाकाव्य", "रहस्य", "डार्क फँटसी", "विज्ञान फँटसी", "स्टीमपंक", "साहसी"][index],
  quote: [
    "प्रत्येक अध्याय चांदण्यात खुलणाऱ्या सुलेखन हस्तलिखितासारखा वाटतो.",
    "मखमली सावल्या आणि सोनसळी धुळीत गुंडाळलेले रहस्य.",
    "काचेसारखे तीक्ष्ण, मेणबत्तीप्रमाणे उबदार.",
    "जणू कवींनी आणि स्वप्नरंजन करणाऱ्यांनी लिहिलेली वन-दैनंदिनी.",
    "राजेशाही, यांत्रिक आणि खोलवर मानवी.",
    "भरती-ओहोटीच्या संयमी लयीत पुढे सरकणारी कथा."
  ][index]
}));

const openingParagraphs: Record<Locale, string[]> = {
  en: [
    "The hall of memory opened with a hush, as if the walls themselves remembered every prayer spoken within them.",
    "Each lantern held a different age of light, and beneath them the path forward looked both ancient and new.",
    "In this telling, the narrator listens first, allowing history to bloom slowly like ink warming beneath the hand."
  ],
  hi: [
    "स्मृति का प्रांगण ऐसी शांति से खुला मानो दीवारों ने भीतर कही गई हर प्रार्थना सँभाल रखी हो।",
    "हर दीपक में अलग समय की रोशनी थी और उनके नीचे का मार्ग एक साथ पुराना और नया लगता था।",
    "इस कथा में कथावाचक पहले सुनता है, ताकि इतिहास धीरे-धीरे स्याही की तरह खिल सके।"
  ],
  mr: [
    "स्मृतीचा सभामंडप इतक्या शांतपणे उघडला की भिंतींनी प्रत्येक प्रार्थना जपून ठेवली आहे असे वाटले.",
    "प्रत्येक कंदिलात वेगळ्या काळाचा प्रकाश होता आणि त्याखालील वाट एकाच वेळी जुनी आणि नवी भासत होती.",
    "या कथनात निवेदक आधी ऐकतो, मग इतिहास हाताखाली उबदार होत जाणाऱ्या शाईसारखा खुलतो."
  ]
};

function getFallbackStories(locale: Locale): Story[] {
  return storyLocales[locale].map((story) => ({...story, language: locale}));
}

function getFallbackStory(locale: Locale, storyId: string): Story | undefined {
  return getFallbackStories(locale).find((story) => story.id === storyId);
}

function getFallbackEpisodes(locale: Locale, storyId: string): Episode[] {
  const story = getFallbackStory(locale, storyId) ?? getFallbackStories(locale)[0];

  if (!story) {
    return [];
  }

  return Array.from({length: story.totalEpisodes}, (_, index) => {
    const number = index + 1;
    return {
      id: `${storyId}-${number}`,
      storyId,
      episodeNumber: number,
      title: `${story.title} — ${partLabel[locale]} ${number}`,
      content: [
        openingParagraphs[locale][0],
        `${openingParagraphs[locale][1]} ${story.description}`,
        `${openingParagraphs[locale][2]} ${story.quote}`
      ],
      aiImage: story.featureImage
    };
  });
}

function parseFirestoreValue(value: FirestoreValue | undefined): unknown {
  if (!value) {
    return undefined;
  }

  if ("stringValue" in value) {
    return value.stringValue;
  }

  if ("integerValue" in value) {
    return Number(value.integerValue);
  }

  if ("doubleValue" in value) {
    return value.doubleValue;
  }

  if ("booleanValue" in value) {
    return value.booleanValue;
  }

  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((item) => parseFirestoreValue(item));
  }

  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields ?? {}).map(([key, fieldValue]) => [key, parseFirestoreValue(fieldValue)])
    );
  }

  return null;
}

function parseFirestoreDocument(document: FirestoreDocument): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(document.fields ?? {}).map(([key, value]) => [key, parseFirestoreValue(value)])
  );
}

function getLocalizedFields<T extends object>(source: Partial<T> & LocalizedFields<T>, locale: Locale): Partial<T> {
  const byLocale = source[locale] ?? source.translations?.[locale] ?? source.locales?.[locale] ?? {};
  return {...source, ...byLocale};
}

function normalizeStory(id: string, locale: Locale, source: Record<string, unknown>): Story | null {
  const localized = getLocalizedFields<StoryFields>(source as Partial<StoryFields> & LocalizedFields<StoryFields>, locale);
  const title = typeof localized.title === "string" ? localized.title : null;
  const description = typeof localized.description === "string" ? localized.description : null;

  if (!title || !description) {
    return null;
  }

  return {
    id,
    language: locale,
    title,
    description,
    coverImage: typeof localized.coverImage === "string" ? localized.coverImage : "/covers/ramayana.svg",
    totalEpisodes: typeof localized.totalEpisodes === "number" ? localized.totalEpisodes : 1,
    genre: typeof localized.genre === "string" ? localized.genre : "Story",
    quote: typeof localized.quote === "string" ? localized.quote : "",
    featureImage: typeof localized.featureImage === "string" ? localized.featureImage : "/art/ramayana-hall.svg"
  };
}

function normalizeEpisode(storyId: string, locale: Locale, source: Record<string, unknown>, fallbackIndex: number): Episode | null {
  const localized = getLocalizedFields<EpisodeFields>(source as Partial<EpisodeFields> & LocalizedFields<EpisodeFields>, locale);
  const episodeNumber = typeof localized.episodeNumber === "number" ? localized.episodeNumber : fallbackIndex + 1;
  const title = typeof localized.title === "string" ? localized.title : `${partLabel[locale]} ${episodeNumber}`;
  const rawContent = localized.content;
  const content = Array.isArray(rawContent) ? rawContent.filter((item): item is string => typeof item === "string") : [];

  if (!content.length) {
    return null;
  }

  return {
    id: typeof source.id === "string" ? source.id : `${storyId}-${episodeNumber}`,
    storyId,
    episodeNumber,
    title,
    content,
    aiImage: typeof localized.aiImage === "string" ? localized.aiImage : "/art/ramayana-hall.svg"
  };
}

async function fetchFirestoreDocuments(path: string): Promise<FirestoreDocument[]> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${firestoreConfig.projectId}/databases/(default)/documents/${path}?key=${firestoreConfig.apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Firestore request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {documents?: FirestoreDocument[]};
  return payload.documents ?? [];
}

function getDocumentId(name: string): string {
  return name.split("/").pop() ?? name;
}

async function fetchFirestoreStories(locale: Locale): Promise<Story[]> {
  const documents = await fetchFirestoreDocuments("stories");

  return documents
    .map((document) => {
      const parsed = parseFirestoreDocument(document);
      const order = typeof parsed.order === "number" ? parsed.order : Number.MAX_SAFE_INTEGER;
      const story = normalizeStory(getDocumentId(document.name), locale, parsed);
      return story ? {order, story} : null;
    })
    .filter((entry): entry is {order: number; story: Story} => entry !== null)
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.story);
}

async function fetchFirestoreEpisodes(locale: Locale, storyId: string): Promise<Episode[]> {
  const documents = await fetchFirestoreDocuments(`stories/${storyId}/episodes`);

  return documents
    .map((document, index) => normalizeEpisode(storyId, locale, {id: getDocumentId(document.name), ...parseFirestoreDocument(document)}, index))
    .filter((episode): episode is Episode => episode !== null)
    .sort((left, right) => left.episodeNumber - right.episodeNumber);
}

export async function getStories(locale: Locale): Promise<Story[]> {
  try {
    const stories = await fetchFirestoreStories(locale);
    return stories.length ? stories : getFallbackStories(locale);
  } catch {
    return getFallbackStories(locale);
  }
}

export async function getStory(locale: Locale, storyId: string): Promise<Story | undefined> {
  try {
    const stories = await fetchFirestoreStories(locale);
    const story = stories.find((entry) => entry.id === storyId);

    if (story) {
      return story;
    }
  } catch {
    // Fall through to local fallback data.
  }

  return getFallbackStory(locale, storyId);
}

export async function getEpisodes(locale: Locale, storyId: string): Promise<Episode[]> {
  try {
    const episodes = await fetchFirestoreEpisodes(locale, storyId);
    return episodes.length ? episodes : getFallbackEpisodes(locale, storyId);
  } catch {
    return getFallbackEpisodes(locale, storyId);
  }
}

export async function getEpisode(locale: Locale, storyId: string, episodeNumber: number): Promise<Episode | undefined> {
  const episodes = await getEpisodes(locale, storyId);
  return episodes.find((episode) => episode.episodeNumber === episodeNumber);
}
