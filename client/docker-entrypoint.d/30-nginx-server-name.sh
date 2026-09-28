#!/bin/sh
set -eu

# Render the site config from a pristine template on every container start.
# This keeps gateway Host rewrites working while avoiding in-place edits of the
# active nginx config across restarts.
template=/etc/nginx/mws-website-site.conf.template
conf=/etc/nginx/conf.d/default.conf

cp "$template" "$conf"

runtime_host="$(printf '%s' "${MWS_WEBSITE_PUBLIC_URL:-}" | sed -E 's#^[a-zA-Z]+://##; s#[:/].*##')"
default_hosts="millenniaws.sch.id www.millenniaws.sch.id localhost"

if [ -n "$runtime_host" ]; then
  case " $default_hosts " in
    *" $runtime_host "*) server_names="$default_hosts" ;;
    *) server_names="$runtime_host $default_hosts" ;;
  esac
  sed -i "s/server_name _;/server_name $server_names;/" "$conf"
fi

grep -q 'listen 80' "$conf"
