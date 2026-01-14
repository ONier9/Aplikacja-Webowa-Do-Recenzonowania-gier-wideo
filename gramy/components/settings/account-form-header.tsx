import Avatar from '@/components/user/avatar';

interface AccountFormHeaderProps {
  userId: string | null;
  avatarUrl: string | null;
  loading: boolean;
  onAvatarUpload: (url: string) => void;
}

export function AccountFormHeader({ 
  userId, 
  avatarUrl, 
  loading, 
  onAvatarUpload 
}: AccountFormHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar
        uid={userId}
        url={avatarUrl}
        size={120}
        onUpload={(url) => {
          onAvatarUpload(url);
        }}
      />
    </div>
  );
}