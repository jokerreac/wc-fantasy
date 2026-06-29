import { FOOTBALL_API_KEY } from "../config/env.js";
import supabase from "../config/supabase.js";

async function getTeams() {
  const response = await fetch(
    "https://api.football-data.org/v4/competitions/WC/teams?season=2026",
    {
      headers: {
        "X-Auth-Token": FOOTBALL_API_KEY
      }
    }
  );

  let data = await response.json();
  data = data.teams.map((team) => {
    return {
      id : team.id,
      name : team.name,
      crest : team.crest
    }
  })

  //console.log(data);
  return data;
}


async function upsertTeams() {
  const teams = await getTeams()
  const { data, error } = await supabase
    .from('teams')
    .upsert(teams, { onConflict : 'id' })
    .select()

  console.log(`Upserted ${teams.length} teams`)
}

upsertTeams();