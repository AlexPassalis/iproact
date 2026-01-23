.PHONY: defualt start_dev start

default: start

show_git_crypt:
	git-crypt status -e

start_dev:
	docker build -t image-iproact-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build --target dev -t image-iproact-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	# docker network create -d overlay network-iproact
	docker stack deploy -c ./docker-stack.yaml -c ./docker-stack-dev.yaml --detach=false --with-registry-auth stack-iproact

start:
	docker build -t image-iproact-postgres -f ./services/postgres/Dockerfile ./services/postgres
	docker build -t image-iproact-nextjs -f ./services/nextjs/Dockerfile ./services/nextjs
	# docker network create -d overlay network-iproact
	docker stack deploy -c ./docker-stack.yaml --detach=false --with-registry-auth stack-iproact

stop:
	docker stack rm stack-iproact
