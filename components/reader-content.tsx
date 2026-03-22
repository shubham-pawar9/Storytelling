import Image from 'next/image';
import type {Episode, Story} from '@/data/stories';

export function ReaderContent({story, episode}: {story: Story; episode: Episode}) {
  return (
    <article className="space-y-8">
      <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] border border-border shadow-paper">
        <Image src={episode.aiImage} alt={episode.title} fill className="object-cover" priority />
      </div>
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.35em] text-primary">{story.genre}</p>
        <h1 className="font-serif text-4xl sm:text-5xl">{story.title}</h1>
        <h2 className="text-xl text-muted">{episode.title}</h2>
      </header>
      <div className="paper-panel drop-cap px-6 py-8 sm:px-8 lg:px-10">
        {episode.content.map((paragraph) => (
          <p key={paragraph} className="mb-6 max-w-3xl text-lg leading-9 text-foreground/90 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
