export default {
  fetch: async (request, env) => {
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
