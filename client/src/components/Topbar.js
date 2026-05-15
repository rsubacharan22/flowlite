import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Search,
  Settings,
  LogOut
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import axios from 'axios';

import { useNavigate } from 'react-router-dom';

import { clearSession } from '../utils/auth';
import { useAuth } from '../hooks/useAuth';


function Topbar({
  onSearchChange,
  searchPlaceholder = 'Search',
  searchValue = '',
  subtitle,
  title,
  user
}) {

  const navigate = useNavigate();

  const { role } = useAuth();

  const token =
    localStorage.getItem('token');


  // 🔹 DROPDOWNS
  const [notifOpen, setNotifOpen] =
    useState(false);

  const [avatarOpen, setAvatarOpen] =
    useState(false);


  // 🔹 REAL NOTIFICATIONS
  const [
    notifications,
    setNotifications
  ] = useState([]);


  const notifRef = useRef(null);

  const avatarRef = useRef(null);


  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {

    try {

      const res = await axios.get(
        'process.env.REACT_APP_API_URL/api/notifications',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(res.data);

    } catch (err) {

      console.log(
        'NOTIFICATION FETCH ERROR:',
        err
      );

    }
  };


  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {

    fetchNotifications();

  }, []);


  // =====================================================
  // COUNTS
  // =====================================================

  const unreadCount =
    notifications.filter(
      (n) => !n.read
    ).length;


  // =====================================================
  // INITIALS
  // =====================================================

  const initials = user?.name

    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    : 'FL';


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    clearSession();

    navigate('/', {
      replace: true
    });
  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeAll = () => {

    setNotifOpen(false);

    setAvatarOpen(false);
  };


  return (

    <>

      {/* ================================================= */}
      {/* BACKDROP */}
      {/* ================================================= */}

      {(notifOpen || avatarOpen) && (

        <div
          className="fixed inset-0 z-20"
          onClick={closeAll}
        />

      )}


      {/* ================================================= */}
      {/* TOPBAR */}
      {/* ================================================= */}

      <header
        className="
          sticky top-0 z-30
          border-b border-slate-200/80
          bg-white/90
          px-4 py-4
          backdrop-blur-xl
          sm:px-6
          lg:px-8
          xl:px-10
        "
      >

        <div
          className="
            mx-auto flex
            max-w-7xl
            items-center
            justify-between
            gap-4
          "
        >

          {/* ================================================= */}
          {/* TITLE */}
          {/* ================================================= */}

          <div className="min-w-0">

            <h1
              className="
                truncate
                text-xl
                font-bold
                tracking-tight
                text-slate-950
                sm:text-2xl
              "
            >
              {title}
            </h1>


            {subtitle && (

              <p
                className="
                  mt-0.5
                  max-w-xl
                  truncate
                  text-sm
                  text-slate-500
                "
              >
                {subtitle}
              </p>

            )}

          </div>


          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div
            className="
              flex shrink-0
              items-center
              gap-2
            "
          >

            {/* ================================================= */}
            {/* SEARCH */}
            {/* ================================================= */}

            {onSearchChange && (

              <div
                className="
                  relative hidden
                  lg:block
                "
              >

                <Search
                  className="
                    pointer-events-none
                    absolute left-3
                    top-1/2
                    h-4 w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input

                  aria-label="Search"

                  className="
                    field
                    w-56
                    pl-9
                    xl:w-72
                  "

                  onChange={(e) =>
                    onSearchChange(
                      e.target.value
                    )
                  }

                  placeholder={
                    searchPlaceholder
                  }

                  value={searchValue}

                />

              </div>

            )}


            {/* ================================================= */}
            {/* NOTIFICATIONS */}
            {/* ================================================= */}

            <div
              className="relative"
              ref={notifRef}
            >

              <button

                aria-label="Notifications"

                onClick={() => {

                  setNotifOpen(
                    (v) => !v
                  );

                  setAvatarOpen(false);

                }}

                className="
                  relative flex
                  h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  border border-slate-200
                  bg-white
                  text-slate-500
                  shadow-sm
                  transition
                  hover:border-blue-200
                  hover:text-blue-600
                "
              >

                <Bell className="h-4 w-4" />


                {unreadCount > 0 && (

                  <span
                    className="
                      absolute right-1.5
                      top-1.5
                      flex h-2 w-2
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-500
                      text-[8px]
                      font-bold
                      text-white
                      ring-2 ring-white
                    "
                  />

                )}

              </button>


              {/* ================================================= */}
              {/* DROPDOWN */}
              {/* ================================================= */}

              <AnimatePresence>

                {notifOpen && (

                  <motion.div

                    initial={{
                      opacity: 0,
                      y: 6,
                      scale: 0.97
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}

                    exit={{
                      opacity: 0,
                      y: 4,
                      scale: 0.97
                    }}

                    transition={{
                      duration: 0.15,
                      ease: 'easeOut'
                    }}

                    className="
                      absolute right-0
                      top-full z-50
                      mt-2 w-80
                      overflow-hidden
                      rounded-2xl
                      border border-slate-200
                      bg-white
                      shadow-xl
                      shadow-slate-200/60
                    "
                  >

                    {/* HEADER */}

                    <div
                      className="
                        border-b
                        border-slate-100
                        px-4 py-3
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          text-slate-900
                        "
                      >
                        Notifications
                      </p>


                      {unreadCount > 0 && (

                        <p
                          className="
                            text-xs
                            text-slate-400
                          "
                        >
                          {unreadCount} unread
                        </p>

                      )}

                    </div>


                    {/* LIST */}

                    <div
                      className="
                        max-h-[400px]
                        overflow-y-auto
                        divide-y
                        divide-slate-50
                      "
                    >

                      {notifications.length === 0 && (

                        <div
                          className="
                            px-4 py-8
                            text-center
                            text-sm
                            text-slate-400
                          "
                        >
                          No notifications
                        </div>

                      )}


                      {notifications.map((n) => (

                        <div

                          key={n._id}

                          className={[
                            `
                              flex items-start
                              gap-3
                              px-4 py-3
                            `,
                            !n.read
                              ? 'bg-blue-50/40'
                              : ''
                          ].join(' ')}

                        >

                          <span
                            className={[
                              `
                                mt-1
                                h-2 w-2
                                shrink-0
                                rounded-full
                              `,
                              !n.read
                                ? 'bg-blue-500'
                                : 'bg-slate-200'
                            ].join(' ')}
                          />


                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <p
                              className="
                                text-sm
                                leading-snug
                                text-slate-700
                              "
                            >
                              {n.message}
                            </p>


                            <p
                              className="
                                mt-0.5
                                text-xs
                                text-slate-400
                              "
                            >

                              {new Date(
                                n.createdAt
                              ).toLocaleString()}

                            </p>

                          </div>

                        </div>

                      ))}

                    </div>


                    {/* FOOTER */}

                    <div
                      className="
                        border-t
                        border-slate-100
                        px-4 py-2.5
                      "
                    >

                      <button
                        className="
                          text-xs
                          font-semibold
                          text-blue-600
                          hover:text-blue-700
                        "
                        onClick={() =>
                          setNotifOpen(false)
                        }
                      >
                        Mark all as read
                      </button>

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>

            </div>


            {/* ================================================= */}
            {/* AVATAR */}
            {/* ================================================= */}

            <div
              className="relative"
              ref={avatarRef}
            >

              <button

                aria-label="Account menu"

                onClick={() => {

                  setAvatarOpen(
                    (v) => !v
                  );

                  setNotifOpen(false);

                }}

                className="
                  flex h-9 w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-900
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-slate-700
                "
              >

                {initials}

              </button>


              <AnimatePresence>

                {avatarOpen && (

                  <motion.div

                    initial={{
                      opacity: 0,
                      y: 6,
                      scale: 0.97
                    }}

                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}

                    exit={{
                      opacity: 0,
                      y: 4,
                      scale: 0.97
                    }}

                    transition={{
                      duration: 0.15,
                      ease: 'easeOut'
                    }}

                    className="
                      absolute right-0
                      top-full z-50
                      mt-2 w-52
                      overflow-hidden
                      rounded-2xl
                      border border-slate-200
                      bg-white
                      shadow-xl
                      shadow-slate-200/60
                    "
                  >

                    <div
                      className="
                        border-b
                        border-slate-100
                        px-4 py-3
                      "
                    >

                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-slate-900
                        "
                      >
                        {user?.name || 'User'}
                      </p>


                      <p
                        className="
                          truncate
                          text-xs
                          text-slate-400
                        "
                      >
                        {user?.email || ''}
                      </p>

                    </div>


                    <div className="p-1.5">

                      <button

                        onClick={() => {

                          navigate('/profile');

                          closeAll();

                        }}

                        className="
                          flex w-full
                          items-center
                          gap-2.5
                          rounded-lg
                          px-3 py-2
                          text-sm
                          text-slate-700
                          transition
                          hover:bg-slate-50
                        "
                      >

                        <Settings
                          className="
                            h-4 w-4
                            text-slate-400
                          "
                        />

                        Profile Settings

                      </button>


                      <button

                        onClick={handleLogout}

                        className="
                          flex w-full
                          items-center
                          gap-2.5
                          rounded-lg
                          px-3 py-2
                          text-sm
                          text-rose-600
                          transition
                          hover:bg-rose-50
                        "
                      >

                        <LogOut className="h-4 w-4" />

                        Sign out

                      </button>

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* MOBILE SEARCH */}
        {/* ================================================= */}

        {onSearchChange && (

          <div
            className="
              mx-auto
              mt-3
              max-w-7xl
              lg:hidden
            "
          >

            <div className="relative">

              <Search
                className="
                  pointer-events-none
                  absolute left-3
                  top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input

                aria-label="Search"

                className="
                  field
                  pl-9
                "

                onChange={(e) =>
                  onSearchChange(
                    e.target.value
                  )
                }

                placeholder={
                  searchPlaceholder
                }

                value={searchValue}

              />

            </div>

          </div>

        )}

      </header>

    </>
  );
}

export default Topbar;