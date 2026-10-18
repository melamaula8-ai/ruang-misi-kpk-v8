import { handleTeacherAccountLogin } from '../../server/teacher-accounts';
import { handleTeacherAuth, type Env } from '../../server/core';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') return handleTeacherAuth(request, env);
  let body: { username?: unknown };
  try { body = await request.clone().json() as { username?: unknown }; }
  catch { return handleTeacherAuth(request, env); }

  const hasEnvironmentLogin = Boolean(
    env.TEACHER_USERNAME && (env.TEACHER_PASSWORD_HASH || env.TEACHER_PASSWORD) &&
    typeof body.username === 'string' && body.username.trim() === env.TEACHER_USERNAME.trim()
  );
  if (hasEnvironmentLogin) return handleTeacherAuth(request, env);
  return handleTeacherAccountLogin(request, env);
};
