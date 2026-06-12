import sys
from pathlib import Path

faces = Path(sys.argv[1])
for player_id in sys.argv[2:]:
    print(player_id, (faces / f"{player_id}.png").exists())
