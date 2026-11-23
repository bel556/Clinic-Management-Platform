import { Outlet } from 'react-router-dom'
import { Sidebar, Topbar, layoutStyles as s } from '../components/layout'
import { DOCTOR_NAV } from '../utils/constants'
import { useSession } from '../services/session'

export default function DoctorLayout() {
  const { users } = useSession()

  return (
    <div className={s.shell}>
      <Sidebar
        nav={DOCTOR_NAV}
        roleLabel="Doctor"
        switchTo="/reception/patients"
        switchLabel="Switch to reception view"
      />
      <div className={s.main}>
        <Topbar user={users.doctor} showBell={false} />
        <main className={s.content}>
          <div className={s.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
