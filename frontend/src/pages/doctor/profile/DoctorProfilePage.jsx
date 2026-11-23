import DoctorProfileDetails from "../../../components/profile/DoctorProfileDetails";

export default function DoctorProfilePage() {
  return (
    <>
      <header className="page-head"><h1>Doctor profile</h1><p className="muted">Your account details and clinic presence.</p></header>
      <div className="stack"><DoctorProfileDetails /></div>
    </>
  );
}
