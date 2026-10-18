import { handleGroupToken, type Env } from '../../server/core';

export const onRequest: PagesFunction<Env> = ({ request, env }) => handleGroupToken(request, env);
