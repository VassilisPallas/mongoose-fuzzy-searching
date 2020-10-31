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
	@[ "$(VERSIONING)" ] || (echo ">> Semantic versioning is not set"; exit 1)
	npm version $(VERSIONING)
	git tag
	git push --follow-tags

.PHONY: help
help: ## parse jobs and descriptions from this Makefile
	@grep -E '^[ a-zA-Z0-9_-]+:([^=]|$$)' $(MAKEFILE_LIST) \
		| grep -Ev '^(help)\b[[:space:]]*:' \
		| awk 'BEGIN {FS = ":.*?##"}; {printf "\033[36m%20s\033[0m \t%s\n", $$1, $$2}'