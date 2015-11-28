# Ran when internet comes up

# Abort if it is not eth0 that came up
if [[ "$IFACE" -ne "eth0" ]]; then
	exit 0;
fi

# Upload NOW

exit 0;

photos=`ls /var/skyhawq/*.jpg`
md5=`md5sum $filename | head -n1 | sed -e 's/\s.*$//'`

# Upload files this way:
flightId=`date +"%y%m%d-%H%M%S"`
curl \
	-H "Secret: $SECRET" \
  -H "Etag: $md5" \
  -F "$filename=@$filename" \
 "http://greenpeace.hermanbanken.nl/upload/$flightId"
