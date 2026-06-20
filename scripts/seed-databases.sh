#!/usr/bin/env bash
#
# Populates users_db and recommendation_db for local/dev environments.
#
# 1. Creates an admin user via the authentication_microservice CLI (inside its
#    running container).
# 2. Signs in through api_gateway to obtain a JWT.
# 3. Uses the JWT to create hardware/games/benchmarks via api_gateway's HTTP API.
#
# Requires: docker compose stack already running, curl, jq.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"
AUTH_SERVICE_NAME="${AUTH_SERVICE_NAME:-authentication_microservice}"

if [ -f .env ]; then
  API_GATEWAY_PORT="$(grep -E '^API_GATEWAY_PORT=' .env | tail -1 | cut -d= -f2)"
fi
API_GATEWAY_PORT="${API_GATEWAY_PORT:-3000}"
API_BASE="${API_BASE:-http://localhost:${API_GATEWAY_PORT}/api/v1}"

for bin in curl jq docker python3; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Missing required tool: $bin" >&2; exit 1; }
done

python3 -c "import pexpect" >/dev/null 2>&1 || { echo "Missing required python module: pexpect (pip install pexpect)" >&2; exit 1; }

log() { echo "==> $*"; }

sign_in() {
  curl -s -X POST "$API_BASE/auth/sign-in" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg email "$ADMIN_EMAIL" --arg password "$ADMIN_PASSWORD" '{email: $email, password: $password}')"
}

log "Trying to sign in as $ADMIN_EMAIL..."
SIGN_IN_RESPONSE="$(sign_in)"
TOKEN="$(echo "$SIGN_IN_RESPONSE" | jq -r '.token // empty')"

if [ -z "$TOKEN" ]; then
  log "Sign-in failed, creating admin user via CLI..."
  # The CLI reads the password from /dev/tty (via the `rpassword` crate), so it can't be
  # fed through a plain pipe -- it needs a real pseudo-terminal. `pexpect` provides one.
  python3 - "$AUTH_SERVICE_NAME" "$ADMIN_USERNAME" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" <<'PYEOF'
import sys
import pexpect

service, username, email, password = sys.argv[1:5]
child = pexpect.spawn(
    "docker",
    ["compose", "exec", service, "cli", "create-admin", "-u", username, "-e", email],
    timeout=30,
)
child.expect("Type admin password:")
child.sendline(password)
child.expect(pexpect.EOF)
print(child.before.decode(errors="replace"))
PYEOF

  log "Signing in as $ADMIN_EMAIL..."
  SIGN_IN_RESPONSE="$(sign_in)"
  TOKEN="$(echo "$SIGN_IN_RESPONSE" | jq -r '.token // empty')"
fi

if [ -z "$TOKEN" ]; then
  echo "Could not obtain JWT token. Response was: $SIGN_IN_RESPONSE" >&2
  exit 1
fi

USER_ID="$(echo "$TOKEN" | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null | jq -r '.sub // empty')"
if [ -z "$USER_ID" ]; then
  echo "Could not decode user id (sub) from JWT" >&2
  exit 1
fi

log "Authenticated as user_id=$USER_ID"

AUTH_HEADER="Authorization: Bearer $TOKEN"

post() {
  local path="$1" body="$2"
  curl -s -X POST "$API_BASE$path" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d "$body"
}

# Creates a resource, but if the API rejects it as a duplicate (already seeded by a
# previous run), looks it up instead so the script stays idempotent.
create_or_find() {
  local path="$1" body="$2" find_filter="$3"
  local id
  id="$(post "$path" "$body" | jq -r '.id // empty')"
  if [ -z "$id" ]; then
    id="$(curl -s "$API_BASE$path" | jq -r "$find_filter" | head -1)"
  fi
  echo "$id"
}

log "Creating CPUs..."
CPU1_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"13th","family":"Core i9","series":"13900K",
  "cores":24,"threads":32,"base_clock":3.0,"max_clock":5.8,"cache":36,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":253,
  "avg_price":589.99,"release_date":"2022-10-20T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="13900K") | .id')"

