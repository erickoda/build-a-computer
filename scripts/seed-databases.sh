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
  API_GATEWAY_PORT="$(grep -E '^API_GATEWAY_PORT=' .env | tail -1 | cut -d= -f2 | tr -d '[:space:]')"
fi
API_GATEWAY_PORT="${API_GATEWAY_PORT:-3000}"
API_BASE="${API_BASE:-http://localhost:${API_GATEWAY_PORT}/api/v1}"

MISSING=0

check_bin() {
  local bin="$1" hint="$2"
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing required tool: $bin ($hint)" >&2
    MISSING=1
  fi
}

check_bin curl "e.g. sudo pacman -S curl / apt install curl"
check_bin jq "e.g. sudo pacman -S jq / apt install jq"
check_bin docker "e.g. sudo pacman -S docker / apt install docker.io"
check_bin python3 "e.g. sudo pacman -S python / apt install python3"

if command -v docker >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
  echo "Missing required tool: docker compose plugin (e.g. sudo pacman -S docker-compose / apt install docker-compose-plugin)" >&2
  MISSING=1
fi

if command -v python3 >/dev/null 2>&1 && ! python3 -c "import pexpect" >/dev/null 2>&1; then
  echo "Missing required python module: pexpect (pip install pexpect)" >&2
  MISSING=1
fi

[ "$MISSING" -eq 0 ] || exit 1

log() { echo "==> $*"; }
err() { echo "!!! $*" >&2; }

wait_for_gateway() {
  local attempts="${GATEWAY_WAIT_ATTEMPTS:-30}"
  local delay="${GATEWAY_WAIT_DELAY:-2}"
  local i
  log "Waiting for api_gateway at $API_BASE ..."
  for ((i = 1; i <= attempts; i++)); do
    if curl -s -o /dev/null --connect-timeout 2 "$API_BASE/auth/sign-in" \
         -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null; then
      log "api_gateway is reachable."
      return 0
    fi
    sleep "$delay"
  done
  err "api_gateway never became reachable at $API_BASE after $((attempts * delay))s."
  err "Check that the stack is up and the port is correct:"
  err "  docker compose ps"
  err "  docker compose logs --tail=50 api_gateway"
  err "  grep API_GATEWAY_PORT .env"
  return 1
}

sign_in() {
  curl -fsS -X POST "$API_BASE/auth/sign-in" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg email "$ADMIN_EMAIL" --arg password "$ADMIN_PASSWORD" '{email: $email, password: $password}')" \
    2>/dev/null || true
}

wait_for_gateway

log "Trying to sign in as $ADMIN_EMAIL..."
SIGN_IN_RESPONSE="$(sign_in)"
TOKEN="$(echo "$SIGN_IN_RESPONSE" | jq -r '.token // empty' 2>/dev/null || true)"

if [ -z "$TOKEN" ]; then
  log "Sign-in failed, creating admin user via CLI..."
  python3 - "$AUTH_SERVICE_NAME" "$ADMIN_USERNAME" "$ADMIN_EMAIL" "$ADMIN_PASSWORD" <<'PYEOF'
import sys
import pexpect

service, username, email, password = sys.argv[1:5]
# `-t` forces docker to allocate a TTY inside the container. The CLI reads the
# password from /dev/tty (via the `rpassword` crate); without a container TTY that
# open fails with ENXIO ("No such device or address"). pexpect supplies the PTY on
# the host side, and `-t` extends it through docker into the container.
child = pexpect.spawn(
    "docker",
    ["compose", "exec", "-t", service, "cli", "create-admin", "-u", username, "-e", email],
    timeout=30,
    encoding="utf-8",
)

# With a TTY attached the terminal echoes our input, so the prompt match must also
# tolerate carriage returns in the stream.
i = child.expect([r"(?i)password.*[:>]\s*", pexpect.EOF, pexpect.TIMEOUT])
if i == 0:
    child.sendline(password)
    child.expect(pexpect.EOF)
    print(child.before)
else:
    print("Did not get the expected password prompt. CLI output was:", file=sys.stderr)
    print(child.before or "<no output>", file=sys.stderr)
    sys.exit(1)
PYEOF

  log "Signing in as $ADMIN_EMAIL..."
  SIGN_IN_RESPONSE="$(sign_in)"
  TOKEN="$(echo "$SIGN_IN_RESPONSE" | jq -r '.token // empty' 2>/dev/null || true)"
fi

if [ -z "$TOKEN" ]; then
  err "Could not obtain JWT token. Response was: ${SIGN_IN_RESPONSE:-<empty>}"
  exit 1
fi

USER_ID="$(echo "$TOKEN" | cut -d. -f2 | tr '_-' '/+' | base64 -d 2>/dev/null | jq -r '.sub // empty')"
if [ -z "$USER_ID" ]; then
  err "Could not decode user id (sub) from JWT"
  exit 1
fi

log "Authenticated as user_id=$USER_ID"

AUTH_HEADER="Authorization: Bearer $TOKEN"

