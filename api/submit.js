export async function onRequest(context) {
    const { request, env } = context;
    const corsHeaders = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    try {
        const { name, kills, time } = await request.json();
        await env.survivor_db.prepare("INSERT INTO scores (player_name, kill_count, time_seconds) VALUES (?, ?, ?)").bind(name, kills, time).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (err) { 
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); 
    }
}
