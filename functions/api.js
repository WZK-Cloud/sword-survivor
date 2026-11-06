export async function onRequest(context) {
    const { request, env } = context;
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);

    // 提交分数
    if (url.pathname === "/api/submit" && request.method === "POST") {
        try {
            const { name, kills, time } = await request.json();
            await env.survivor_db.prepare("INSERT INTO scores (player_name, kill_count, time_seconds) VALUES (?, ?, ?)").bind(name, kills, time).run();
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (err) { 
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); 
        }
    }

    // 获取排行榜
    if (url.pathname === "/api/leaderboard" && request.method === "GET") {
        try {
            const { results } = await env.survivor_db.prepare("SELECT player_name, kill_count, time_seconds FROM scores ORDER BY kill_count DESC LIMIT 50").all();
            return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (err) { 
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); 
        }
    }
    return new Response("Not Found", { status: 404, headers: corsHeaders });
}
