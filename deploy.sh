#!/usr/bin/env bash

cd "${BASH_SOURCE%/*}" || exit

if [ -f .deployenv ]; then
	eval $(cat .deployenv)
else
	echo "echo \"No .deployenv found. Using parent environment.\""
fi

echo "Linting site..."

if npm run lint; then
	echo "Lint passed."
else
	echo "Lint failed."
	exit 1
fi

echo "Rebuilding site..."

export PUBLIC_PATH

if npm run build; then
	echo "Rebuilt site!"
else
	echo "Build error."
	exit 1
fi

if [[ $* == *--no-deploy* ]]; then
	echo "No deploy."
	exit 0
fi

echo "Deploying site..."

if lftp -c "open --password $PASSWORD sftp://$USER@$HOST:$PORT; mirror -c -e -R -L ./dist -x .htaccess $TARGET"; then
	echo "Page deployed!"
else
	echo "Error while deploying."
	exit 1
fi

echo "Refreshing cache..."

if curl -X PURGE $PURGE_URL; then
	echo "Refreshed cache."
else
	echo "Cache refresh error."
	exit 1
fi
