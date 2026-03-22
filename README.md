# Storytelling

This Next.js app now supports three locales only: `en`, `hi`, and `mr`.

## Firestore collections

The app reads from the following Firestore paths through the Firestore REST API:

- `stories`
- `stories/{storyId}/episodes`

If Firestore is empty or unavailable, the UI falls back to the local demo stories in `data/stories.ts`.

## Supported story document shape

Each story document in `stories` can keep shared fields at the top level and localized fields inside `translations`, `locales`, `languages`, or direct locale keys (`en`, `hi`, `mr`).

```json
{
  "order": 1,
  "coverImage": "/covers/ramayana.svg",
  "featureImage": "/art/ramayana-hall.svg",
  "totalEpisodes": 3,
  "translations": {
    "en": {
      "title": "The Celestial Ramayana",
      "description": "English description",
      "genre": "Epic Mythology",
      "quote": "English quote"
    },
    "hi": {
      "title": "दैवी रामायण",
      "description": "हिंदी विवरण",
      "genre": "महाकाव्य",
      "quote": "हिंदी उद्धरण"
    },
    "mr": {
      "title": "दैवी रामायण",
      "description": "मराठी वर्णन",
      "genre": "महाकाव्य",
      "quote": "मराठी उद्धरण"
    }
  }
}
```

## Supported episode document shape

Each episode document inside `stories/{storyId}/episodes` supports the same localization pattern. The loader also accepts alternate field names such as `name`, `summary`, `excerpt`, `image`, and string `body` content split into paragraphs.

```json
{
  "episodeNumber": 1,
  "aiImage": "/art/ramayana-hall.svg",
  "translations": {
    "en": {
      "title": "Part 1",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3"]
    },
    "hi": {
      "title": "भाग 1",
      "content": ["अनुच्छेद 1", "अनुच्छेद 2", "अनुच्छेद 3"]
    },
    "mr": {
      "title": "भाग 1",
      "content": ["परिच्छेद 1", "परिच्छेद 2", "परिच्छेद 3"]
    }
  }
}
```


## Firebase config

The server-side Firestore REST loader reads these environment variables when present:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

If they are not set, the app falls back to the currently checked-in project values for `storytelling-2d8a4`.
