import type {Story} from '@/data/stories';
import {StoryCard} from './story-card';

export async function StoryGrid({stories, locale}: {stories: Story[]; locale: string}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} locale={locale} />
      ))}
    </div>
  );
}
