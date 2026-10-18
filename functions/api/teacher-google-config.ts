import { handleTeacherGoogleConfig } from '../../server/teacher-accounts';
import type { Env } from '../../server/core';
export const onRequest: PagesFunction<Env> = ({ request, env }) => handleTeacherGoogleConfig(request, env);
