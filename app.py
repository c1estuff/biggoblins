from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/api/hiscores/<username>')
def get_hiscores(username):
    url = f'https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player={username}'
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Player not found'}), 404
        
    # OSRS returns data in this order
    skills = [
        'overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged',
        'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing',
        'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility',
        'thieving', 'slayer', 'farming', 'runecraft', 'hunter', 'construction'
    ]
    
    # Parse the CSV-like response
    lines = response.text.strip().split('\n')
    skills_data = {}
    
    for i, skill in enumerate(skills):
        if i < len(lines):
            rank, level, xp = map(int, lines[i].split(','))
            skills_data[skill] = {
                'rank': rank,
                'level': level,
                'experience': xp
            }
    
    return jsonify({
        'username': username,
        'skills': skills_data
    })

if __name__ == '__main__':
    app.run(debug=True) 