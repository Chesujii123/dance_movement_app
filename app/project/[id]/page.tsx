import ProjectPage from '@/components/ProjectPage';

export default function Page({ params }: { params: { id: string } }) {
  return <ProjectPage projectId={params.id} />;
}
