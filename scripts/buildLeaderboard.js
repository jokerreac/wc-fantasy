import supabase from "../config/supabase.js";

export async function buildLeaderboard() {
    const { data, error} = await supabase
        .from('players')
        .select(`
            *, teams (
            *, matches_home:matches!matches_home_team_fkey (
            *), matches_away:matches!matches_away_team_fkey (
            *))`)
    
    // console.dir(data[0].teams[0].matches_home);

    const players = data.map((player) => {
        
        const teamsWithRecords = player.teams.map((team) => {
            
            return {
                ...team,
                record : {
                    ...addSummaries(
                calculateSummary(team.matches_home, 'HOME_TEAM'),
                calculateSummary(team.matches_away, 'AWAY_TEAM')
            )
                }
            };

        })

        return {
            ...player,
            teams : teamsWithRecords,
            record : {
                wins : teamsWithRecords.reduce((sum, team) => sum + team.record.wins, 0),
                losses : teamsWithRecords.reduce((sum, team) => sum + team.record.losses, 0),
                draws: teamsWithRecords.reduce((sum, team) => sum + team.record.draws, 0),
                points : teamsWithRecords.reduce((sum, team) => sum + team.record.points, 0)
            }
        };

        
    })
        
    players.sort((a, b) => b.record.points - a.record.points);
    let playersRanked = []
    for (let i = 1; i <= players.length; i++) {
        playersRanked.push({...players[i-1], rank : i})
    }

    // console.dir(playersRanked);
    return playersRanked;
}

function calculateSummary(matches, side) {
    let summary = {
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0
    }
    for (const match of matches) {
        if (match.result === side) {
            summary.points+= 3;
            summary.wins += 1;
        }
        else if (match.result === 'DRAW') {
            summary.points += 1;
            summary.draws +=1;
        }
        else {
            summary.losses += 1;
        }
    };

    return summary;
}

function addSummaries (summary1, summary2) {
    return {
        wins : summary1.wins + summary2.wins,
        losses : summary1.losses + summary2.losses,
        draws : summary1.draws + summary2.draws,
        points : summary1.points + summary2.points
    };
}

    
buildLeaderboard();