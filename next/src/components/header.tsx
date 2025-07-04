'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LiaHotelSolid } from "react-icons/lia"
import { MdOutlineFlight, MdManageAccounts } from "react-icons/md"
import { IoMdHappy } from "react-icons/io"
import { GiMountainRoad } from "react-icons/gi"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = !!user

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser({ name: parsed?.name || 'Profile' })
      }
    } catch (err) {
      console.error('Invalid user in localStorage:', err)
      setUser(null)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
    router.push('/')
  }, [router])

  const handleDropdown = (state: boolean) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    if (state) {
      setShowDropdown(true)
    } else {
      dropdownTimeout.current = setTimeout(() => setShowDropdown(false), 200)
    }
  }

  const navLinks = [
    { label: 'Hotels', href: '/hotels', external: true, icon: <LiaHotelSolid /> },
    { label: 'Flights', href: 'https://tripbazaar.travel', external: true, icon: <MdOutlineFlight /> },
    { label: 'Vacations', href: 'https://holidayz.tripbazaar.in/', external: true, icon: <GiMountainRoad /> },
    { label: 'Holidays', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
    { label: 'Cruise', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
    { label: 'Cabs', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
    { label: 'Buses', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
    { label: 'Visa', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
    { label: 'Travel Insurance', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
    { label: 'Forex', href: 'https://holidays.tripbazaar.in', external: true, icon: <IoMdHappy /> },
  ]

  const getTruncatedLabel = (label: string) =>
    label.length > 7 ? label.slice(0, 7) + '...' : label

  const renderLink = (link: typeof navLinks[0]) => {
    const isActive = !link.external && pathname === link.href
    const baseClasses = `flex-shrink-0 text-base px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-2`
    const activeClass = isActive ? 'bg-red-100 text-red-600' : 'text-gray-700 hover:text-red-500 hover:bg-red-50'

    return link.external ? (
      <a
        key={link.label}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${activeClass}`}
      >
        {link.icon}
        <span className="whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis inline-block align-middle">
          {getTruncatedLabel(link.label)}
        </span>
      </a>
    ) : (
      <Link key={link.label} href={link.href} className={`${baseClasses} ${activeClass}`}>
        {link.icon}
        <span className="whitespace-nowrap max-w-[90px] overflow-hidden text-ellipsis inline-block align-middle">
          {getTruncatedLabel(link.label)}
        </span>
      </Link>
    )
  }

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white px-2 border-b border-gray-200 shadow-sm z-50 sticky top-0 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto py-3 md:py-4">
        {/* Logo - Made flex-shrink-0 to prevent shrinking */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex gap-4 group items-center" style={{ height: 50 }}>
            <Image
              src="/images/logo.png"
              alt="tripbazaar"
              width={120}
              height={40}
              priority
              className="object-contain bg-white"
            />
          </Link>
        </div>

        {/* Navigation - Improved responsive behavior */}
        <div className="hidden md:flex items-center flex-1 min-w-0 ml-4">
          {/* Scrollable nav links container */}
          <div
            ref={navContainerRef}
            className="flex items-center overflow-x-auto scrollbar-hide space-x-1 px-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {navLinks.map(renderLink)}
          </div>

          {/* User Dropdown - Moved outside scrollable area */}
          <div className="flex-shrink-0 ml-2">
            {!isLoggedIn ? (
              <div
                className="relative inline-block"
                onMouseEnter={() => handleDropdown(true)}
                onMouseLeave={() => handleDropdown(false)}
              >
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-all ease-in-out duration-200"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  <MdManageAccounts className="text-xl" />
                  <span>Account</span>
                </button>
                <div
                  className={`absolute bg-white shadow-md rounded-lg border border-gray-200 transition-all ease-in-out duration-300 transform ${showDropdown ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  style={{
                    top: '100%',
                    right: '0',
                    minWidth: '12rem',
                  }}
                >
                  <div className="py-2">
                    <Link
                      href="/user/login"
                      className="block px-5 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all ease-in-out duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/user/sign-up"
                      className="block px-5 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all ease-in-out duration-200"
                    >
                      Signup
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative inline-block"
                onMouseEnter={() => handleDropdown(true)}
                onMouseLeave={() => handleDropdown(false)}
              >
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-all ease-in-out duration-200"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>Hi! {user.name}</span>
                </button>
                <div
                  className={`absolute bg-white shadow-md rounded-lg border border-gray-200 transition-all ease-in-out duration-300 transform ${showDropdown ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  style={{
                    top: '100%',
                    right: '0',
                    minWidth: '12rem',
                  }}
                >
                  <div className="py-2">
                    <Link
                      href="/user/account/manage"
                      className="block px-5 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all ease-in-out duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/user/account/profile"
                      className="block px-5 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all ease-in-out duration-200"
                    >
                      Profile
                    </Link>
                    <div className="border-t my-2"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-all ease-in-out duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          &#9776;
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-6 space-y-4">
          {isLoggedIn && (
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800 mt-2">
              <span className="inline-flex items-center justify-center w-7 h-7 bg-red-100 text-red-600 rounded-full font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
              Hi! {user.name}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-red-50 hover:text-red-500 rounded-lg"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t pt-4 text-sm font-medium text-gray-800 space-y-2">
            {!isLoggedIn ? (
              <>
                <Link href="/user/login" className="block px-3 py-2 hover:bg-red-50 hover:text-red-500 rounded-lg">Login</Link>
                <Link href="/user/sign-up" className="block px-3 py-2 hover:bg-red-50 hover:text-red-500 rounded-lg">Signup</Link>
              </>
            ) : (
              <>
                <Link href="/user/account/manage" className="block px-3 py-2 hover:bg-red-50 hover:text-red-500 rounded-lg">Dashboard</Link>
                <Link href="/user/account/profile" className="block px-3 py-2 hover:bg-red-50 hover:text-red-500 rounded-lg">Profile</Link>
                <button onClick={logout} className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-500 rounded-lg">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}