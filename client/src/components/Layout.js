import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PlusSquare,
  Settings,
  Users
} from 'lucide-react';
import logo from "../assets/logo.png";

import { motion } from 'framer-motion';

import { useEffect, useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import Badge from './Badge';
import SidebarItem from './SidebarItem';
import Topbar from './Topbar';

import { clearSession } from '../utils/auth';
import { pageTransition } from '../utils/motion';
import { useAuth } from '../hooks/useAuth';


function Layout({
  children,
  onSearchChange,
  searchPlaceholder,
  searchValue,
  subtitle,
  title = 'FlowLite OS'
}) {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    user,
    isEmployee,
    isApprover
  } = useAuth();


  // 🔹 AUTH CHECK
  useEffect(() => {

    const token =
      localStorage.getItem('token');

    if (!token || !user) {

      navigate('/', {
        replace: true
      });
    }

  }, [navigate, user]);


  // =====================================================
  // ROLE-BASED SIDEBAR
  // =====================================================

  const navItems = useMemo(() => {

    // 👤 EMPLOYEE
    if (isEmployee) {

      return [

        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard'
        },

        {
          label: 'My Requests',
          icon: ClipboardList,
          path: '/my-requests'
        },

        {
          label: 'Submit Request',
          icon: PlusSquare,
          path: '/create'
        }
      ];
    }


    // 🧑‍💼 APPROVER
    if (isApprover) {

      return [

        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard'
        },

        {
          label: 'Assign Task',
          icon: PlusSquare,
          path: '/create'
        },

        {
          label: 'Approvals',
          icon: ClipboardList,
          path: '/approvals'
        },

        {
          label: 'Team Analytics',
          icon: BarChart3,
          path: '/analytics'
        }
      ];
    }


    // 👑 ADMIN
    return [

      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard'
      },

      {
        label: 'Users',
        icon: Users,
        path: '/admin/api/users'
      }
    ];

  }, [isEmployee, isApprover]);


  // 🔹 LOGOUT
  const handleLogout = () => {

    clearSession();

    navigate('/', {
      replace: true
    });
  };


  // 🔹 INITIALS
  const initials = user?.name

    ? user.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    : 'FL';


  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const SidebarContent = () => (

    <>

      {/* 🔹 LOGO */}
      <button
        onClick={() => navigate('/dashboard')}
        className="
          flex items-center gap-3
          rounded-xl px-2 py-2
          text-left
          transition-all duration-200
          hover:bg-white/5
        "
      >

        <span
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-2xl
            bg-gradient-to-br
            from-blue-500
            to-cyan-400
            text-white
            shadow-lg
            shadow-blue-500/20
          "
        >

          <img
            src={logo}
            alt="FlowLite"
            className="h-8 w-8 object-contain"
          />

        </span>


        <span
          className="
            text-[17px]
            font-bold
            tracking-tight
            text-white
          "
        >
          FlowLite OS
        </span>

      </button>


      {/* 🔹 NAVIGATION */}
      <nav className="mt-8 space-y-1">

        {navItems.map((item) => (

          <SidebarItem

            key={item.path}

            active={
              location.pathname === item.path
            }

            icon={item.icon}

            label={item.label}

            onClick={() =>
              navigate(item.path)
            }
          />
        ))}

      </nav>


      {/* 🔹 SPACER */}
      <div className="flex-1" />


      {/* 🔹 PROFILE SECTION */}
      <div
        className="
          rounded-2xl
          border border-white/10
          bg-white/[0.03]
          p-3
          backdrop-blur-sm
        "
      >

        <div className="flex items-center gap-3">

          {/* AVATAR */}
          <div
            className="
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
              bg-gradient-to-br
              from-slate-600
              to-slate-700
              text-sm
              font-bold
              text-white
            "
          >
            {initials}
          </div>


          {/* USER INFO */}
          <div className="min-w-0 flex-1">

            <p
              className="
                truncate
                text-[13px]
                font-semibold
                text-white
              "
            >
              {user?.name || 'FlowLite User'}
            </p>

            <div className="mt-1">

              <Badge
                type="role"
                value={
                  user?.role || 'employee'
                }
                small
              />

            </div>

          </div>

        </div>


        {/* 🔹 PROFILE SETTINGS */}
        <button
          onClick={() =>
            navigate('/profile')
          }
          className="
            mt-3
            flex w-full items-center
            justify-center gap-2
            rounded-xl
            border border-white/10
            bg-white/5
            px-3 py-2
            text-xs font-semibold
            text-slate-400
            transition-all duration-200
            hover:bg-white/10
            hover:text-white
          "
        >

          <Settings className="h-3.5 w-3.5" />

          Profile Settings

        </button>


        {/* 🔹 LOGOUT */}
        <button
          onClick={handleLogout}
          className="
            mt-1.5
            flex w-full items-center
            justify-center gap-2
            rounded-xl
            px-3 py-2
            text-xs font-semibold
            text-slate-500
            transition-all duration-200
            hover:bg-white/5
            hover:text-slate-300
          "
        >

          <LogOut className="h-3.5 w-3.5" />

          Sign out

        </button>

      </div>

    </>
  );


  // =====================================================
  // MAIN LAYOUT
  // =====================================================

  return (

    <div className="min-h-screen bg-[#F8FAFC]">


      {/* ================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================================= */}

      <aside
        className="
          fixed left-0 top-0 z-40
          hidden h-screen w-64
          flex-col
          border-r border-white/6
          bg-[#0F172A]
          px-4 py-5
          text-white
          shadow-2xl
          shadow-slate-950/40
          backdrop-blur-xl
          lg:flex
        "
      >

        <SidebarContent />

      </aside>


      {/* ================================================= */}
      {/* MOBILE NAV */}
      {/* ================================================= */}

      <nav
        className="
          fixed bottom-0 left-0 right-0
          z-40
          flex
          border-t border-white/8
          bg-[#0F172A]/98
          px-2 py-2
          shadow-2xl
          backdrop-blur-xl
          lg:hidden
        "
      >

        {navItems.map(
          ({
            icon: Icon,
            label,
            path
          }) => {

            const active =
              location.pathname === path;

            return (

              <button

                key={path}

                onClick={() =>
                  navigate(path)
                }

                className={[
                  `
                    flex flex-1 flex-col
                    items-center gap-1
                    rounded-xl
                    px-2 py-2
                    text-[10px]
                    font-semibold
                    transition-all duration-200
                  `,
                  active
                    ? `
                      bg-blue-600/20
                      text-blue-400
                    `
                    : `
                      text-slate-500
                      hover:text-slate-300
                    `
                ].join(' ')}
              >

                <Icon
                  className={[
                    'h-4 w-4',
                    active
                      ? 'text-blue-400'
                      : ''
                  ].join(' ')}
                />

                <span className="hidden min-[380px]:block">
                  {label}
                </span>

              </button>
            );
          }
        )}


        {/* 🔹 LOGOUT */}
        <button
          onClick={handleLogout}
          className="
            flex flex-1 flex-col
            items-center gap-1
            rounded-xl
            px-2 py-2
            text-[10px]
            font-semibold
            text-slate-500
            transition-all duration-200
            hover:text-slate-300
          "
        >

          <LogOut className="h-4 w-4" />

          <span className="hidden min-[380px]:block">
            Sign out
          </span>

        </button>

      </nav>


      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div className="min-h-screen lg:ml-64">

        <Topbar

          onSearchChange={onSearchChange}

          searchPlaceholder={
            searchPlaceholder
          }

          searchValue={searchValue}

          subtitle={subtitle}

          title={title}

          user={user}

        />


        <motion.main

          key={location.pathname}

          initial={{
            opacity: 0,
            y: 8
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={pageTransition}

          className="
            px-4
            pb-28
            pt-2
            sm:px-6
            lg:px-8
            xl:px-10
          "
        >

          {children}

        </motion.main>

      </div>

    </div>
  );
}

export default Layout;