post() {
  local path="$1" body="$2"
  # REMOVED: 2>/dev/null || true
  curl -fsS -X POST "$API_BASE$path" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d "$body"
}

create_or_find() {
  local path="$1" body="$2" find_filter="$3"
  local id
  # REMOVED silencing filters here too
  id="$(post "$path" "$body" | jq -r '.id // empty' 2>/dev/null || true)"
  if [ -z "$id" ]; then
    id="$(curl -fsS "$API_BASE$path" | jq -r "$find_filter" 2>/dev/null || true)"
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

CPU3_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"7","family":"Ryzen","series":"7800X3D",
  "cores":8,"threads":16,"base_clock":4.2,"max_clock":5.0,"cache":104,
  "socket":"AM5","graphics":true,"oc":true,"recommended_power":120,
  "avg_price":399.99,"release_date":"2023-04-06T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="7800X3D") | .id')"

CPU4_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"12th","family":"Core i5","series":"12400F",
  "cores":6,"threads":12,"base_clock":2.5,"max_clock":4.4,"cache":18,
  "socket":"LGA1700","graphics":false,"oc":false,"recommended_power":117,
  "avg_price":169.99,"release_date":"2022-01-04T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="12400F") | .id')"

CPU5_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"14th","family":"Core i9","series":"14900K",
  "cores":24,"threads":32,"base_clock":3.2,"max_clock":6.0,"cache":36,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":253,
  "avg_price":589.99,"release_date":"2023-10-17T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="14900K") | .id')"

CPU6_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"14th","family":"Core i7","series":"14700K",
  "cores":20,"threads":28,"base_clock":3.4,"max_clock":5.6,"cache":33,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":253,
  "avg_price":409.99,"release_date":"2023-10-17T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="14700K") | .id')"

CPU7_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"14th","family":"Core i5","series":"14600K",
  "cores":14,"threads":20,"base_clock":3.5,"max_clock":5.3,"cache":24,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":181,
  "avg_price":319.99,"release_date":"2023-10-17T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="14600K") | .id')"

CPU8_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"13th","family":"Core i7","series":"13700K",
  "cores":16,"threads":24,"base_clock":3.4,"max_clock":5.4,"cache":30,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":253,
  "avg_price":409.99,"release_date":"2022-10-20T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="13700K") | .id')"

CPU9_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"13th","family":"Core i5","series":"13600K",
  "cores":14,"threads":20,"base_clock":3.5,"max_clock":5.1,"cache":24,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":181,
  "avg_price":319.99,"release_date":"2022-10-20T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="13600K") | .id')"

CPU10_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"12th","family":"Core i3","series":"12100F",
  "cores":4,"threads":8,"base_clock":3.3,"max_clock":4.3,"cache":12,
  "socket":"LGA1700","graphics":false,"oc":false,"recommended_power":89,
  "avg_price":109.99,"release_date":"2022-01-04T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="12100F") | .id')"

CPU11_ID="$(create_or_find /hardware/cpus '{
  "brand":"Intel","gen":"12th","family":"Core i9","series":"12900K",
  "cores":16,"threads":24,"base_clock":3.2,"max_clock":5.2,"cache":30,
  "socket":"LGA1700","graphics":true,"oc":true,"recommended_power":241,
  "avg_price":589.99,"release_date":"2021-11-04T00:00:00Z"
}' '.[] | select(.brand=="Intel" and .series=="12900K") | .id')"

CPU12_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"7","family":"Ryzen","series":"7950X",
  "cores":16,"threads":32,"base_clock":4.5,"max_clock":5.7,"cache":80,
  "socket":"AM5","graphics":true,"oc":true,"recommended_power":170,
  "avg_price":699.99,"release_date":"2022-09-27T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="7950X") | .id')"

CPU13_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"7","family":"Ryzen","series":"7700X",
  "cores":8,"threads":16,"base_clock":4.5,"max_clock":5.4,"cache":40,
  "socket":"AM5","graphics":true,"oc":true,"recommended_power":105,
  "avg_price":399.99,"release_date":"2022-09-27T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="7700X") | .id')"

CPU14_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"7","family":"Ryzen","series":"7600X",
  "cores":6,"threads":12,"base_clock":4.7,"max_clock":5.3,"cache":38,
  "socket":"AM5","graphics":true,"oc":true,"recommended_power":105,
  "avg_price":299.99,"release_date":"2022-09-27T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="7600X") | .id')"

CPU15_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"9","family":"Ryzen","series":"9800X3D",
  "cores":8,"threads":16,"base_clock":4.7,"max_clock":5.2,"cache":104,
  "socket":"AM5","graphics":true,"oc":true,"recommended_power":120,
  "avg_price":479.99,"release_date":"2024-11-07T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="9800X3D") | .id')"

CPU16_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"5","family":"Ryzen","series":"5600X",
  "cores":6,"threads":12,"base_clock":3.7,"max_clock":4.6,"cache":35,
  "socket":"AM4","graphics":false,"oc":true,"recommended_power":65,
  "avg_price":199.99,"release_date":"2020-11-05T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="5600X") | .id')"

