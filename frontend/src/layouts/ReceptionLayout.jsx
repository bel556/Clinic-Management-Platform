import { Outlet } from 'react-router-dom'
import { Sidebar, Topbar, layoutStyles as s } from '../components/layout'
import { RECEPTION_NAV } from '../utils/constants'
import { useSession } from '../services/session'

export default function ReceptionLayout() {
  const { users } = useSession()

  return (
    <div className={s.shell}>
      <Sidebar
        nav={RECEPTION_NAV}
        roleLabel="Reception"
        switchTo="/doctor/queue"
        switchLabel="Switch to doctor view"
      />
      <div className={s.main}>
        <Topbar user={users.receptionist} bellTo="/reception/notifications" />
        <main className={s.content}>
          <div className={s.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
