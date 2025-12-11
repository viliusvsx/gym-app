import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as exercisesIndex } from '@/routes/exercises';
import { index as habitsIndex } from '@/routes/habits';
import { index as messagesIndex } from '@/routes/messages';
import { index as metricsIndex } from '@/routes/metrics';
import { index as programsIndex } from '@/routes/programs';
import { scheduleIndex } from '@/lib/schedule-routes';
import { index as workoutsIndex } from '@/routes/workouts';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    CalendarClock,
    CheckCircle2,
    Dumbbell,
    Folder,
    LayoutGrid,
    ListChecks,
    MessageSquare,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Workouts',
        href: workoutsIndex(),
        icon: Dumbbell,
    },
    {
        title: 'Messages',
        href: messagesIndex(),
        icon: MessageSquare,
    },
    {
        title: 'Programs',
        href: programsIndex(),
        icon: CalendarClock,
    },
    {
        title: 'Schedule',
        href: scheduleIndex(),
        icon: CalendarClock,
    },
    {
        title: 'Habits',
        href: habitsIndex(),
        icon: CheckCircle2,
    },
    {
        title: 'Exercises',
        href: exercisesIndex(),
        icon: ListChecks,
    },
    {
        title: 'Metrics',
        href: metricsIndex(),
        icon: Activity,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
