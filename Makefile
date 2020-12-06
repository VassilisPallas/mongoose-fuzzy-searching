.DEFAULT_GOAL := help

.PHONY: validate-circle-ci-docker
validate-circle-ci-docker: ## Validates the Circle CI config at .circleci/config.yaml using docker image e.g. make validate-circle-ci TOKEN=<TOKEN>
	@[ "$(TOKEN)" ] || (echo ">> CircleCI Token is not set"; exit 1)
	docker run --rm -v $(shell pwd):/data circleci/circleci-cli:alpine config validate /data/.circleci/config.yml --token $(TOKEN)

.PHONY: validate-circle-ci-local
validate-circle-ci-local: ## Validates the Circle CI config at .circleci/config.yaml using the local cli
	circleci config validate

.PHONY: update-version
update-version: ## Increase npm version using semantic versioning e.g. make update-version VERSIONING=major|minor|patch
ifneq ($(shell git rev-parse --abbrev-ref HEAD),master)
	@echo ">> Branch is not master";
	exit 1;
endif
	@[ "$(VERSIONING)" ] || (echo ">> Semantic versioning is not set"; exit 1)
	git pull origin master
	npm version $(VERSIONING)
	git tag
	git push --follow-tags

.PHONY: publish
publish: ## Publish to npm
	@[ "$(NPM_TOKEN)" ] || (echo ">> npm token is not set"; exit 1)
	npm run build
	echo //registry.npmjs.org/:_authToken="$(NPM_TOKEN)" > ~/.npmrc
	npm publish

.PHONY: configure-git-user
configure-git-user: ## Configure git user
	@[ "$(GIT_EMAIL)" ] || (echo ">> email is not set"; exit 1)
	@[ "$(GIT_USERNAME)" ] || (echo ">> name is not set"; exit 1)
	git config --global user.email "$(GIT_EMAIL)"
	git config --global user.name "$(GIT_USERNAME)"

.PHONY: help
help: ## parse jobs and descriptions from this Makefile
	@grep -E '^[ a-zA-Z0-9_-]+:([^=]|$$)' $(MAKEFILE_LIST) \
		| grep -Ev '^(help)\b[[:space:]]*:' \
		| awk 'BEGIN {FS = ":.*?##"}; {printf "\033[36m%20s\033[0m \t%s\n", $$1, $$2}'