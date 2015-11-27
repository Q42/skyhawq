#!/bin/sh

### BEGIN INIT INFO
# Provides:          skyhawq
# Required-Start:    $local_fs $remote_fs $network $syslog $named
# Required-Stop:     $local_fs $remote_fs $network $syslog $named
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# X-Interactive:     true
# Short-Description: Start/stop SkyHawq process
### END INIT INFO

# Quick start-stop-daemon example, derived from Debian /etc/init.d/ssh
set -e

# Must be a valid filename
NAME=skyhawq
USER=pi
BASE=/etc/skyhawq;
START=skyhawq.sh;
LOG=/var/log/skyhawq.log;
PID=/var/run/skyhawq.pid;

case "$1" in
  start)
	mkdir -p /var/run/skyhawq/photos;
    echo -e "Starting $NAME";
	cd $BASE;
	sudo -b -u $USER $START > $LOG & echo $! > $PID;
	echo "Done!"
	;;
  stop)
    if [ -f "$PID" ]
	then
	echo -e "Stopping daemon: $NAME";
	kill `cat $PID`
    echo "Stopping done!"
	else
	echo -e "$NAME is not started (PID not found)"
	fi
	;;
  restart)
    echo -e "Restarting daemon: $NAME";
    $0 stop
    $0 start
	echo "Restarting done!"
	;;
  *)
	echo "Usage: "$1" {start|stop|restart}"
	exit 1
esac

exit 0