.PHONY: defualt start_dev start

default: start

start_dev:
	docker build -t image-iproact-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build --target dev -t image-iproact-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	docker build -t image-iproact-n8n -f ./services/n8n/Dockerfile ./services/n8n
	# docker network create -d overlay network-iproact
	docker stack deploy -c ./docker-stack-dev.yaml --detach=false --with-registry-auth stack-iproact

start:
	docker build -t image-iproact-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build -t image-iproact-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	docker build -t image-iproact-n8n -f ./services/n8n/Dockerfile ./services/n8n
	# docker network create -d overlay network-iproact
	docker stack deploy -c ./docker-stack.yaml --detach=false --with-registry-auth stack-iproact
