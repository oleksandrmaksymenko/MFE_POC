import { Microservice } from '@/components/Microservice';

export const dynamic = 'force-dynamic';

export default function Page() {
  return <Microservice name="profile" props={{ userId: '42' }} />;
}
