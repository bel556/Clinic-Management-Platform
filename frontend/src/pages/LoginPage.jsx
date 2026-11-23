import { useNavigate } from 'react-router-dom'
import { ArrowRight, HeartPulse, Stethoscope, Users } from 'lucide-react'
import { useSession } from '../services/session'
import { CLINIC } from '../utils/constants'
import s from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { logIn, users } = useSession()

  const enter = (role) => {
    logIn()
    navigate(role === 'doctor' ? '/doctor/queue' : '/reception/patients')
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.brand}>
          <span className={s.brandMark}>
            <HeartPulse size={19} strokeWidth={2.3} />
          </span>
          <div>
            <div className={s.brandName}>CuraPulse</div>
            <div className={s.brandSub}>Clinic management system</div>
          </div>
        </div>

        <h1 className={s.title}>Sign in to your workspace</h1>
        <p className={s.subtitle}>
          {CLINIC.name} · {CLINIC.suite}. Choose the role you want to open in this sprint-1 demo.
        </p>

        <div className={s.roles}>
          <button type="button" className={s.role} onClick={() => enter('reception')}>
            <span className={s.roleIcon}>
              <Users size={18} />
            </span>
            <span className={s.roleBody}>
              <span className={s.roleTitle}>Reception</span>
              <span className={s.roleMeta}>{users.receptionist.name} · Front desk</span>
            </span>
            <ArrowRight size={15} className={s.roleArrow} />
          </button>

          <button type="button" className={s.role} onClick={() => enter('doctor')}>
            <span className={s.roleIcon}>
              <Stethoscope size={18} />
            </span>
            <span className={s.roleBody}>
              <span className={s.roleTitle}>Doctor</span>
              <span className={s.roleMeta}>{users.doctor.name} · Cardiology</span>
            </span>
            <ArrowRight size={15} className={s.roleArrow} />
          </button>
        </div>

        <p className={s.footer}>Demo build · mock data only · FastAPI connection pending</p>
      </div>
    </div>
  )
}
