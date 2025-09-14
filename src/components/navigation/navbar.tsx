'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, User, LogOut, Settings, Bell, Gamepad2, BookOpen, BarChart3, Wallet, Mic, Menu, PlusCircle } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

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
import { useLocale } from 'next-intl';
import { setLocaleCookie } from '@/lib/i18n/actions';

type NavbarProps = {
  user?: {
    name: string;
    email: string;
    image?: string;
    language: 'en' | 'hi';
  };
};

export function Navbar({ user }: NavbarProps) {
  const locale = useLocale();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'hi'>((locale as 'en' | 'hi') || (user?.language || 'en'));
  const [langSelectOpen, setLangSelectOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/diversify-quest', label: 'Play Diversify Quest', icon: Gamepad2 },
    { href: '/learn', label: 'Academy', icon: BookOpen },
    { href: '/learn/create-course', label: 'Create Course', icon: PlusCircle },
    // { href: '/portfolio', label: 'Portfolio', icon: Wallet },
    // { href: '/trade', label: 'Trade', icon: BarChart3 },
    // { href: '/voice', label: 'Voice Rooms', icon: Mic },
  ];

  // Brief summaries for hover previews on nav items
  const navDescriptions: Record<string, string> = {
    '/diversify-quest':
      'Play an interactive quest to learn diversification with real-world scenarios and instant feedback.',
    '/learn':
      'Explore bite-sized modules, guides, and videos. Track progress and master key investing concepts.',
    '/learn/create-course':
      'Create and publish your own learning journeys using our authoring tools and templates.',
  };

  // Exact active state logic so Academy doesn't activate on Create Course
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/learn') return pathname === '/learn';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Distinctive color variants for each section (inactive state)
  const colorVariants: Record<string, { inactive: string; active: string }> = {
    '/diversify-quest': {
      inactive:
        'bg-sky-50/70 dark:bg-sky-900/30 text-sky-800 dark:text-sky-100 ring-1 ring-sky-200/60 hover:bg-sky-100/70 dark:hover:bg-sky-800/50',
      active: 'from-sky-600 to-cyan-600',
    },
    '/learn': {
      inactive:
        'bg-emerald-50/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 ring-1 ring-emerald-200/60 hover:bg-emerald-100/70 dark:hover:bg-emerald-800/50',
      active: 'from-emerald-600 to-lime-600',
    },
    '/learn/create-course': {
      inactive:
        'bg-violet-50/70 dark:bg-violet-900/30 text-violet-800 dark:text-violet-100 ring-1 ring-violet-200/60 hover:bg-violet-100/70 dark:hover:bg-violet-800/50',
      active: 'from-violet-600 to-fuchsia-600',
    },
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: 'en' | 'hi') => {
    setLanguage(newLanguage);
    await setLocaleCookie(newLanguage);
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-0 bg-gradient-to-b from-white/30 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/0 shadow-md ring-1 ring-white/20">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-brand-600"
          >
            {/* Logo image */}
            <div className="h-12 sm:h-14 flex items-center justify-center">
              <Image
                src="/logo.jpeg"
                alt="TradeMentor logo"
                width={480}
                height={96}
                className="block h-10 sm:h-12 w-auto"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center - Primary feature navigation */}
        <div className="hidden md:flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-1 justify-center md:overflow-x-auto overscroll-contain">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            const variant = colorVariants[href] ?? {
              inactive:
                'bg-white/40 dark:bg-white/10 text-gray-800 dark:text-gray-100 ring-1 ring-white/30 hover:bg-white/60 hover:shadow-md',
              active: 'from-brand-600 to-cyan-600',
            };
            return (
              <HoverCard key={href} openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Link
                    href={href}
                    className={
                      `group relative inline-flex items-center gap-2 px-2.5 md:px-3 lg:px-4 py-0 lg:py-1.5 h-8 md:h-9 lg:h-10 whitespace-nowrap leading-none rounded-full text-[12px] md:text-[13px] lg:text-sm font-semibold transition-all ` +
                      (active
                        ? `bg-gradient-to-r ${variant.active} text-white shadow-lg shadow-black/10 scale-[1.005]`
                        : `${variant.inactive}`)
                    }
                  >
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span>{label}</span>
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent side="bottom" align="center" className="w-80">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 opacity-80" />
                    <div>
                      <div className="text-sm font-semibold leading-none mb-1">{label}</div>
                      <p className="text-sm text-muted-foreground leading-snug">{navDescriptions[href]}</p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
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
                  {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname?.startsWith(href);
                    const variant = colorVariants[href] ?? {
                      inactive:
                        'bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-100 ring-1 ring-white/30 hover:bg-white/70',
                      active: 'from-brand-600 to-cyan-600',
                    };
                    return (
                      <SheetClose asChild key={href}>
                        <Link
                          href={href}
                          className={
                            `flex items-center gap-2 rounded-full px-3 py-2 text-base transition-all ` +
                            (active
                              ? `bg-gradient-to-r ${variant.active} text-white`
                              : `${variant.inactive}`)
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
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
        <div className="hidden md:flex items-center space-x-2 ml-auto">
          {/* Language Switcher */}
          <HoverCard openDelay={200} closeDelay={0} open={langSelectOpen ? false : undefined}>
            <HoverCardTrigger asChild>
              <div>
                <Select value={language} onValueChange={handleLanguageChange} onOpenChange={setLangSelectOpen}>
                  <SelectTrigger className="h-9 md:h-10 px-3 pr-2 rounded-full bg-white/70 dark:bg-white/10 text-gray-800 dark:text-gray-100 ring-2 ring-brand-500/30 hover:ring-brand-500/60 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 relative overflow-visible">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <SelectValue />
                      <span className="ml-1 text-[10px] font-bold rounded px-1.5 py-0.5 border bg-brand-500/10 border-brand-500/30 text-brand-700 dark:text-brand-300">A/अ</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="bottom" align="end" className="w-72 z-40">
              <div className="text-sm">
                <div className="font-semibold mb-1">Language</div>
                <p className="text-muted-foreground">Switch your preferred language. The entire app adapts instantly to English or हिंदी.</p>
              </div>
            </HoverCardContent>
          </HoverCard>

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
