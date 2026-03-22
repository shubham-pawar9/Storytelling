import Image from 'next/image';
import {cn} from './utils';

type StoryImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

function isRemoteAsset(src: string) {
  return /^https?:\/\//i.test(src);
}

export function StoryImage({src, alt, className, fill = false, priority = false, sizes, width, height}: StoryImageProps) {
  if (isRemoteAsset(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill ? 'absolute inset-0 h-full w-full' : 'h-auto w-full', className)}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      priority={priority}
      sizes={sizes}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
    />
  );
}
