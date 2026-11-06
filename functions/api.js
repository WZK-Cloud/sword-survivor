export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // 获取路径
    let path = url.pathname;

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // 提交分数 (匹配 /api/submit)
    if (path === "/api/submit" && request.method === "POST") {
        try {
            const { name, kills, time } = await request.json();
            await env.survivor_db.prepare("INSERT INTO scores (player_name, kill_count, time_seconds) VALUES (?, ?, ?)").bind(name, kills, time).run();
            return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (err) { 
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); 
        }
    }

    // 获取排行榜 (匹配 /api/leaderboard)
    if (path === "/api/leaderboard" && request.method === "GET") {
        try {
            const { results } = await env.survivor_db.prepare("SELECT player_name, kill_count, time_seconds FROM scores ORDER BY kill_count DESC LIMIT 50").all();
            return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (err) { 
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); 
        }
    }
    
    // 如果不是 API 请求，返回前端页面
    return context.next();
}
