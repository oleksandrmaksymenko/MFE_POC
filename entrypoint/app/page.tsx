import { Microservice } from '@/components/Microservice';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user = '42' } = await searchParams;
  return (
    <>
      <Microservice name="billing" props={{ userId: user }} />
      <Microservice name="profile" props={{ userId: user }} />
      <Microservice name="missing" />
    </>
  );
}
