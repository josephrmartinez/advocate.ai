import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/logo';
import { PowerIcon, ArrowRightStartOnRectangleIcon} from '@heroicons/react/24/outline';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-2 md:px-2">
      <Link
        className="mb-2 flex h-20 items-start justify-start rounded-md border border-gray-100 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 mt-6 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        
          <form action="/auth/signout" method="post">
            <button 
              type='submit'
              className="h-[48px] flex md:w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-teal-600 md:flex-none md:justify-start md:p-2 px-3">
              <ArrowRightStartOnRectangleIcon className="w-6" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </form>

        
        
        
      </div>
    </div>
  );
}
