import ProjectForm from '../../../../components/admin/ProjectForm';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Projects / New</span>
          <h1 className="a-title">New project</h1>
        </div>
      </div>
      <ProjectForm />
    </>
  );
}
