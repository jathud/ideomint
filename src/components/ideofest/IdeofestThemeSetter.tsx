'use client';

import { useEffect } from 'react';

export default function IdeofestThemeSetter() {
  useEffect(() => {
    document.documentElement.classList.add('ideofest-theme');
    document.body.classList.add('ideofest-theme');
    return () => {
      document.documentElement.classList.remove('ideofest-theme');
      document.body.classList.remove('ideofest-theme');
    };
  }, []);

  return null;
}