CPU17_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"5","family":"Ryzen","series":"5950X",
  "cores":16,"threads":32,"base_clock":3.4,"max_clock":4.9,"cache":72,
  "socket":"AM4","graphics":false,"oc":true,"recommended_power":105,
  "avg_price":799.99,"release_date":"2020-11-05T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="5950X") | .id')"

CPU18_ID="$(create_or_find /hardware/cpus '{
  "brand":"AMD","gen":"5","family":"Ryzen","series":"5700X",
  "cores":8,"threads":16,"base_clock":3.4,"max_clock":4.6,"cache":36,
  "socket":"AM4","graphics":false,"oc":true,"recommended_power":65,
  "avg_price":199.99,"release_date":"2022-04-04T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="5700X") | .id')"

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

GPU3_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 4070",
  "memory_amount":12,"memory_gen":"GDDR6X","cores":5888,"pci_express":4,
  "recommended_power":650,"avg_price":599.99,"release_date":"2023-04-13T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 4070") | .id')"

GPU4_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 6700 XT",
  "memory_amount":12,"memory_gen":"GDDR6","cores":2560,"pci_express":4,
  "recommended_power":650,"avg_price":379.99,"release_date":"2021-03-18T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 6700 XT") | .id')"

GPU5_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 4090",
  "memory_amount":24,"memory_gen":"GDDR6X","cores":16384,"pci_express":4,
  "recommended_power":850,"avg_price":1599.99,"release_date":"2022-10-12T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 4090") | .id')"

GPU6_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 4070 Ti",
  "memory_amount":12,"memory_gen":"GDDR6X","cores":7680,"pci_express":4,
  "recommended_power":700,"avg_price":799.99,"release_date":"2023-01-05T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 4070 Ti") | .id')"

GPU7_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 4060 Ti",
  "memory_amount":8,"memory_gen":"GDDR6","cores":4352,"pci_express":4,
  "recommended_power":550,"avg_price":399.99,"release_date":"2023-05-24T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 4060 Ti") | .id')"

GPU8_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 4060",
  "memory_amount":8,"memory_gen":"GDDR6","cores":3072,"pci_express":4,
  "recommended_power":550,"avg_price":299.99,"release_date":"2023-06-29T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 4060") | .id')"

GPU9_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 3080",
  "memory_amount":10,"memory_gen":"GDDR6X","cores":8704,"pci_express":4,
  "recommended_power":750,"avg_price":699.99,"release_date":"2020-09-17T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 3080") | .id')"

GPU10_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 3070",
  "memory_amount":8,"memory_gen":"GDDR6","cores":5888,"pci_express":4,
  "recommended_power":650,"avg_price":499.99,"release_date":"2020-10-29T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 3070") | .id')"

GPU11_ID="$(create_or_find /hardware/gpus '{
  "brand":"NVIDIA","family":"GeForce","series":"RTX 3060",
  "memory_amount":12,"memory_gen":"GDDR6","cores":3584,"pci_express":4,
  "recommended_power":550,"avg_price":329.99,"release_date":"2021-02-25T00:00:00Z"
}' '.[] | select(.brand=="NVIDIA" and .series=="RTX 3060") | .id')"

GPU12_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 7900 XTX",
  "memory_amount":24,"memory_gen":"GDDR6","cores":6144,"pci_express":4,
  "recommended_power":800,"avg_price":999.99,"release_date":"2022-12-13T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 7900 XTX") | .id')"

GPU13_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 7900 XT",
  "memory_amount":20,"memory_gen":"GDDR6","cores":5376,"pci_express":4,
  "recommended_power":750,"avg_price":899.99,"release_date":"2022-12-13T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 7900 XT") | .id')"

GPU14_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 7700 XT",
  "memory_amount":12,"memory_gen":"GDDR6","cores":3456,"pci_express":4,
  "recommended_power":700,"avg_price":449.99,"release_date":"2023-09-06T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 7700 XT") | .id')"

GPU15_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 6800 XT",
  "memory_amount":16,"memory_gen":"GDDR6","cores":4608,"pci_express":4,
  "recommended_power":750,"avg_price":649.99,"release_date":"2020-11-18T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 6800 XT") | .id')"

GPU16_ID="$(create_or_find /hardware/gpus '{
  "brand":"AMD","family":"Radeon","series":"RX 6600",
  "memory_amount":8,"memory_gen":"GDDR6","cores":1792,"pci_express":4,
  "recommended_power":500,"avg_price":229.99,"release_date":"2021-10-13T00:00:00Z"
}' '.[] | select(.brand=="AMD" and .series=="RX 6600") | .id')"

log "Creating RAM kits..."
RAM1_ID="$(create_or_find /hardware/rams '{
  "brand":"Corsair","ddr":"DDR5","memory_amount":32,"avg_price":129.99,
  "frequency_mhz":6000,"series":"Vengeance"
}' '.[] | select(.brand=="Corsair" and .series=="Vengeance") | .id')"

