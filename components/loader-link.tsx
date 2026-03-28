'use client';

import Link, {type LinkProps} from 'next/link';
import {forwardRef} from 'react';
import type {AnchorHTMLAttributes, MouseEvent} from 'react';
import {useLoader} from './loader-context';

type LoaderLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    loaderMessage?: string;
    minDurationMs?: number;
  };

export const LoaderLink = forwardRef<HTMLAnchorElement, LoaderLinkProps>(function LoaderLink(
  {onClick, loaderMessage, minDurationMs, ...props},
  ref
) {
  const {showLoader, isLoading} = useLoader();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented || isLoading || props.target === '_blank') {
      return;
    }

    showLoader({message: loaderMessage, minDurationMs});
  };

  return <Link ref={ref} {...props} onClick={handleClick} aria-disabled={isLoading || props['aria-disabled']} />;
});
