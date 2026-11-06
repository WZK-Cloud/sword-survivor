export async function onRequest(context) {
    const { env } = context;
    const corsHeaders = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
    try {
        const { results } = await env.survivor_db.prepare("SELECT player_name, kill_count, time_seconds FROM scores ORDER BY kill_count DESC LIMIT 50").all();
        return new Response(JSON.stringify(results), { headers: corsHeaders });
    } catch (err) { 
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); 
    }
}
