import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useLocale } from '@/app/providers/locale-provider';
import { useTheme } from '@/app/providers/theme-provider';

/** shadcn's Sonner wrapper, wired to this app's theme and text direction. */
function Toaster(props: ToasterProps) {
  const { theme } = useTheme();
  const { direction } = useLocale();

  return (
    <Sonner
      theme={theme}
      dir={direction}
      position={direction === 'rtl' ? 'bottom-left' : 'bottom-right'}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
