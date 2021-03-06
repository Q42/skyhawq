set -e

mkdir -p /etc/skyhawq

# scripts
cp skyhawq.sh /etc/skyhawq/
cp skyhawq-init.d.sh /etc/init.d/skyhawq
chmod +x /etc/skyhawq/skyhawq.sh
chmod +x /etc/init.d/skyhawq
chown root:root /etc/init.d/skyhawq

# install network up script
cp skyhawq.upload.sh /etc/network/if-up.d/skyhawq.upload.sh
chmod +x /etc/network/if-up.d/skyhawq.upload.sh

# binaries
cd gps-dumper
make
cp gps /etc/skyhawq

sudo update-rc.d skyhawq defaults
sudo update-rc.d skyhawq enable

echo "Now run /etc/init.d/skyhawq start|stop|restart";