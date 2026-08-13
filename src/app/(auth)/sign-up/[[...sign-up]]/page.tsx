import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return( 
    <div className="flex flex-col items-center  min-h-screen p-2 m-4">
<SignUp />
    </div>
  )
}