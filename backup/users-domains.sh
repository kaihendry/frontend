#!/bin/bash

STAGE=dev

show_help() {
cat << EOF
Usage: ${0##*/} [-p]

By default, deploy to dev environment on AWS account 812644853088

	-p          PRODUCTION 192458993663
	-d          DEMO 915001051872

EOF
}

while getopts "pd" opt
do
	case $opt in
		p)
			echo "PRODUCTION" >&2
			STAGE=prod
			;;
		d)
			echo "DEMO" >&2
			STAGE=demo
			;;
		*)
			show_help >&2
			exit 1
			;;
	esac
done
AWS_PROFILE=uneet-$STAGE
shift "$((OPTIND-1))"   # Discard the options and sentinel --

MONGO_PASSWORD=$(aws --profile $AWS_PROFILE ssm get-parameters --names MONGO_PASSWORD --with-decryption --query Parameters[0].Value --output text)
MONGO_CONNECT=$(aws --profile $AWS_PROFILE ssm get-parameters --names MONGO_CONNECT --query Parameters[0].Value --output text)

mongoexport --collection users --uri "mongodb://root:$MONGO_PASSWORD@$MONGO_CONNECT" --pretty --fields emails \
	-q '{ "emails.0.verified": true }' \
	-o users.json

jq -r .emails[].address users.json | cut -d @ -f 2 | sort | uniq -c | sort -rn
echo "Total: $(jq -n '[inputs]|length' users.json)"
