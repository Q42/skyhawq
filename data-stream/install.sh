set -e

mkdir -p /etc/skyhawq

# scripts
cp skyhawq.sh /etc/skyhawq/
cp skyhawq-init.d.sh /etc/init.d/skyhawq
chmod +x /etc/skyhawq/skyhawq.sh
chmod +x /etc/init.d/skyhawq

# binaries
cd gps-dumper
make
cp gps /etc/skyhawq

echo "Now run /etc/init.d/skyhawq start|stop|restart";