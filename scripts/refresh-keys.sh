#!/usr/bin/env bash

set -euo pipefail

envs=(dev staging prod)

# TODO: Move this to cm-env
for env in "${envs[@]}"; do
  echo "Refreshing keys for $env environment..."

  case "$env" in
    dev) key_file=".development.key" ;;
    staging) key_file=".staging.key" ;;
    prod) key_file=".production.key" ;;
    *)
      echo "Error: Unknown environment '$env'." >&2
      exit 1
      ;;
  esac
  if [[ ! -f $key_file ]]; then
    echo "Error: Key file '$key_file' for environment '$env' does not exist." >&2
    exit 1
  fi

  if ! npm run decrypt-${env}; then
    echo "Error: Failed to decrypt env for environment '$env'." >&2
    exit 1
  fi

  rm -f "$key_file"

  if ! cm-env setup ${env}; then
    echo "Error: Failed to generate new key for environment '$env'." >&2
    exit 1
  fi

  if ! npm run encrypt-${env}; then
    echo "Error: Failed to encrypt env for environment '$env'." >&2
    exit 1
  fi
done

echo "All keys refreshed successfully. Please share the new keys with the team."
echo "Note: Ensure that the new keys are securely shared with the team and not committed to version control."