RAM2_ID="$(create_or_find /hardware/rams '{
  "brand":"Kingston","ddr":"DDR4","memory_amount":16,"avg_price":59.99,
  "frequency_mhz":3200,"series":"Fury Beast"
}' '.[] | select(.brand=="Kingston" and .series=="Fury Beast") | .id')"

RAM3_ID="$(create_or_find /hardware/rams '{
  "brand":"Corsair","ddr":"DDR5","memory_amount":32,"avg_price":189.99,
  "frequency_mhz":6200,"series":"Dominator Platinum"
}' '.[] | select(.brand=="Corsair" and .series=="Dominator Platinum") | .id')"

RAM4_ID="$(create_or_find /hardware/rams '{
  "brand":"G.Skill","ddr":"DDR4","memory_amount":32,"avg_price":89.99,
  "frequency_mhz":3600,"series":"Ripjaws V"
}' '.[] | select(.brand=="G.Skill" and .series=="Ripjaws V") | .id')"

RAM5_ID="$(create_or_find /hardware/rams '{
  "brand":"G.Skill","ddr":"DDR5","memory_amount":32,"avg_price":199.99,
  "frequency_mhz":6400,"series":"Trident Z5"
}' '.[] | select(.brand=="G.Skill" and .series=="Trident Z5") | .id')"

RAM6_ID="$(create_or_find /hardware/rams '{
  "brand":"G.Skill","ddr":"DDR4","memory_amount":16,"avg_price":79.99,
  "frequency_mhz":3600,"series":"Trident Z RGB"
}' '.[] | select(.brand=="G.Skill" and .series=="Trident Z RGB") | .id')"

RAM7_ID="$(create_or_find /hardware/rams '{
  "brand":"Corsair","ddr":"DDR4","memory_amount":32,"avg_price":74.99,
  "frequency_mhz":3200,"series":"Vengeance LPX"
}' '.[] | select(.brand=="Corsair" and .series=="Vengeance LPX") | .id')"

RAM8_ID="$(create_or_find /hardware/rams '{
  "brand":"Kingston","ddr":"DDR5","memory_amount":32,"avg_price":134.99,
  "frequency_mhz":6000,"series":"Fury Renegade"
}' '.[] | select(.brand=="Kingston" and .series=="Fury Renegade") | .id')"

RAM9_ID="$(create_or_find /hardware/rams '{
  "brand":"Crucial","ddr":"DDR5","memory_amount":32,"avg_price":94.99,
  "frequency_mhz":5600,"series":"Pro"
}' '.[] | select(.brand=="Crucial" and .series=="Pro") | .id')"

RAM10_ID="$(create_or_find /hardware/rams '{
  "brand":"TeamGroup","ddr":"DDR5","memory_amount":32,"avg_price":119.99,
  "frequency_mhz":6000,"series":"T-Force Delta RGB"
}' '.[] | select(.brand=="TeamGroup" and .series=="T-Force Delta RGB") | .id')"

RAM11_ID="$(create_or_find /hardware/rams '{
  "brand":"G.Skill","ddr":"DDR5","memory_amount":32,"avg_price":109.99,
  "frequency_mhz":6000,"series":"Flare X5"
}' '.[] | select(.brand=="G.Skill" and .series=="Flare X5") | .id')"

RAM12_ID="$(create_or_find /hardware/rams '{
  "brand":"Patriot","ddr":"DDR4","memory_amount":16,"avg_price":64.99,
  "frequency_mhz":3600,"series":"Viper Steel"
}' '.[] | select(.brand=="Patriot" and .series=="Viper Steel") | .id')"

log "Creating motherboards..."
MB1_ID="$(create_or_find /hardware/motherboards '{
  "brand":"ASUS","series":"ROG STRIX Z790-E","socket":"LGA1700","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":7800,"m2_slots":5,
  "pci_express_x16":2,"vrm":20,"avg_price":499.99,"score":92
}' '.[] | select(.brand=="ASUS" and .series=="ROG STRIX Z790-E") | .id')"

MB2_ID="$(create_or_find /hardware/motherboards '{
  "brand":"MSI","series":"MAG B550 Tomahawk","socket":"AM4","ddr":"DDR4",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":4400,"m2_slots":2,
  "pci_express_x16":1,"vrm":12,"avg_price":179.99,"score":85
}' '.[] | select(.brand=="MSI" and .series=="MAG B550 Tomahawk") | .id')"

MB3_ID="$(create_or_find /hardware/motherboards '{
  "brand":"ASUS","series":"ROG STRIX X670E-E","socket":"AM5","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":8000,"m2_slots":5,
  "pci_express_x16":2,"vrm":18,"avg_price":499.99,"score":93
}' '.[] | select(.brand=="ASUS" and .series=="ROG STRIX X670E-E") | .id')"

MB4_ID="$(create_or_find /hardware/motherboards '{
  "brand":"Gigabyte","series":"B760M DS3H","socket":"LGA1700","ddr":"DDR4",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":5333,"m2_slots":2,
  "pci_express_x16":1,"vrm":8,"avg_price":109.99,"score":78
}' '.[] | select(.brand=="Gigabyte" and .series=="B760M DS3H") | .id')"

