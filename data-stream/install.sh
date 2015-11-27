set -e

# scripts
cp skyhawq.sh /etc/skyhawq/
cp skyhawq-init.d.sh /etc/init.d/skyhawq

# binaries
cd gps-dumper
make
mkdir -p /etc/skyhawq
cp gps /etc/skyhawq

echo "Now run /etc/init.d/skyhawq start|stop|restart";