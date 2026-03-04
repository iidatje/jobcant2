.PHONY: build up down shell end

# デフォルト引数
MSG ?=
DRY ?= false
CAL ?= false
HEADED ?=

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

bash:
	docker exec -it jobcant2 bash

run:
	docker exec -it jobcant2 bash

run-headed:
	docker exec \
		-e JC_DRYRUN=$(DRY) \
        -e DISPLAY=$$DISPLAY \
		-w /app \
		-t jobcant2 \
		npx playwright test --headed dakoku.js

# 退勤スクリプト実行
# 使用例: make end MSG="お疲れ様でした" DRY=true
end:
	docker compose run --rm \
		-e JC_MSG="$(MSG)" \
		-e JC_DRYRUN=$(DRY) \
		-e JC_CALENDAR_SYNC=$(CAL) \
		jobcant \
		yarn playwright test src/dakoku.js $(if $(HEADED),--headed,)