MB5_ID="$(create_or_find /hardware/motherboards '{
  "brand":"MSI","series":"MAG B650 Tomahawk","socket":"AM5","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":6600,"m2_slots":2,
  "pci_express_x16":1,"vrm":14,"avg_price":219.99,"score":86
}' '.[] | select(.brand=="MSI" and .series=="MAG B650 Tomahawk") | .id')"

MB6_ID="$(create_or_find /hardware/motherboards '{
  "brand":"ASUS","series":"TUF Gaming B760-PLUS","socket":"LGA1700","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":7200,"m2_slots":3,
  "pci_express_x16":1,"vrm":12,"avg_price":179.99,"score":82
}' '.[] | select(.brand=="ASUS" and .series=="TUF Gaming B760-PLUS") | .id')"

MB7_ID="$(create_or_find /hardware/motherboards '{
  "brand":"Gigabyte","series":"X670 AORUS Elite AX","socket":"AM5","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":6666,"m2_slots":4,
  "pci_express_x16":1,"vrm":16,"avg_price":259.99,"score":88
}' '.[] | select(.brand=="Gigabyte" and .series=="X670 AORUS Elite AX") | .id')"

MB8_ID="$(create_or_find /hardware/motherboards '{
  "brand":"MSI","series":"PRO B650-P","socket":"AM5","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":6400,"m2_slots":2,
  "pci_express_x16":1,"vrm":12,"avg_price":159.99,"score":80
}' '.[] | select(.brand=="MSI" and .series=="PRO B650-P") | .id')"

MB9_ID="$(create_or_find /hardware/motherboards '{
  "brand":"ASRock","series":"B550 Steel Legend","socket":"AM4","ddr":"DDR4",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":4733,"m2_slots":2,
  "pci_express_x16":1,"vrm":14,"avg_price":149.99,"score":81
}' '.[] | select(.brand=="ASRock" and .series=="B550 Steel Legend") | .id')"

MB10_ID="$(create_or_find /hardware/motherboards '{
  "brand":"ASUS","series":"ROG MAXIMUS Z790 HERO","socket":"LGA1700","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":7800,"m2_slots":5,
  "pci_express_x16":2,"vrm":20,"avg_price":629.99,"score":95
}' '.[] | select(.brand=="ASUS" and .series=="ROG MAXIMUS Z790 HERO") | .id')"

MB11_ID="$(create_or_find /hardware/motherboards '{
  "brand":"Gigabyte","series":"B650 AORUS Elite AX","socket":"AM5","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":6400,"m2_slots":3,
  "pci_express_x16":1,"vrm":16,"avg_price":209.99,"score":85
}' '.[] | select(.brand=="Gigabyte" and .series=="B650 AORUS Elite AX") | .id')"

MB12_ID="$(create_or_find /hardware/motherboards '{
  "brand":"MSI","series":"MPG X670E Carbon WiFi","socket":"AM5","ddr":"DDR5",
  "memory_slots":4,"max_ram":128,"max_ram_frequency_mhz":6600,"m2_slots":4,
  "pci_express_x16":2,"vrm":18,"avg_price":479.99,"score":91
}' '.[] | select(.brand=="MSI" and .series=="MPG X670E Carbon WiFi") | .id')"

log "Creating PSUs..."
PSU1_ID="$(create_or_find /hardware/psus '{
  "brand":"Corsair","series":"RM850x","power_amount":850,"ranking":"gold",
  "score":90,"eighty_plus_cert":true,"avg_price":139.99
}' '.[] | select(.brand=="Corsair" and .series=="RM850x") | .id')"

PSU2_ID="$(create_or_find /hardware/psus '{
  "brand":"EVGA","series":"SuperNOVA 750 G+","power_amount":750,"ranking":"gold",
  "score":88,"eighty_plus_cert":true,"avg_price":109.99
}' '.[] | select(.brand=="EVGA" and .series=="SuperNOVA 750 G+") | .id')"

PSU3_ID="$(create_or_find /hardware/psus '{
  "brand":"be quiet!","series":"Straight Power 11","power_amount":850,"ranking":"platinum",
  "score":95,"eighty_plus_cert":true,"avg_price":169.99
}' '.[] | select(.brand=="be quiet!" and .series=="Straight Power 11") | .id')"

PSU4_ID="$(create_or_find /hardware/psus '{
  "brand":"Cooler Master","series":"MWE 650","power_amount":650,"ranking":"bronze",
  "score":75,"eighty_plus_cert":true,"avg_price":69.99
}' '.[] | select(.brand=="Cooler Master" and .series=="MWE 650") | .id')"

PSU5_ID="$(create_or_find /hardware/psus '{
  "brand":"Corsair","series":"RM1000x","power_amount":1000,"ranking":"gold",
  "score":91,"eighty_plus_cert":true,"avg_price":189.99
}' '.[] | select(.brand=="Corsair" and .series=="RM1000x") | .id')"

PSU6_ID="$(create_or_find /hardware/psus '{
  "brand":"Seasonic","series":"Focus GX-850","power_amount":850,"ranking":"gold",
  "score":92,"eighty_plus_cert":true,"avg_price":149.99
}' '.[] | select(.brand=="Seasonic" and .series=="Focus GX-850") | .id')"

