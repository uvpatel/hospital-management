import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <SignIn />
    </div>
  );
}
