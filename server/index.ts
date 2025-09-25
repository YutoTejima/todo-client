export default {
  fetch: async (request, env) => {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }

    if (url.pathname === '/api/v1/tasks' && request.method === 'GET') {
      const list = await env.KV_TASKS.list();
      const tasks = [];
      for (const key of list.keys) {
        const task = await env.KV_TASKS.get(key.name, 'json');
        if (task) tasks.push(task);
      }
      return new Response(JSON.stringify(tasks), {
        headers: { 'content-type': 'application/json', ...cors() },
      });
    }

    return new Response(null, { status: 404, headers: cors() });
  },
} satisfies ExportedHandler<Env>;

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}
