import { handleTeacherGoogleLogin } from '../../server/teacher-accounts';
import type { Env } from '../../server/core';
export const onRequest: PagesFunction<Env> = ({ request, env }) => handleTeacherGoogleLogin(request, env);