PSU7_ID="$(create_or_find /hardware/psus '{
  "brand":"Corsair","series":"HX1000","power_amount":1000,"ranking":"platinum",
  "score":94,"eighty_plus_cert":true,"avg_price":219.99
}' '.[] | select(.brand=="Corsair" and .series=="HX1000") | .id')"

PSU8_ID="$(create_or_find /hardware/psus '{
  "brand":"be quiet!","series":"Pure Power 12 M","power_amount":750,"ranking":"gold",
  "score":87,"eighty_plus_cert":true,"avg_price":119.99
}' '.[] | select(.brand=="be quiet!" and .series=="Pure Power 12 M") | .id')"

PSU9_ID="$(create_or_find /hardware/psus '{
  "brand":"Seasonic","series":"PRIME TX-1000","power_amount":1000,"ranking":"platinum",
  "score":96,"eighty_plus_cert":true,"avg_price":299.99
}' '.[] | select(.brand=="Seasonic" and .series=="PRIME TX-1000") | .id')"

PSU10_ID="$(create_or_find /hardware/psus '{
  "brand":"EVGA","series":"SuperNOVA 1000 P6","power_amount":1000,"ranking":"platinum",
  "score":93,"eighty_plus_cert":true,"avg_price":199.99
}' '.[] | select(.brand=="EVGA" and .series=="SuperNOVA 1000 P6") | .id')"

PSU11_ID="$(create_or_find /hardware/psus '{
  "brand":"Thermaltake","series":"Toughpower GF3","power_amount":850,"ranking":"gold",
  "score":89,"eighty_plus_cert":true,"avg_price":159.99
}' '.[] | select(.brand=="Thermaltake" and .series=="Toughpower GF3") | .id')"

PSU12_ID="$(create_or_find /hardware/psus '{
  "brand":"Cooler Master","series":"V850 Gold V2","power_amount":850,"ranking":"gold",
  "score":90,"eighty_plus_cert":true,"avg_price":129.99
}' '.[] | select(.brand=="Cooler Master" and .series=="V850 Gold V2") | .id')"

log "Creating SSDs..."
SSD1_ID="$(create_or_find /hardware/ssds '{
  "brand":"Samsung","series":"990 Pro","amount":2000,"type":"M2 NVMe",
  "reading":7450,"writing":6900,"avg_price":169.99,"score":95
}' '.[] | select(.brand=="Samsung" and .series=="990 Pro") | .id')"

SSD2_ID="$(create_or_find /hardware/ssds '{
  "brand":"Western Digital","series":"Black SN850X","amount":1000,"type":"M2 NVMe",
  "reading":7300,"writing":6300,"avg_price":99.99,"score":93
}' '.[] | select(.brand=="Western Digital" and .series=="Black SN850X") | .id')"

SSD3_ID="$(create_or_find /hardware/ssds '{
  "brand":"Crucial","series":"MX500","amount":1000,"type":"SATA",
  "reading":560,"writing":510,"avg_price":59.99,"score":80
}' '.[] | select(.brand=="Crucial" and .series=="MX500") | .id')"

SSD4_ID="$(create_or_find /hardware/ssds '{
  "brand":"Kingston","series":"KC3000","amount":2000,"type":"M2 NVMe",
  "reading":7000,"writing":7000,"avg_price":149.99,"score":92
}' '.[] | select(.brand=="Kingston" and .series=="KC3000") | .id')"

SSD5_ID="$(create_or_find /hardware/ssds '{
  "brand":"Samsung","series":"980 Pro","amount":1000,"type":"M2 NVMe",
  "reading":7000,"writing":5000,"avg_price":99.99,"score":92
}' '.[] | select(.brand=="Samsung" and .series=="980 Pro") | .id')"

SSD6_ID="$(create_or_find /hardware/ssds '{
  "brand":"Western Digital","series":"Black SN770","amount":1000,"type":"M2 NVMe",
  "reading":5150,"writing":4900,"avg_price":79.99,"score":88
}' '.[] | select(.brand=="Western Digital" and .series=="Black SN770") | .id')"

SSD7_ID="$(create_or_find /hardware/ssds '{
  "brand":"Crucial","series":"T700","amount":2000,"type":"M2 NVMe",
  "reading":12400,"writing":11800,"avg_price":209.99,"score":96
}' '.[] | select(.brand=="Crucial" and .series=="T700") | .id')"

SSD8_ID="$(create_or_find /hardware/ssds '{
  "brand":"Samsung","series":"870 EVO","amount":1000,"type":"SATA",
  "reading":560,"writing":530,"avg_price":79.99,"score":82
}' '.[] | select(.brand=="Samsung" and .series=="870 EVO") | .id')"

SSD9_ID="$(create_or_find /hardware/ssds '{
  "brand":"Seagate","series":"FireCuda 530","amount":1000,"type":"M2 NVMe",
  "reading":7300,"writing":6000,"avg_price":119.99,"score":93
}' '.[] | select(.brand=="Seagate" and .series=="FireCuda 530") | .id')"

