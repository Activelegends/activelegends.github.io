import { useState, useEffect } from 'react';
import { defaultAvatarsService } from '../services/defaultAvatarsService';

export function useDefaultAvatarUrls(): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    try {
      defaultAvatarsService
        .getList()
        .then((list) => {
          if (!cancelled && Array.isArray(list)) setUrls(list.map((a) => (a && a.url) ? a.url : '').filter(Boolean));
        })
        .catch(() => {
          if (!cancelled) setUrls([]);
        });
    } catch {
      setUrls([]);
    }
    return () => { cancelled = true; };
  }, []);
  return urls;
}
