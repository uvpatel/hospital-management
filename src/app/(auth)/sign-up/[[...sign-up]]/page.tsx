import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <SignUp />
    </div>
  );
}