SSD10_ID="$(create_or_find /hardware/ssds '{
  "brand":"SK Hynix","series":"Platinum P41","amount":1000,"type":"M2 NVMe",
  "reading":7000,"writing":6500,"avg_price":99.99,"score":92
}' '.[] | select(.brand=="SK Hynix" and .series=="Platinum P41") | .id')"

SSD11_ID="$(create_or_find /hardware/ssds '{
  "brand":"Crucial","series":"P5 Plus","amount":1000,"type":"M2 NVMe",
  "reading":6600,"writing":5000,"avg_price":79.99,"score":89
}' '.[] | select(.brand=="Crucial" and .series=="P5 Plus") | .id')"

SSD12_ID="$(create_or_find /hardware/ssds '{
  "brand":"Corsair","series":"MP600 Pro","amount":1000,"type":"M2 NVMe",
  "reading":7000,"writing":5700,"avg_price":109.99,"score":90
}' '.[] | select(.brand=="Corsair" and .series=="MP600 Pro") | .id')"

log "Creating games..."
GAME1_ID="$(create_or_find /games '{"name":"Cyberpunk 2077","necessary_disk":70}' \
  '.[] | select(.name=="Cyberpunk 2077") | .id')"
GAME2_ID="$(create_or_find /games '{"name":"Counter-Strike 2","necessary_disk":85}' \
  '.[] | select(.name=="Counter-Strike 2") | .id')"
GAME3_ID="$(create_or_find /games '{"name":"Elden Ring","necessary_disk":60}' \
  '.[] | select(.name=="Elden Ring") | .id')"
GAME4_ID="$(create_or_find /games '{"name":"Baldur'"'"'s Gate 3","necessary_disk":150}' \
  '.[] | select(.name=="Baldur'"'"'s Gate 3") | .id')"
GAME5_ID="$(create_or_find /games '{"name":"Red Dead Redemption 2","necessary_disk":150}' \
  '.[] | select(.name=="Red Dead Redemption 2") | .id')"
GAME6_ID="$(create_or_find /games '{"name":"The Witcher 3","necessary_disk":50}' \
  '.[] | select(.name=="The Witcher 3") | .id')"
GAME7_ID="$(create_or_find /games '{"name":"Starfield","necessary_disk":125}' \
  '.[] | select(.name=="Starfield") | .id')"
GAME8_ID="$(create_or_find /games '{"name":"Hogwarts Legacy","necessary_disk":85}' \
  '.[] | select(.name=="Hogwarts Legacy") | .id')"
GAME9_ID="$(create_or_find /games '{"name":"Call of Duty: Modern Warfare III","necessary_disk":149}' \
  '.[] | select(.name=="Call of Duty: Modern Warfare III") | .id')"
GAME10_ID="$(create_or_find /games '{"name":"Alan Wake 2","necessary_disk":90}' \
  '.[] | select(.name=="Alan Wake 2") | .id')"
GAME11_ID="$(create_or_find /games '{"name":"Forza Horizon 5","necessary_disk":110}' \
  '.[] | select(.name=="Forza Horizon 5") | .id')"
GAME12_ID="$(create_or_find /games '{"name":"Microsoft Flight Simulator","necessary_disk":150}' \
  '.[] | select(.name=="Microsoft Flight Simulator") | .id')"
GAME13_ID="$(create_or_find /games '{"name":"Helldivers 2","necessary_disk":100}' \
  '.[] | select(.name=="Helldivers 2") | .id')"
GAME14_ID="$(create_or_find /games '{"name":"God of War Ragnarok","necessary_disk":120}' \
  '.[] | select(.name=="God of War Ragnarok") | .id')"
GAME15_ID="$(create_or_find /games '{"name":"Black Myth: Wukong","necessary_disk":130}' \
  '.[] | select(.name=="Black Myth: Wukong") | .id')"
GAME16_ID="$(create_or_find /games '{"name":"Marvel'"'"'s Spider-Man 2","necessary_disk":140}' \
  '.[] | select(.name=="Marvel'"'"'s Spider-Man 2") | .id')"

log "Creating benchmarks..."

# Helper so each benchmark is one readable call. Args, in order:
#   title resolution quality cpu_id gpu_id ram_id avg min max game_id score
benchmark() {
  post /benchmarks "$(jq -n \
    --arg title "$1" --argjson resolution "$2" --arg quality "$3" \
    --arg cpu "$4" --arg gpu "$5" --arg ram "$6" \
    --argjson avg "$7" --argjson min "$8" --argjson max "$9" \
    --arg game "${10}" --arg user "$USER_ID" --argjson score "${11}" \
    '{title:$title, resolution:$resolution, graphics_quality:$quality,
      cpu_id:$cpu, gpu_id:$gpu, ram_id:$ram, avg_fps:$avg, min_fps:$min, max_fps:$max,
      game_id:$game, user_id:$user, score:$score}')" >/dev/null
}

