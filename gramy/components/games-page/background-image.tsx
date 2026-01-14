interface BackgroundImageProps {
  imageUrl: string | null;
}

export default function BackgroundImage({ imageUrl }: BackgroundImageProps) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-cover bg-center blur-md scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
