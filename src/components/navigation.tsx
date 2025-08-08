'use client';

import { Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TutorMarket
              </Link>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/search"
                className="text-gray-700 hover:text-blue-600 inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-lg hover:bg-blue-50"
              >
                Find Tutors
              </Link>
              {session?.user?.role === 'TUTOR' && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-purple-600 inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-lg hover:bg-purple-50"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/auth/register?role=TUTOR"
                className="text-gray-700 hover:text-green-600 inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-lg hover:bg-green-50"
              >
                Become a Tutor
              </Link>
              <Link
                href="/proposals"
                className="text-gray-700 hover:text-blue-600 inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-lg hover:bg-blue-50"
              >
                Proposals
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 