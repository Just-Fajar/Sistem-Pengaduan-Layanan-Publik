.PHONY: test test-backend build build-backend build-frontend docker-up docker-down clean help

help:
	@echo "Available commands:"
	@echo "  make test          - Run all backend tests with coverage"
	@echo "  make build         - Build backend binary and frontend bundle"
	@echo "  make docker-up     - Start all local containers (MySQL, Backend, Frontend)"
	@echo "  make docker-down   - Stop all local containers"
	@echo "  make clean         - Clean build artifacts"

test: test-backend

test-backend:
	cd backend && go test -v -cover ./...

build: build-backend build-frontend

build-backend:
	cd backend && go build -o pengaduan-api cmd/main.go

build-frontend:
	cd frontend && npm run build

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

clean:
	rm -f backend/pengaduan-api backend/pengaduan-api.exe
	rm -rf frontend/dist
