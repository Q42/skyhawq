# Ran when internet comes up

# Abort if it is not eth0 that came up
if [[ "$IFACE" -ne "eth0" ]]; then
	exit 0;
fi

# Upload NOW
