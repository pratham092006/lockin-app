import { redirect } from 'next/navigation';

const HOME_REDIRECT = '/login';

export default function Page() {
  redirect(HOME_REDIRECT);
}
