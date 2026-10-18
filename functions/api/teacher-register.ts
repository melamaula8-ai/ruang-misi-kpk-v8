import { handleTeacherRegister } from '../../server/teacher-accounts';
import type { Env } from '../../server/core';
export const onRequest: PagesFunction<Env> = ({ request, env }) => handleTeacherRegister(request, env);
