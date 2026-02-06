import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type AvatarPreviewProps = {
  src?: string;
  alt: string;
  fallback: string;
  title?: string;
  className?: string;
};

export function AvatarPreview({ src, alt, fallback, title = 'Изображение', className }: AvatarPreviewProps) {
  const avatar = (
    <Avatar className={className}>
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );

  if (!src) {
    return avatar;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={title}
        >
          {avatar}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <img
            src={src}
            alt={alt}
            className="max-h-[70vh] w-full rounded-2xl object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

