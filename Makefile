.PHONY: help dev build up down logs clean

help:
	@echo "Sistem-Agent — available commands:"
	@echo "  make dev       Start backend + frontend in dev mode"
	@echo "  make up        Start all services with Docker Compose"
	@echo "  make down      Stop all services"
	@echo "  make build     Build production Docker images"
	@echo "  make logs      Tail logs from all services"
	@echo "  make clean     Remove containers, volumes, and images"

dev:
	@echo "Starting dev servers..."
	@cd backend && npm run dev &
	@cd frontend && npm run dev

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

clean:
	docker compose down -v --rmi local
