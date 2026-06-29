import { FOOTBALL_API_KEY } from "../config/env.js";
import supabase from "../config/supabase.js";

export async function syncMatches() {
    const response = await fetch(
        'https://api.football-data.org/v4/competitions/WC/matches?season=2026&status=FINISHED', {
            headers : {
                "X-Auth-Token": FOOTBALL_API_KEY
            }
        }
    );
    
    let res = await response.json();
    res = res.matches.map((match) => {
        return {
            id : match.id,
            stage : match.stage,
            home_team : match.homeTeam.id,
            away_team : match.awayTeam.id,
            result : match.score.winner
        };
    });

    const { data, error } = await supabase
        .from('matches')
        .upsert(res, { onConflict : 'id'})
        .select()

    // console.log(`Upserted ${data.length} matches`)
}

syncMatches();