CPU2_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"5","family":"Ryzen","series":"5800X3D",
  "cores":8,"threads":16,"base_clock":3.4,"max_clock":4.5,"cache":96,
  "socket":"AM4","graphics":false,"oc":false,"recommended_power":105,
  "avg_price":349.99,"release_date":"2022-04-20T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="5800X3D") | .id')"

log "Creating GPUs..."
GPU1_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 4080",
  "memory_amount":16,"memory_gen":"GDDR6X","cores":9728,"pci_express":4,
  "recommended_power":750,"avg_price":1199.99,"release_date":"2022-11-16T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 4080") | .id')"

GPU2_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 7800 XT",
  "memory_amount":16,"memory_gen":"GDDR6","cores":3840,"pci_express":4,
  "recommended_power":700,"avg_price":499.99,"release_date":"2023-09-06T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 7800 XT") | .id')"

log "Creating RAM kits..."
RAM1_ID="$(create_or_find /hardware/rams '{
  "brand":"Corsair","ddr":"DDR5","memory_amount":32,"avg_price":129.99,
  "frequency_mhz":6000,"series":"Vengeance"
}' '.[] | select(.brand=="Corsair" and .series=="Vengeance") | .id')"

RAM2_ID="$(create_or_find /hardware/rams '{
  "brand":"Kingston","ddr":"DDR4","memory_amount":16,"avg_price":59.99,
  "frequency_mhz":3200,"series":"Fury Beast"
}' '.[] | select(.brand=="Kingston" and .series=="Fury Beast") | .id')"

log "Creating motherboards..."
create_or_find /hardware/motherboards '{
  "brand":"ASUS","series":"ROG STRIX Z790-E","socket":"LGA1700","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":7800,"m2_slots":5,
  "pci_express_x16":2,"vrm":20,"avg_price":499.99,"score":92
}' '.[] | select(.brand=="ASUS" and .series=="ROG STRIX Z790-E") | .id' >/dev/null

log "Creating PSUs..."
create_or_find /hardware/psus '{
  "brand":"Corsair","series":"RM850x","power_amount":850,"ranking":"Gold",
  "score":90,"eighty_plus_cert":true,"avg_price":139.99
}' '.[] | select(.brand=="Corsair" and .series=="RM850x") | .id' >/dev/null

log "Creating SSDs..."
create_or_find /hardware/ssds '{
  "brand":"Samsung","series":"990 Pro","amount":2000,"type":"NVMe",
  "reading":7450,"writing":6900,"avg_price":169.99,"score":95
}' '.[] | select(.brand=="Samsung" and .series=="990 Pro") | .id' >/dev/null

log "Creating games..."
GAME1_ID="$(create_or_find /games '{"name":"Cyberpunk 2077","necessary_disk":70}' \
  '.[] | select(.name=="Cyberpunk 2077") | .id')"
GAME2_ID="$(create_or_find /games '{"name":"Counter-Strike 2","necessary_disk":85}' \
  '.[] | select(.name=="Counter-Strike 2") | .id')"

log "Creating benchmarks..."
post /benchmarks "$(jq -n \
  --arg cpu "$CPU1_ID" --arg gpu "$GPU1_ID" --arg ram "$RAM1_ID" \
  --arg game "$GAME1_ID" --arg user "$USER_ID" \
  '{title:"Cyberpunk 2077 - 1440p Ultra", resolution:1440, graphics_quality:"ultra",
    cpu_id:$cpu, gpu_id:$gpu, ram_id:$ram, avg_fps:78, min_fps:55, max_fps:95,
    game_id:$game, user_id:$user, score:88}')" >/dev/null

post /benchmarks "$(jq -n \
  --arg cpu "$CPU2_ID" --arg gpu "$GPU2_ID" --arg ram "$RAM2_ID" \
  --arg game "$GAME2_ID" --arg user "$USER_ID" \
  '{title:"Counter-Strike 2 - 1080p High", resolution:1080, graphics_quality:"high",
    cpu_id:$cpu, gpu_id:$gpu, ram_id:$ram, avg_fps:240, min_fps:180, max_fps:300,
    game_id:$game, user_id:$user, score:95}')" >/dev/null

log "Done. Seeded admin user, hardware, games and benchmarks."
