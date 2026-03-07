
OS := $(shell uname -s)

ifeq ($(OS),Darwin)
  PROFILE := macos
  SERVICE := jobcant2
  # XQuartz: Preferences > Security > "Allow connections from network clients" を有効にしておく
  OPEN_XHOST  := @DISPLAY=$${DISPLAY:-:0} xhost + 127.0.0.1
  CLOSE_XHOST := @DISPLAY=$${DISPLAY:-:0} xhost - 127.0.0.1
else
  PROFILE := wslg
  SERVICE := jobcant2-wslg
  OPEN_XHOST  :=
  CLOSE_XHOST :=
endif

.PHONY: build up down bash run-headed

# デフォルト引数
MSG ?=
DRY ?= false
CAL ?= false
HEADED ?=

build:
	docker compose build $(SERVICE)

up:
	docker compose --profile $(PROFILE) up -d $(SERVICE)

down:
	docker compose down

bash:
	docker exec -it $(SERVICE) bash

run-headed:
	docker compose --profile $(PROFILE) up -d $(SERVICE)
	$(OPEN_XHOST)
	docker compose exec \
		-e JC_DRYRUN=$(DRY) \
		-w /app \
		$(SERVICE) \
		npx playwright test --headed dakoku.js
	$(CLOSE_XHOST)
