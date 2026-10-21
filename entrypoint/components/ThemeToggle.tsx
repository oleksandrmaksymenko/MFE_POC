'use client';

export function ThemeToggle() {
  return (
    <button
      style={{ marginLeft: 'auto' }}
      onClick={() => {
        const el = document.documentElement;
        el.dataset.theme = el.dataset.theme === 'dark' ? 'light' : 'dark';
      }}
    >
      theme
    </button>
  );
}
