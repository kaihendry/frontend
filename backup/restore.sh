#!/bin/bash

STAGE=dev

show_help() {
cat << EOF
Usage: ${0##*/} [-p]

By default, deploy to dev environment on AWS account 812644853088

	-p          PRODUCTION 192458993663
	-d          DEMO 915001051872
	-l          localhost

EOF
}

while getopts "pdl" opt
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
		l)
			echo "localhost" >&2
			STAGE=localhost
			;;
		*)
			show_help >&2
			exit 1
			;;
	esac
done
AWS_PROFILE=uneet-$STAGE
shift "$((OPTIND-1))"   # Discard the options and sentinel --

dir="$1"
if ! test -d "$dir"
then
	echo Please supply a backup directory argument
	exit
fi

if test $AWS_PROFILE == uneet-localhost
then
	# assuming you're running meteor locally, port is 3001 oddly
	mongorestore -h 127.0.0.1 --drop --port 3001 $dir
else
	MONGO_PASSWORD=$(aws --profile $AWS_PROFILE ssm get-parameters --names MONGO_PASSWORD --with-decryption --query Parameters[0].Value --output text)
	MONGO_CONNECT=$(aws --profile $AWS_PROFILE ssm get-parameters --names MONGO_CONNECT --query Parameters[0].Value --output text)
	mongorestore --drop --uri="mongodb://root:$MONGO_PASSWORD@$MONGO_CONNECT" $dir
fi
