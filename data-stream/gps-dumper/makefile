CC=g++
CFLAGS=-c -Wall
NAVIO = ../Navio
INCLUDES = -I ../

all: gps original

gps: gps.o Ublox.o
	$(CC) gps.o Ublox.o -o gps

original: original.o Ublox.o
	$(CC) original.o Ublox.o -o original

gps.o: gps.cpp
	$(CC) $(INCLUDES) $(CFLAGS) gps.cpp

original.o: original.cpp
	$(CC) $(INCLUDES) $(CFLAGS) original.cpp

Ublox.o: $(NAVIO)/Ublox.cpp
	$(CC) $(INCLUDES) $(CFLAGS) $(NAVIO)/Ublox.cpp

clean:
	rm -rf *.o gps original
