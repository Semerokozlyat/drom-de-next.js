.PHONY: test-docker-env
test-docker-env:
	./testenv/docker/run_env.sh

.PHONY: run-backend
run-backend:
	go run main.go

# Front-end app commands

.PHONY: lint-frontend
lint-frontend:
	cd ./ui/drom-de-nextjs && pnpm lint


.PHONY: run-frontend
run-frontend:
	cd ./ui/drom-de-nextjs && pnpm run dev

.PHONY: build-frontend
build-frontend:
	cd ./ui/drom-de-nextjs && pnpm run build

.PHONY: run-app
run-app: run-backend run-frontend

# Front-end development environment commands

.PHONY: test-api-server
test-api-server:
	cd ./ui/drom-de-nextjs && json-server --watch ./app/lib/placeholder-data.json --port 8000