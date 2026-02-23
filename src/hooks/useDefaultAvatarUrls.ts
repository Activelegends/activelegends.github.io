import { useState, useEffect } from 'react';
import { defaultAvatarsService } from '../services/defaultAvatarsService';

export function useDefaultAvatarUrls(): string[] {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    defaultAvatarsService
      .getList()
      .then((list) => setUrls(list.map((a) => a.url)))
      .catch(() => setUrls([]));
  }, []);
  return urls;
}
