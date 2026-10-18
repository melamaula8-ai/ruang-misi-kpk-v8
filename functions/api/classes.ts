import { handleClasses, type Env } from '../../server/core';

export const onRequest: PagesFunction<Env> = ({ request, env }) => handleClasses(request, env);