# --- Flagship 4K (RTX 4090 / RX 7900 XTX class) ---
benchmark "Cyberpunk 2077 - 2160p Ultra"        2160 "ultra"  "$CPU15_ID" "$GPU5_ID"  "$RAM5_ID"  92  74  108 "$GAME1_ID"  90
benchmark "Red Dead Redemption 2 - 2160p Ultra" 2160 "ultra"  "$CPU12_ID" "$GPU5_ID"  "$RAM5_ID"  98  82  115 "$GAME5_ID"  91
benchmark "Alan Wake 2 - 2160p High"            2160 "high"   "$CPU15_ID" "$GPU5_ID"  "$RAM5_ID"  76  61  88  "$GAME10_ID" 87
benchmark "Black Myth: Wukong - 2160p High"     2160 "high"   "$CPU3_ID"  "$GPU12_ID" "$RAM1_ID"  72  58  84  "$GAME15_ID" 85

# --- High-end 1440p (RTX 4080 / 4070 Ti / RX 7900 XT class) ---
benchmark "Cyberpunk 2077 - 1440p Ultra"        1440 "ultra"  "$CPU1_ID"  "$GPU1_ID"  "$RAM1_ID"  118 95  140 "$GAME1_ID"  90
benchmark "Elden Ring - 1440p Maxed"            1440 "ultra"  "$CPU3_ID"  "$GPU1_ID"  "$RAM5_ID"  60  58  60  "$GAME3_ID"  88
benchmark "Hogwarts Legacy - 1440p Ultra"       1440 "ultra"  "$CPU13_ID" "$GPU6_ID"  "$RAM11_ID" 96  72  118 "$GAME8_ID"  86
benchmark "Starfield - 1440p High"              1440 "high"   "$CPU5_ID"  "$GPU13_ID" "$RAM3_ID"  84  66  98  "$GAME7_ID"  82
benchmark "Spider-Man 2 - 1440p Very High"      1440 "ultra"  "$CPU6_ID"  "$GPU6_ID"  "$RAM5_ID"  104 84  126 "$GAME16_ID" 88
benchmark "God of War Ragnarok - 1440p Ultra"   1440 "ultra"  "$CPU3_ID"  "$GPU2_ID"  "$RAM1_ID"  110 90  132 "$GAME14_ID" 89

# --- Competitive / high-refresh 1080p ---
benchmark "Counter-Strike 2 - 1080p High"       1080 "high"   "$CPU15_ID" "$GPU5_ID"  "$RAM5_ID"  480 360 560 "$GAME2_ID"  96
benchmark "Counter-Strike 2 - 1080p High"       1080 "high"   "$CPU2_ID"  "$GPU2_ID"  "$RAM2_ID"  300 220 360 "$GAME2_ID"  93
benchmark "Helldivers 2 - 1080p High"           1080 "high"   "$CPU13_ID" "$GPU3_ID"  "$RAM11_ID" 132 98  150 "$GAME13_ID" 87

# --- Mainstream 1080p (RTX 4060 / RX 7700 XT / 3060 class) ---
benchmark "Cyberpunk 2077 - 1080p High"         1080 "high"   "$CPU7_ID"  "$GPU8_ID"  "$RAM6_ID"  78  60  92  "$GAME1_ID"  80
benchmark "Elden Ring - 1080p High"             1080 "high"   "$CPU16_ID" "$GPU11_ID" "$RAM4_ID"  60  55  60  "$GAME3_ID"  78
benchmark "The Witcher 3 - 1080p Ultra"         1080 "ultra"  "$CPU16_ID" "$GPU11_ID" "$RAM6_ID"  96  72  118 "$GAME6_ID"  82
benchmark "Forza Horizon 5 - 1080p Ultra"       1080 "ultra"  "$CPU14_ID" "$GPU14_ID" "$RAM9_ID"  124 98  146 "$GAME11_ID" 85
benchmark "Baldur's Gate 3 - 1080p High"        1080 "high"   "$CPU9_ID"  "$GPU7_ID"  "$RAM7_ID"  96  72  120 "$GAME4_ID"  83

# --- Budget / entry (RX 6600 / i3 / older parts) ---
benchmark "Counter-Strike 2 - 1080p Medium"     1080 "medium" "$CPU10_ID" "$GPU16_ID" "$RAM2_ID"  180 130 220 "$GAME2_ID"  76
benchmark "Baldur's Gate 3 - 1080p Low"         1080 "low"    "$CPU4_ID"  "$GPU4_ID"  "$RAM4_ID"  68  46  82  "$GAME4_ID"  72
benchmark "Forza Horizon 5 - 1080p High"        1080 "high"   "$CPU18_ID" "$GPU10_ID" "$RAM12_ID" 102 78  120 "$GAME11_ID" 80
benchmark "Microsoft Flight Sim - 1080p Medium" 1080 "medium" "$CPU8_ID"  "$GPU9_ID"  "$RAM3_ID"  58  42  72  "$GAME12_ID" 77

log "Done. Seeded admin user, hardware (cpus, gpus, rams, motherboards, psus, ssds), games and benchmarks."