import { useEffect, useRef } from 'react';

/**
 * رندر HTML تبلیغ و اجرای اسکریپت‌های داخل آن (مثل یکتانت).
 * با dangerouslySetInnerHTML اسکریپت‌ها اجرا نمی‌شوند؛ این کامپوننت آن‌ها را به‌صورت دستی اجرا می‌کند.
 */
export default function AdSnippet({
  html,
  className = 'sponsor-box sponsor-box-text',
  position,
}: {
  html: string;
  className?: string;
  position?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !html) return;

    el.innerHTML = html;
    const scripts = el.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={position === 'special' ? `${className} sponsor-box-special` : className}
    />
  );
}
