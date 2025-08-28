from flask import Flask, jsonify, request
from espnfootball import FantasyLeague  # Ensure espnfootball.py is in the same directory

app = Flask(__name__)

@app.route('/api/league', methods=['GET'])
def get_league_data():
    league_id = request.args.get('league_id')
    year = request.args.get('year')
    espn_s2 = request.args.get('espn_s2')
    swid = request.args.get('swid')
    week = request.args.get('week', type=int)

    league = FantasyLeague(league_id, year, espn_s2, swid)
    data = league.get_league_data(week)
    return jsonify(data.to_dict(orient='records'))

@app.route('/api/matchup', methods=['GET'])
def get_matchup_data():
    league_id = request.args.get('league_id')
    year = request.args.get('year')
    espn_s2 = request.args.get('espn_s2')
    swid = request.args.get('swid')
    week = request.args.get('week', type=int)

    league = FantasyLeague(league_id, year, espn_s2, swid)
    data = league.get_matchup_data(week)
    
    return jsonify(data.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)