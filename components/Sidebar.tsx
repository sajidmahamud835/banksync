'use client'

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import PlaidLink from './PlaidLink'
import { motion } from 'framer-motion'

const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();

  return (
    <motion.section
      className="sidebar"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2 transition-transform hover:scale-105">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="BankSync logo"
            className="size-[24px] max-xl:size-14"
          />
          <h1 className="sidebar-logo">BankSync</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

          return (
            <Link href={item.route} key={item.label}
              className={cn(
                'sidebar-link group transition-all duration-300 ease-in-out',
                { 'bg-bank-gradient': isActive }
              )}
            >
              <div className="relative size-6 transition-transform group-hover:scale-110">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({
                    'brightness-[3] invert-0': isActive,
                    'group-hover:brightness-[2] group-hover:invert-[0.2]': !isActive
                  })}
                />
              </div>
              <p className={cn(
                "sidebar-label transition-colors",
                {
                  "!text-white": isActive,
                  "group-hover:text-gray-700": !isActive
                }
              )}>
                {item.label}
              </p>
            </Link>
          )
        })}

        <div className="transition-all duration-300 ease-in-out hover:scale-105">
          <PlaidLink user={user} className="w-full group" />
        </div>
      </nav>

      <Footer user={user} />
    </motion.section>
  )
}

export default Sidebar