import { notFound } from 'next/navigation';
import ProjectForm from '../../../../components/admin/ProjectForm';
import DeleteProjectButton from '../../../../components/admin/DeleteProjectButton';
import { getProjectById } from '../../../../lib/queries';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProjectById(id);
  if (!data) notFound();

  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Projects / Edit</span>
          <h1 className="a-title">{data.project.title}</h1>
        </div>
        <div className="a-topbar-actions">
          <DeleteProjectButton id={data.project.id} title={data.project.title} />
        </div>
      </div>
      <ProjectForm project={data.project} images={data.images} />
    </>
  );
}
