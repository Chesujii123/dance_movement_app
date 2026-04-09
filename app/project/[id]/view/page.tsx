import ViewPage from '@/components/ViewPage';

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { share?: string };
}) {
  return <ViewPage projectId={params.id} shareId={searchParams.share} />;
}
