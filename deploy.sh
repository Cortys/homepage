#!/usr/bin/env bash

cd "${BASH_SOURCE%/*}" || exit

eval $(cat .ftpenv)

echo "Rebuilding site..."

if npm run build; then
	echo "Rebuilt site!"
else
	echo "Build error."
	exit 1
fi

echo "Deploying site..."

if lftp -c "open --password $PASSWORD sftp://$USER@$HOST:$PORT; mirror -c -e -R -L ./dist $TARGET"; then
	echo "Page deployed!"
else
	echo "Error while deploying."
	exit 1
fi
