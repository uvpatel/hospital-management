import BreadCrumb from '@/components/BreadcrumNav'
import { UserProfile } from '@clerk/nextjs'
import React from 'react'

export default function UserProfilePage() {
  return (

    <div className='flex flex-col items-center  min-h-screen p-2 m-4 gap-4'>

    <BreadCrumb
  items={[
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Invoices",
    },
  ]}
/>
    <div className='flex justify-center items-center'>
       
        <UserProfile />

    </div>
    
</div>
  )
}
