'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, User, LogOut, Settings, Bell, Gamepad2, BookOpen, BarChart3, Wallet, Mic, Menu, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/lib/auth-client';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

type NavbarProps = {
  user?: {
    name: string;
    email: string;
    image?: string;
    language: 'en' | 'hi';
  };
};

export function Navbar({ user }: NavbarProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(user?.language || 'en');
  const pathname = usePathname();

  const links = [
    { href: '/diversify-quest', label: 'Play', icon: Gamepad2 },
    { href: '/learn', label: 'Learn', icon: BookOpen },
    { href: '/learn/create-course', label: 'Create Course', icon: PlusCircle },
    // { href: '/portfolio', label: 'Portfolio', icon: Wallet },
    // { href: '/trade', label: 'Trade', icon: BarChart3 },
    // { href: '/voice', label: 'Voice Rooms', icon: Mic },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleLanguageChange = (newLanguage: 'en' | 'hi') => {
    setLanguage(newLanguage);
    // TODO: Implement language switching with next-intl
    console.log('Language changed to:', newLanguage);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-brand-600"
          >
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TM</span>
            </div>
            <span className="hidden sm:inline-block">TradeMentor</span>
          </Link>
        </div>

        {/* Center - Primary feature navigation */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ` +
                  (active
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-gray-700 hover:bg-gray-100')
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right side - mobile sheet and desktop controls */}
        {/* Mobile */}
        <div className="flex items-center space-x-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>TradeMentor</SheetTitle>
              </SheetHeader>
              <div className="px-2 py-2 space-y-4">
                <div>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full h-10 px-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  {links.map(({ href, label, icon: Icon }) => (
                    <SheetClose asChild key={href}>
                      <Link
                        href={href}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-base hover:bg-gray-100"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                {/* <div className="pt-2">
                  <SheetClose asChild>
                    <Button className="w-full" asChild>
                      <Link href="/diversify-quest">Start Game</Link>
                    </Button>
                  </SheetClose>
                </div> */}
                {/* {user ? (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </SheetClose>
                    <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link href="/sign-in">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="/sign-up">Sign up</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )} */}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Language Switcher */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-auto h-9 px-2">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
            </SelectContent>
          </Select>

          {/* CTA */}
          {/* <Button size="sm" asChild>
            <Link href="/diversify-quest">Start Game</Link>
          </Button> */}

          {user && (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                >
                  2
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* {!user && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )} */}
        </div>
      </div>
    </nav>
  );
}
