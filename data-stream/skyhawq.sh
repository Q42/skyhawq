#!/bin/sh

# GPS
mkdir -p /var/skyhawq
cd /var/skyhawq
/etc/skyhawq/gps &

# Photos
while true
do
	# date
	date=`date +"%y%m%d-%H%M%S"`
	# make photo
	raspistill --quality 60 --timeout 10 --encoding jpg -sh 0 -co 0 -br 50 -sa 0 -ev 0 --exposure snow --awb sun --ISO 200 --metering average --nopreview --output $date.jpg
	# sleep
	sleep 1
done