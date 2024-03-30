import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { useUserStore } from "../store/user";

const userNavigation = [
  { name: "Your Profile", href: "/profile" },
  { name: "Settings", href: "/settings" },
];

export default function Layout() {
  const { user, setUser } = useUserStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login", { replace: true });
    return <></>;
  }

  const logout = () => {
    setUser(null);
  };

  return (
    <NextUIProvider navigate={navigate}>
      <div className="min-h-full">
        <div className="bg-indigo-600 pb-32">
          <Disclosure
            as="nav"
            className="border-b border-indigo-300 border-opacity-25 bg-indigo-600 lg:border-none"
          >
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                  <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400 lg:border-opacity-25">
                    <div className="flex items-center px-2 lg:px-0">
                      <Link
                        to="/"
                        unstable_viewTransition
                        className="flex-shrink-0"
                      >
                        <img
                          className="block size-8"
                          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=300"
                          alt="Tasklab"
                        />
                      </Link>
                    </div>
                    <div className="flex lg:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block size-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block size-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                    <div className="hidden lg:ml-4 lg:block">
                      <div className="flex items-center">
                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3 flex-shrink-0">
                          <div>
                            <Menu.Button className="relative flex rounded-full bg-indigo-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                              <span className="absolute -inset-1.5" />
                              <span className="sr-only">Open user menu</span>
                              <UserCircleIcon className="size-8 rounded-full" />
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {userNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  <NavLink
                                    to={item.href}
                                    className={({ isActive }) => {
                                      let className =
                                        "block px-4 py-2 text-sm text-gray-700 ";
                                      if (isActive) {
                                        className += "bg-gray-100";
                                      }
                                      return className;
                                    }}
                                  >
                                    {item.name}
                                  </NavLink>
                                </Menu.Item>
                              ))}
                              <Menu.Item>
                                <p
                                  role="button"
                                  onClick={logout}
                                  className="block px-4 py-2 text-sm text-gray-700"
                                >
                                  Logout
                                </p>
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel className="lg:hidden">
                  <div className="border-t border-indigo-700 pb-3 pt-4">
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="size-10 rounded-full" />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm font-medium text-indigo-300">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as="a"
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                      <Disclosure.Button
                        onClick={logout}
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                      >
                        Logout
                      </Disclosure.Button>
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <header className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {pathname === "/" && "Tasks"}
              </h1>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </NextUIProvider>
  );
}
